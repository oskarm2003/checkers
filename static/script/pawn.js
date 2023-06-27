class Pawn extends THREE.Mesh {

    constructor(color, x, z) {

        super()

        this.queen = false

        this.geometry = new THREE.CylinderGeometry(40, 40, 20, 25)

        this.material = new THREE.MeshPhongMaterial({
            color: color,
            combine: 0,
            specular: 0xffff00,
            reflectivity: 0.01,
            shininess: 500,
            side: THREE.DoubleSide
        })

        this.position.set(x, 35, z)

        this.name = "pawn"

        color == 0xedc99d ? this.color = "white" : this.color = "black"

        return (this)
    }

    queen_transformation() {

        let i = 0

        this.queen = true

        this.scale.set(0.8, 5, 0.8)

        this.interval = setInterval(() => {

            this.position.y = 35 + (-0.3 * ((i * i) - 50 * i))

            this.rotateX(Math.PI / 50)

            if (i == 50) {
                this.rotation.x = 0
                this.position.y = 35
                clearInterval(this.interval)
                game.board.collapse()
            }

            i += 1

        }, 10)

    }


}