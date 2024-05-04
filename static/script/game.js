class Game {

    constructor() {

        // this.axes = new THREE.AxesHelper(1000)
        // this.scene.add(this.axes)

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor(0x0f0f0f);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("root").append(this.renderer.domElement);

        this.chessboard = [

            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1]

        ];

        this.pawns = [

            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 0, 2, 0, 2, 0, 2],
            [2, 0, 2, 0, 2, 0, 2, 0],
            [0, 2, 0, 2, 0, 2, 0, 2]

        ];

        window.addEventListener("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        })

        this.board = new Board(this.chessboard, this.scene, this.pawns)
        this.camera.position.set(0, 600, 1200)
        this.camera.lookAt(this.scene.position)
        this.render()
        this.raycaster()
        this.change_settings()

    }

    //render scene

    render = () => {

        requestAnimationFrame(this.render);
        this.renderer.render(this.scene, this.camera);

        if (gameplay.started == false) {
            this.board.container.rotateY(Math.PI / 1500);
        }
    }


    //handling login

    login(data) {

        if (data.taken == true) {
            if (document.getElementById("taken") == undefined) {
                document.getElementById("login").style.height = document.getElementById("login").offsetHeight / window.innerHeight * 100 + 0.5 + "vh"
            }
            ui.repeat()
            return null
        }

        session.id = data.id
        session.type = data.type
        session.user1 = data.user1
        session.user2 = data.user2

        document.getElementById("sessiontype").innerText = session.type
        document.getElementById("gameid").innerText = session.id
        document.getElementById("user1").innerText = session.user1
        document.getElementById("user2").innerText = session.user2

        ui.hide_login()

        if (player.username == session.user1) {
            player.role = "white"
        }
        else if (player.username == session.user2) {
            player.role = "black"
        }
        else {
            player.role = "spectator"
        }

        ui.header(player.username, player.role)

        if (player.role != "spectator") {
            net.listen_for_enemy()
        }
        else {
            gameplay.started = true
            this.board.container.rotation.set(0, 0, 0)
            this.spectator()
        }

    }

    //start after two players detected

    start(data) {

        if (data.msg == 'no enemy found') return
        if (data.msg == 'no game found') {
            net.create_game(session.type, session.user1, session.id)
            return
        }

        session.user2 = data.user2
        gameplay.turn = session.user1
        document.getElementById("user2").innerText = session.user2
        ui.clear()
        clearInterval(net.enemy_search)
        gameplay.started = true
        this.board.container.rotation.set(0, 0, 0)
        if (player.role == "white") {
            game.board.container.rotateY(Math.PI / 2)
        }
        else if (player.role == "black") {
            this.pawns = logic.reverse_array(this.pawns)
            this.chessboard = logic.reverse_array(this.chessboard)
            game.board.container.rotateY(Math.PI / 2)
            this.board.recolor_tiles(this.chessboard)
            this.board.remove_pawns()
            this.board.create_pawns(this.pawns)
            game.change_theme(settings.theme)
            net.request_move()
        }

        this.timer()

    }

    //clickable objects | raycaster

    raycaster() {

        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector2()

        document.getElementById("root").addEventListener("mousedown", (event) => {

            this.mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1
            this.mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1

            this.raycaster.setFromCamera(this.mouseVector, this.camera);
            this.intersects = this.raycaster.intersectObjects(this.board.container.children);

            if (this.intersects.length > 0) {

                //select pawn

                if (this.intersects[0].object.name == "pawn" && gameplay.turn == player.username) {
                    this.board.select(this.intersects[0].object)

                }

                //select tile

                if (this.intersects[0].object.name == "tile" && this.intersects[0].object.color == "highlight" && player.selectedPawn != null) {
                    this.board.move(this.intersects[0].object)
                }
            }

        })
    }

    //moving board as spectator

    spectator() {

        this.grabbed = false

        document.getElementById("root").addEventListener("mousedown", (event) => {

            this.grabbed = true

            if (this.intersects.length > 0) {

                this.mousePositionX = [event.clientX, event.clientX]
                this.mousePositionY = [event.clientY, event.clientY]

                document.getElementById("root").addEventListener("mousemove", (event) => {

                    if (this.grabbed == true) {

                        this.mousePositionX[0] = this.mousePositionX[1]
                        this.mousePositionX[1] = event.clientX

                        this.mousePositionY[0] = this.mousePositionY[1]
                        this.mousePositionY[1] = event.clientY

                        this.board.container.rotation.y += -Math.PI * (this.mousePositionX[0] - this.mousePositionX[1]) / 1200
                        this.board.container.rotation.z += (-Math.PI * (this.mousePositionY[0] - this.mousePositionY[1]) / 2000) * Math.sin(this.board.container.rotation.y)
                        this.board.container.rotation.x += (-Math.PI * (this.mousePositionY[0] - this.mousePositionY[1]) / 2000) * Math.cos(this.board.container.rotation.y) * Math.sign(Math.cos(this.board.container.rotation.y))

                    }
                })
            }
        })

        document.getElementById("root").addEventListener("mouseup", () => { this.grabbed = false })
        document.getElementById("root").addEventListener("mouseout", () => { this.grabbed = false })
    }

    //converting position to array index and other way around

    convert(x) {

        if (x % 10 == 0 && x != 0) {
            return (x + 350) / 100
        }

        else {
            return x * 100 - 350
        }

    }

    //setting change

    change_settings() {

        //field highlight
        settings.highlight = document.getElementById("highlight").checked

        //2D view
        if (document.getElementById("view").checked == true) {

            this.camera.position.set(0, 1500, 0)
            this.camera.lookAt(this.scene.position)
        }
        else {

            this.camera.position.set(0, 600, 1200)
            this.camera.lookAt(this.scene.position)
        }

        //ambient light
        if (document.getElementById("light").checked != settings.ambientLight) {
            if (document.getElementById("light").checked == true) {
                this.ambientLight = new THREE.AmbientLight(0xffffff)
                this.ambientLight.position.set(0, 600, 0)
                this.ambientLight.name = "ambientLight"
                this.scene.add(this.ambientLight)
                settings.ambientLight = true
                this.scene.children[1].intensity = 1
            }
            else if (document.getElementById("light").checked == false) {
                this.scene.remove(this.ambientLight)
                settings.ambientLight = false
                this.scene.children[1].intensity = 4
            }
        }

        //theme

        if (settings.theme != document.getElementById("theme").value) {
            this.change_theme(document.getElementById("theme").value)
        }

    }

    //theme selection execution

    change_theme(i) {
        this.renderer.setClearColor(theme.background[i]);
        this.board.container.children.forEach((e) => {
            if (e.name == "pawn") {
                if (e.color == "white") {
                    e.material.color.setHex(theme.white_pawn[i])
                }
                else if (e.color == "black") {
                    e.material.color.setHex(theme.black_pawn[i])
                }
            }
            else if (e.name == "tile") {
                if (e.color == "black") {
                    e.material.color.setHex(theme.black_tile[i])
                }
                else {
                    e.material.color.setHex(theme.white_tile[i])
                }
            }
        })
        settings.theme = i
    }

    //move timer

    timer() {

        ui.wait_30()

        this.left = 60

        this.wait_30 = setInterval(() => {
            if (this.left == 0) {
                ui.hide_timeout()

            }
            if (this.left == -2) {
                clearInterval(this.wait_30)
                net.destroy_game();
                if (gameplay.turn == session.user1) {
                    ui.win(session.user2)
                }
                else if (gameplay.turn == session.user2) {
                    ui.win(session.user1)
                }
            }
            else {
                this.left -= 1
                document.getElementById("timer").innerText = this.left
            }
        }, 1000)

    }

    win_check() {

        let element = game.board.container.children

        let black = 0, white = 0

        for (let i = 0; i < element.length; i++) {


            if (element[i].name == "pawn" && element[i].color == "white") {
                white++
            }
            if (element[i].name == "pawn" && element[i].color == "black") {
                black++
            }

        }

        if (white == 0) {
            return "black"
        }
        if (black == 0) {
            return "white"
        }
        return null

    }

}