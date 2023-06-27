class Ui {
    constructor(div) {

        this.div = div

        document.getElementById("submit").onclick = () => net.search_game()
        document.getElementById("join").onclick = () => this.join_by_id()

    }

    //hide login

    hide_login() {

        this.div.style.borderRadius = "50%"
        this.div.style.width = "0vh"
        this.div.style.height = "0vh"
        this.div.style.top = "40vh"
        document.getElementById("title1").style.color = "#ffffff00"
        document.getElementById("title2").style.color = "#9b303000"

        setTimeout(() => {
            this.div.remove()
            document.getElementById("title1").remove()
            document.getElementById("title2").remove()
        }, 400)

    }

    //join game by id

    join_by_id() {

        document.getElementById("join").remove()
        if (document.getElementById("taken") != undefined) {
            document.getElementById("taken").remove()
        }

        this.div.style.height = "25vh"
        let p = document.createElement("p")
        p.innerText = "Game id:"
        let input = document.createElement("input")
        input.setAttribute("id", "game_id")
        input.setAttribute("type", "text")
        let button = document.createElement("button")
        button.id = "join"
        button.innerText = "join"

        this.div.append(p)
        this.div.append(input)
        this.div.append(button)

        document.getElementById("join").onclick = () => net.join_private()

    }

    //show header

    header(username, action) {

        this.header = document.createElement("header")
        this.header.innerHTML = `<h1>Hello <b>${username}</b>, you play as <b style="color:${action}; background-color:#70707080">${action}</b></h1>`
        if (action != "spectator") {
            setTimeout(() => {
                this.wait()
            }, 500)
        }

        if (action == "spectator") {
            this.header.innerHTML = "<h1>You are a spectator</h1>"
        }

        this.hamburger = document.createElement("div")
        this.hamburger.id = "hamburger"

        for (let i = 0; i < 3; i++) {
            this.hamburger.append(document.createElement("div"))
        }

        //click on options

        document.getElementById("settings").addEventListener("click", () => {
            game.change_settings()
        })

        this.hamburger.addEventListener("click", function () {
            if (settings.opened == false) {
                document.getElementById("hamburger").style.transform = "rotate(360deg)"
                document.getElementById("settings").style.right = "0vw"
                settings.opened = true
            }
            else {
                document.getElementById("hamburger").style.transform = "rotate(0deg)"
                document.getElementById("settings").style.right = "-25vw"
                settings.opened = false
            }
        })

        this.header.append(this.hamburger)

        document.body.append(this.header)

        setTimeout(() => {
            this.header.style.top = "0vh"
        }, 500)

    }

    //taken username output

    repeat() {

        if (document.getElementById("taken") == undefined) {
            let p = document.createElement("p")
            p.id = "taken"
            p.innerText = "This username is taken"
            document.getElementById("login").append(p)
        }
    }

    //wait for second player to join

    wait() {

        this.dark = document.createElement("div")
        this.dark.id = "dark"

        this.p = document.createElement("p")
        this.p.id = "wait"
        this.p.innerText = "Waiting for another player"
        this.dark.append(this.p)

        this.gif = document.createElement("img")
        this.gif.id = "loading"
        this.gif.setAttribute("src", "images/loading.gif")
        this.dark.append(this.gif)

        document.body.append(this.dark)

    }

    //clear the waiting screen

    clear() {
        document.getElementById("dark").remove()
    }

    //wait for your turn

    wait_30() {

        if (player.username == gameplay.turn) {
            document.getElementById("msg").innerHTML = `Your turn: <b id="timer">60</b>`
        }
        else {
            if (player.username == session.user1) {
                document.getElementById("msg").innerHTML = `${session.user2}'s turn: <b id="timer">60</b>`
            }
            else {
                document.getElementById("msg").innerHTML = `${session.user1}'s turn: <b id="timer">60</b>`
            }
        }

        document.getElementById("wait_30").style.top = "8vh"
    }

    hide_timeout() {
        document.getElementById("wait_30").style.top = "0vh"
    }

    win(winner) {

        this.wait()
        document.getElementById("loading").remove()
        document.getElementById("wait").remove()

        let msg

        if (winner == player.username) {
            msg = "You are the winner."
        } else {
            msg = `${winner} is the winner.`
        }

        document.getElementById("win").innerHTML = `<h2>Game ended<h2><p>${msg}</p>`
        // document.getElementById("win").style.display = "block"
        document.getElementById("win").style.top = "38vh"

    }

    prompt(text) {
        document.getElementById("prompt").innerHTML = text
    }

}