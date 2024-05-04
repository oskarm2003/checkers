var express = require("express")
var app = express()

app.use(express.static("static"))
app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({ extended: true }));

const PORT = 3000
const sessions = []

let total_logs = 0
let NEXT_ID = 0

//REQ RES server

//handling fetch || logging users

app.post("/JOIN_GAME", (req, res) => {

    const { session_type, username, id } = JSON.parse(req.body)
    if (session_type == undefined || username == undefined)
        return res.status(404).send("required data not received")

    const session = login(session_type, username, id)
    deleteOutdated()
    total_logs++

    res.setHeader('Content-Type', 'application/json')
    return res.send(JSON.stringify(session))

})

// check if second player joined
app.post("/GET_USER", (req, res) => {

    const { id } = JSON.parse(req.body)
    if (id == undefined)
        return res.status(404).send("required data not received")

    const session_index = getSessionIndex(id)
    res.setHeader('Content-Type', 'application/json')

    if (session_index == -1)
        return res.send(JSON.stringify({ msg: "no game found" }))

    const session = sessions[getSessionIndex(id)]

    // somebody joined
    if (session.user2 != null)
        return res.status(200).send(JSON.stringify(session))

    return res.send(JSON.stringify({ msg: "no enemy found" }))

})


//receive move from client
app.post("/SEND_MOVE", (req, res) => {

    let { id, move, sent } = JSON.parse(req.body)
    if (id == undefined || move == undefined || sent == undefined)
        return res.status(404).send("required data not received")

    const session_index = getSessionIndex(id)
    if (session_index == -1)
        return res.status(404).send("session not found")

    sessions[session_index].last_sent = sent
    sessions[session_index].move = move

    return res.status(200).end()
})


//send move to client
app.post("/REQUEST_MOVE", (req, res) => {

    const { id, requests } = JSON.parse(req.body)
    if (id == undefined || requests == undefined)
        return res.status(404).send("required data not received")

    const session_index = getSessionIndex(id)
    if (session_index == -1)
        return res.status(404).send("session not found")

    const session = sessions[session_index]
    if (session.last_sent != requests && session.move != null)
        return res.send(JSON.stringify(session.move))
    return res.status(251).end()

})


//destroy session
app.post("/DESTROY", (req, res) => {

    const { id } = JSON.parse(req.body)
    const session_index = getSessionIndex(id)

    if (session_index == -1)
        return res.end(404).end()

    sessions[session_index] = sessions[sessions.length]
    sessions.pop()
    res.status(200).end()

})

//send sessions to client

app.get("/GET_SESSIONS", (req, res) => {
    res.send(JSON.stringify(sessions))
})

//info
app.get("/info", (req, res) => {
    let output = `total logs: ${total_logs}\nquantity: ${sessions.length}\ndata:\n`
    for (let el of sessions) {
        output += JSON.stringify(el) + '\n'
    }
    res.send(output)
})


//server listen on port 3000

app.listen(PORT, function () {
    console.log("server listening on port", PORT)
})


//FUNCTIONALITY

//login users
function login(session_type, username, id) {

    if (isUserNameTaken(username)) return { taken: true }

    //log into an open session
    if (session_type == "open") {

        // try to join an open session
        const session_index = findFreeSessionIndex()

        if (session_index != -1) {
            sessions[session_index].user2 = username
            return sessions[session_index]
        }

        //no session found - create new
        const session = {
            type: "open",
            time: Date.now(),
            id: createId(),
            user1: username,
            user2: null,
            move: null,
            last_sent: null
        }

        sessions.push(session)
        return session
    }

    //log into a private session
    else if (session_type == "private") {

        let session_index = getSessionIndex(id)
        if (sessions[session_index].type != "private") session_index = -1

        //session found
        if (session_index != -1) {
            if (sessions[session_index].user2 == null)
                sessions[session_index].user2 = username
            return sessions[session_index]
        }

        //session not found - create new
        const session = {
            type: "private",
            time: Date.now(),
            id: id,
            user1: username,
            user2: null,
            move: null,
            last_sent: null
        }
        sessions.push(session)
        return session

    }
}

// true if taken
function isUserNameTaken(username) {
    for (const { user1, user2 } of sessions) {
        if (user1 == username || user2 == username) return true
    }
    return false
}

// returns session index if free session available session found
// returns -1 if every session is full
function findFreeSessionIndex() {
    for (let i = 0; i < sessions.length; i++) {
        if (sessions[i].type != "open") continue
        if (sessions[i].user2 == null) return i
    }
    return -1
}

// returns session index of session with given id
// returns -1 if not found
function getSessionIndex(id) {
    for (let i = 0; i < sessions.length; i++) {
        if (sessions[i].id == id) return i
    }
    return -1
}

// get unique id
function createId() {
    for (let { id } of sessions) {
        if (id == NEXT_ID) NEXT_ID++
    }
    return NEXT_ID++
}

function deleteOutdated() {
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

// //get move from the specific session

// function findMove(data) {

//     for (let i = 0; i < sessions.length; i++) {
//         if (sessions[i].id == data.id && sessions[i].move != null) {
//             if (sessions[i].last_sent != data.requests) {
//                 return sessions[i].move
//             }
//         }
//     }
//     return null
// }