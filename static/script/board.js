class Board {
    constructor(board, scene, pawns) {

        this.meshposition = { x: -350, z: -350 }

        this.container = new THREE.Object3D();

        //create platform under the chessboard

        this.shape = new THREE.Shape();
        this.shape.moveTo(0, 0);
        this.shape.lineTo(0, 800);
        this.shape.lineTo(800, 800);
        this.shape.lineTo(800, 0);
        this.shape.lineTo(0, 0);

        this.extrudeSettings = {
            steps: 2,
            depth: 32,
            bevelEnabled: true,
            bevelThickness: 20,
            bevelSize: 50,
            bevelOffset: 1,
            bevelSegments: 2
        };

        this.geometry = new THREE.ExtrudeGeometry(this.shape, this.extrudeSettings);

        this.material = new THREE.MeshPhongMaterial({
            color: 0x000000,
            specular: 0x0f0f0f,
            shininess: 60,
            side: THREE.DoubleSide,
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material)

        this.mesh.rotateX(Math.PI / 2)

        this.mesh.position.set(-400, 0, -400)

        this.container.add(this.mesh)

        //create tiles

        this.materials = [
            this.material = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: 0xffffff,
                shininess: 500,
                side: THREE.DoubleSide,
            }),
            this.material = new THREE.MeshPhongMaterial({
                color: 0x000000,
                specular: 0xffffff,
                shininess: 500,
                side: THREE.DoubleSide,
            })
        ]

        //create pawns

        this.create_pawns(pawns)

        for (let x = 0; x < board.length; x++) {
            for (let z = 0; z < board[x].length; z++) {

                //create tiles

                this.geometry = new THREE.BoxGeometry(100, 50, 100)
                this.mesh = new THREE.Mesh(this.geometry, board[x][z] == 0 ? this.materials[0] : this.materials[1]);
                this.mesh.color = board[x][z] == 0 ? "white" : "black"
                this.mesh.name = "tile"
                this.container.add(this.mesh)
                this.mesh.position.set(this.meshposition.x, 0, this.meshposition.z)
                this.meshposition.z += 100
            }

            this.meshposition.z = -350
            this.meshposition.x += 100
        }

        //create light source

        this.light = new THREE.SpotLight(0xefefef, 4);
        this.light.name = "spotLight"
        this.light.position.set(450, 100, 450);
        scene.add(this.container)
        scene.add(this.light);

    }

    //create pawns according to an array

    create_pawns(array) {

        for (let x = 0; x < array.length; x++) {
            for (let z = 0; z < array[x].length; z++) {

                //create pawns

                if (array[x][z] != 0) {
                    array[x][z] == 1 ? this.pawn = new Pawn(0xedc99d, x * 100 - 350, z * 100 - 350) : this.pawn = new Pawn(0x912c2c, x * 100 - 350, z * 100 - 350)
                    this.container.add(this.pawn)
                }
            }
        }
    }

    //remove pawns from board

    remove_pawns() {

        for (let i = this.container.children.length - 1; i >= 0; i--) {
            if (this.container.children[i].name == "pawn") {
                this.container.remove(this.container.children[i])
            }
        }
    }

    //rename tiles according to an array

    recolor_tiles(array) {
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < array[i].length; j++) {
                this.container.children.forEach((e) => {
                    if (e.position.x == game.convert(i) && e.position.z == game.convert(j)) {
                        e.color = array[i][j] == 1 ? "black" : "white"
                    }
                })
            }
        }
        game.change_theme(settings.theme)

    }

    //deselect

    deselect(element) {

        this.container.children.forEach((e) => {
            if (e.name == "pawn" && element == e.name) {
                e.material = new THREE.MeshPhongMaterial({
                    color: e.color == "black" ? theme.black_pawn[settings.theme] : theme.white_pawn[settings.theme],
                    combine: 0,
                    specular: 0xffff00,
                    reflectivity: 0.1,
                    shininess: 500,
                    side: THREE.DoubleSide
                })
            }
            if (e.name == "tile" && element == e.name && e.color == "black" || e.name == "tile" && element == e.name && e.color == "highlight") {
                e.color = "black"
                e.material = new THREE.MeshPhongMaterial({
                    color: theme.black_tile[settings.theme],
                    specular: 0xffffff,
                    shininess: 500,
                    side: THREE.DoubleSide,
                })
            }
        })
    }

    //highlight tiles

    highlight() {

        let array

        if (player.selectedPawn.queen == false) {
            array = logic.possible_pawn_moves(game.convert(player.selectedPawn.position.x), game.convert(player.selectedPawn.position.z), game.pawns)
        }
        else {
            array = logic.possible_queen_moves(game.pawns, player.selectedPawn)
        }

        array.forEach((element) => {
            this.container.children.forEach((e) => {
                if (e.name == "tile" && e.position.x == game.convert(element.i) && e.position.z == game.convert(element.j)) {
                    e.color = "highlight"
                    if (document.getElementById("highlight").checked == true) {
                        e.material.color.setHex(theme.tile_highlight[settings.theme])
                    }
                }
            })
        })
    }

    //click on pawn

    select(pawn) {

        if (player.username == gameplay.turn && pawn.color == player.role) {

            game.board.deselect("pawn")
            game.board.deselect("tile")

            player.selectedPawn = pawn

            pawn.material = new THREE.MeshBasicMaterial({
                color: 0xffffcf
            })
        }

        game.board.highlight()

    }

    //click on tile

    async move(tile) {

        game.board.deselect("tile")

        let new_array = []

        for (let i = 0; i < game.pawns.length; i++) {
            new_array.push([])
            for (let j = 0; j < game.pawns[i].length; j++) {
                new_array[i][j] = game.pawns[i][j]
            }
        }

        //just move

        new_array[game.convert(tile.position.x)][game.convert(tile.position.z)] = game.pawns[game.convert(player.selectedPawn.position.x)][game.convert(player.selectedPawn.position.z)]
        new_array[game.convert(player.selectedPawn.position.x)][game.convert(player.selectedPawn.position.z)] = 0

        //take

        if (logic.possible_capture(game.pawns, game.convert(player.selectedPawn.position.x), game.convert(player.selectedPawn.position.z), game.pawns[game.convert(player.selectedPawn.position.x)][game.convert(player.selectedPawn.position.z)]) && player.selectedPawn.queen == false) {
            new_array = logic.capture({ i: game.convert(player.selectedPawn.position.x), j: game.convert(player.selectedPawn.position.z) }, { i: game.convert(tile.position.x), j: game.convert(tile.position.z) }, new_array)
        }

        if (player.selectedPawn.queen == true) {
            let take_pos = logic.queen_capture(game.convert(player.selectedPawn.position.x), game.convert(player.selectedPawn.position.z), game.convert(tile.position.x), game.convert(tile.position.z), game.pawns)

            if (take_pos != false) {
                console.log('QUEEN CAPTURE');
                new_array[take_pos.i][take_pos.j] = 0
            }
        }

        let move = logic.move_coordinates(logic.compare(game.pawns, new_array), game.pawns, new_array)

        await this.move_by_array(game.pawns, new_array)
        game.pawns = new_array

        //queen check
        let queen_check = logic.reach_edge(game.pawns)
        if (queen_check != null) { queen_check.queen_transformation() }

        net.to_send.push(logic.reverse_array(game.pawns))

        if (move.type == "take" && logic.possible_capture(game.pawns, move.end.i, move.end.j, game.pawns[move.end.i][move.end.j]) == true) {
            ui.prompt('DOUBLE CAPTURE')
            game.board.highlight()
        }
        else {
            ui.prompt('')
            player.selectedPawn = null
            game.board.deselect("pawn")
            net.send_move()
        }

    }

    //move by array

    async move_by_array(old_array, new_array) {

        return new Promise((resolve, reject) => {

            let move = logic.move_coordinates(logic.compare(old_array, new_array), old_array, new_array)
            let pawn = this.find_by_coordinates("pawn", game.convert(move.start.i), game.convert(move.start.j))

            let x = (game.convert(move.end.i) - game.convert(move.start.i)) / 25
            let z = (game.convert(move.end.j) - game.convert(move.start.j)) / 25

            let i = 0

            this.movement = setInterval(() => {

                if (move.type == "take" || pawn.queen == true) {
                    pawn.position.x += x
                    pawn.position.z += z
                }
                else {
                    pawn.position.x = pawn.position.x + (Math.sign((game.convert(move.end.i) - game.convert(move.start.i))) * -0.04 * (i * i - 25 * i))
                    pawn.position.z = pawn.position.z + (Math.sign((game.convert(move.end.j) - game.convert(move.start.j))) * -0.04 * (i * i - 25 * i))
                }
                i += 1

                if (move.type == "take") {
                    pawn.position.y = 35 + (-0.5 * ((i * i) - 25 * i))
                }

                if (i == 25) {
                    pawn.position.x = game.convert(move.end.i)
                    pawn.position.z = game.convert(move.end.j)

                    clearInterval(this.movement)

                    if (move.type == "take") {
                        game.board.container.children.forEach((element) => {
                            if (element.name == 'pawn' && new_array?.[game.convert(element.position.x)]?.[game.convert(element.position.z)] == 0) {

                                resolve(this.collapse())

                                game.board.container.remove(element)

                                //win check

                                let win = game.win_check()

                                if (win != null) {
                                    ui.win(win)
                                    net.destroy_game();

                                }
                            }
                        })
                    }
                    else {
                        resolve(0)
                    }
                }
            }, 8)
        })
    }

    //board collapse animation

    async collapse() {

        return new Promise((resolve, reject) => {

            game.board.container.position.y = 0
            clearInterval(this.interval)

            let i = 0
            let a = 0.2
            let j = 0
            this.interval = setInterval(() => {
                game.board.container.position.y = (a * ((i * i) - 25 * i))
                i += 1

                if (j == 1) {
                    resolve(0)
                }

                if (j == 5) {
                    clearInterval(this.interval)
                }
                if (i == 25) {
                    j++
                    i = 0
                    a = -a / 3
                }
            }, 10)
        })
    }

    find_by_coordinates(ename, x, z) {

        for (let i = 0; i < game.board.container.children.length; i++) {
            if (game.board.container.children[i].name == ename && game.board.container.children[i].position.x == x && game.board.container.children[i].position.z == z) {
                return game.board.container.children[i]
            }
        }

    }

}