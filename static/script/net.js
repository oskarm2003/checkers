class Net {

    //join open session

    constructor() {
        this.to_send = []
    }

    create_game(session_type, username, id) {

        this.data = JSON.stringify({
            type: session_type,
            id: id,
            username: username
        })

        this.options = {
            method: "POST",
            body: this.data
        }


        fetch("JOIN_GAME", this.options)

    }

    search_game() {

        if (document.getElementById("username").value.trim().length > 0) {

            player.username = document.getElementById("username").value

            this.data = JSON.stringify({
                type: "open",
                username: document.getElementById("username").value
            })

            this.options = {
                method: "POST",
                body: this.data
            }

            fetch("/JOIN_GAME", this.options)
                .then(response => response.json())
                .then(data => game.login(data))
                .catch(error => console.log(error))
        }

    }

    //join private session

    join_private() {

        if (document.getElementById("username").value.trim().length > 0 && document.getElementById("game_id").value.trim().length > 0) {

            player.username = document.getElementById("username").value

            this.data = JSON.stringify({
                type: "private",
                id: document.getElementById("game_id").value,
                username: document.getElementById("username").value
            })

            this.options = {
                method: "POST",
                body: this.data
            }

            fetch("/JOIN_GAME", this.options)
                .then(response => response.json())
                .then(data => game.login(data))
                .catch(error => console.log(error))
        }

    }

    //search for another player

    listen_for_enemy() {

        this.data = JSON.stringify({ id: session.id })

        this.options = {
            method: "POST",
            body: this.data
        }

        this.enemy_search = setInterval(() => {

            fetch("/GET_USER", this.options)
                .then(response => response.json())
                .then(data => game.start(data))
                .catch(error => console.log(error))

        }, 500)
    }

    //request move

    request_move() {

        this.await_move = setInterval(() => {

            this.data = JSON.stringify({
                id: session.id,
                pawns: logic.reverse_array(game.pawns),
                requests: player.username
            })

            this.options = {
                method: "POST",
                body: this.data
            }

            fetch("/REQUEST_MOVE", this.options)
                .then(response => response.json())
                .then(data => this.received(data))
                .catch(error => console.log(error))

        }, 500)

    }

    //move received

    async received(data) {

        if (data[0] != null) {

            clearInterval(this.await_move)
            clearInterval(game.wait_30)

            for (let i = 0; i < data.length; i++) {

                await game.board.move_by_array(game.pawns, data[i])
                game.pawns = data[i]

            }

            let queen_check = logic.reach_edge(game.pawns)
            if (queen_check != null) { queen_check.queen_transformation() }

            if (gameplay.turn == session.user1) {
                gameplay.turn = session.user2
            }
            else {
                gameplay.turn = session.user1
            }

            game.timer()

        }

    }

    //sending move

    send_move() {

        this.data = JSON.stringify({
            id: session.id,
            move: this.to_send,
            sent: player.username
        })

        this.options = {
            method: "POST",
            body: this.data
        }

        fetch("/SEND_MOVE", this.options)
            .then(data => this.move_sent(data))
            .catch(error => console.log(error))
    }

    //after sending a move

    move_sent() {


        this.to_send = []
        if (gameplay.turn == session.user1) {
            gameplay.turn = session.user2
        }
        else {
            gameplay.turn = session.user1
        }

        net.request_move()

        //start move timeout

        clearInterval(game.wait_30)
        game.timer()

    }

    //destroy the game
    destroy_game() {

    }


    //receive all sessions from server (dev helper)

    get_sessions() {

        fetch("/GET_SESSIONS", { method: "POST" })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.log(error))
    }


}