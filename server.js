var express = require("express")
var app = express()

app.use(express.static("static"))
app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({
    extended: true
}));

const PORT = 3000
const sessions = []
let total_logs = 0

//handling fetch || logging users

app.post("/JOIN_GAME", (req, res) => {

    login(req, res)

})

//login users

async function login(req, res) {

    let data = JSON.parse(req.body)

    //log into an open session

    if (data.type == "open") {

        for (let i = 0; i < sessions.length; i++) {
            if (sessions[i].type == "open" && sessions[i].user2 == null) {
                if (sessions[i].user1 == data.username) {
                    res.send({ taken: true })
                    return null
                }
                sessions[i].user2 = data.username
                res.send(sessions[i])
                return null
            }
        }

        //create new open session


        let id = await id_generator(5)
        if (data.id != null) id = data.id

        sessions.push({
            type: "open",
            time: Date.now(),
            id: id,
            user1: data.username,
            user2: null,
            move: null,
            last_sent: null
        })

        let output = null

        for (let i = 0; i < sessions.length; i++) {
            if (sessions[i].id == id) {
                output = sessions[i]
            }
        }

        res.send(output)
    }

    //log into a private session

    else if (data.type = "private") {

        for (let i = 0; i < sessions.length; i++) {
            if (sessions[i].id == data.id) {
                if (sessions[i].user1 == data.username || sessions[i].user2 == data.username) {
                    res.send({ taken: true })
                    return null
                }
                if (sessions[i].user2 == null) {
                    sessions[i].user2 = data.username
                }
                res.send(sessions[i])
                return null
            }
        }

        //create new private session (id not recognised)

        sessions.push({
            type: "private",
            time: Date.now(),
            id: data.id,
            user1: data.username,
            user2: null,
            move: null,
            last_sent: null
        })

        let output = null

        for (let i = 0; i < sessions.length; i++) {
            if (sessions[i].id == data.id) {
                output = sessions[i]
            }
        }

        res.send(output)

    }
    delete_outdated()
}


//id generator

function id_generator(cuantity) {
    let alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    let id = ""
    for (let i = 0; i < cuantity; i++) {
        let random = Math.floor(Math.random() * 2)
        if (random == 0) {
            id += Math.floor(Math.random() * 10)
        }
        else if (random == 1) {
            id += alphabet[Math.floor(Math.random() * alphabet.length)]
        }
    }
    sessions.forEach((element) => {
        if (element.id == id) {
            id_generator(cuantity)
        }
    })
    return id;
}


//response when second user logged in

app.post("/GET_USER", (req, res) => {

    let data = JSON.parse(req.body)

    for (let i = 0; i < sessions.length; i++) {
        if (sessions[i].id == data.id) {
            if (sessions[i].user2 != null) {
                res.send(JSON.stringify(sessions[i]))
                return
            } else {
                res.send(JSON.stringify({ msg: 'no enemy found' }))
                return
            }
        }
    }

    res.send(JSON.stringify({ msg: 'no game found' }))

})


//receive move from client

app.post("/SEND_MOVE", (req, res) => {
    let data = JSON.parse(req.body)
    for (let i = 0; i < sessions.length; i++) {
        if (sessions[i].id == data.id) {
            sessions[i].last_sent = data.sent
            sessions[i].move = data.move
            res.send(null)
            return null
        }
    }
})


//send move to client

app.post("/REQUEST_MOVE", (req, res) => {

    data = JSON.parse(req.body)
    let found = find_move(data)

    if (found == null) {
        res.send([null])
    }
    else {
        res.send(found)
        // find_move(data) = null
    }

    // res.send(null)

})

//get move from the specific session

function find_move(data) {

    for (let i = 0; i < sessions.length; i++) {
        if (sessions[i].id == data.id && sessions[i].move != null) {
            if (sessions[i].last_sent != data.requests) {
                return sessions[i].move
            }
        }
    }
    return null
}


//destroy session

app.post("/DESTROY", (req, res) => {

    let id = JSON.parse(req.body).id
    for (let i = 0; i < sessions.length; i++) {
        if (sessions[i].id == id) {
            for (let j = i; j < sessions.length - 1; j++) {
                sessions[j] = sessions[j + 1]
            }
            sessions.pop()
            return 0
        }
    }

})

//send sessions to client

app.get("/GET_SESSIONS", (req, res) => {
    res.send(sessions)
})

//info
app.get("/info", (req, res) => {
    let output = `quantity: ${sessions.length}\ndata:\n`
    for (let el of sessions) {
        output += JSON.stringify(el) + '\n'
    }
    res.send(output)
})

//server listen on port 3000

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})

function delete_outdated() {
    for (let i = 0; i < sessions.length; i++) {
        let now = Date.now()
        if (now - sessions[i].time > 10000 && sessions[i].user2 == null) {
            for (let j = i; j < sessions.length - 1; j++) {
                sessions[j] = sessions[j + 1]
            }
            sessions.pop()
        }
    }
}