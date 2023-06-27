class Logic {

    //calculate possible pawn moves (including capturing pawns)

    possible_pawn_moves(i, j, array) {
        this.move_pawn = []
        this.capture_pawn = []

        if (this.any_possible_capture(array, array[i][j])) {
            ui.prompt('OBLIGATORY CAPTURE')
        }

        //moving by one

        if (array?.[i + 1]?.[j + 1] == 0 && this.any_possible_capture(array, array[i][j]) == false) {
            this.move_pawn.push({ i: i + 1, j: j + 1 })
        }
        if (array?.[i + 1]?.[j - 1] == 0 && this.any_possible_capture(array, array[i][j]) == false) {
            this.move_pawn.push({ i: i + 1, j: j - 1 })
        }

        //capturing - obligatory

        if (array?.[i + 2]?.[j + 2] == 0 && array?.[i + 1]?.[j + 1] != 0 && array?.[i + 1]?.[j + 1] != array[i][j]) {
            this.capture_pawn.push({ i: i + 2, j: j + 2 })
        }
        if (array?.[i + 2]?.[j - 2] == 0 && array?.[i + 1]?.[j - 1] != 0 && array?.[i + 1]?.[j - 1] != array[i][j]) {
            this.capture_pawn.push({ i: i + 2, j: j - 2 })
        }

        if (this.capture_pawn.length > 0) {
            return this.capture_pawn
        }
        else {
            return this.move_pawn
        }
    }

    //check if take for any pawn is possible

    any_possible_capture(array, color) {
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < array[i].length; j++) {

                if (this.possible_capture(array, i, j, color) == true) {
                    return true
                }
            }
        }
        return false
    }

    //check if pawn take for specific pawn possible

    possible_capture(array, i, j, color) {

        if (array[i][j] == color && array?.[i + 1]?.[j + 1] != 0 && array?.[i + 1]?.[j + 1] != color && array?.[i + 2]?.[j + 2] == 0) {
            return true
        }
        else if (array[i][j] == color && array?.[i + 1]?.[j - 1] != 0 && array?.[i + 1]?.[j - 1] != color && array?.[i + 2]?.[j - 2] == 0) {
            return true
        }
        return false
    }

    //take pawn

    capture(start, end, array) {

        array[(start.i + end.i) / 2][(start.j + end.j) / 2] = 0

        return array

    }


    //reverse array

    reverse_array(array) {

        let output = []

        for (let i = array.length - 1; i >= 0; i--) {
            output.push(array[i])
        }

        return output

    }

    //compare arrays

    compare(array1, array2) {

        let output = []

        if (array1.length == array2.length) {
            for (let i = 0; i < array1.length; i++) {
                for (let j = 0; j < array1[i].length; j++) {
                    if (array1[i][j] != array2[i][j] && array1[i][j] < 3 && array2[i][j] < 3) {
                        output.push({ i: i, j: j })
                    }
                }
            }
        }
        else {
            output.push('arrays lengths are not equal')
        }

        return output
    }

    //specify starting and ending move point; array1 - previous array; array2 - new array

    move_coordinates(data, array1, array2) {

        let output = { type: null, start: null, end: null }
        let helper = []

        if (data.length == 2) {
            output.type = "move"
        }
        else if (data.length == 3) {
            output.type = "take"
        }

        for (let i = 0; i < data.length; i++) {
            if (array1[data[i].i][data[i].j] != 0) {
                helper.push(array1[data[i].i][data[i].j])
            }
            if (array2[data[i].i][data[i].j] != 0) {
                helper.push(array2[data[i].i][data[i].j])
            }
        }

        helper = this.dominant(helper)

        for (let i = 0; i < data.length; i++) {
            if (array1[data[i].i][data[i].j] == helper && array2[data[i].i][data[i].j] == 0) {
                output.start = { i: data[i].i, j: data[i].j }
            }
            if (array1[data[i].i][data[i].j] == 0 && array2[data[i].i][data[i].j] == helper) {
                output.end = { i: data[i].i, j: data[i].j }
            }
        }

        return output

    }

    //find dominating value (numeric array)

    dominant(array) {

        let output
        let helper = []
        let a = [1]
        let b = 0

        array = this.sort_by(array, null)

        for (let i = 0; i < array.length; i++) {
            if (array[i] == array?.[i + 1]) {
                a[b] += 1
            }
            else if (array[i] != array?.[i + 1]) {
                a.push(1)
                b += 1
                helper.push(array[i])
            }
        }

        a.pop()

        output = this.sort_by(a, helper)[1].reverse()[0]

        return output
    }

    //find in array - output is an array of indexes

    find_index(array, value) {
        let output = []
        for (let i = 0; i < array.length; i++) {
            if (array[i] == value) {
                output.push(i)
            }
        }
        return output
    }


    //numeric sort two arrays by one

    sort_by(array, array2) {

        let output
        let helper

        for (let i = 0; i <= array.length; i++) {
            if (array[i] > array[i + 1]) {
                helper = array[i]
                array[i] = array[i + 1]
                array[i + 1] = helper
                if (array2 != null) {
                    helper = array2[i]
                    array2[i] = array2[i + 1]
                    array2[i + 1] = helper
                }
                i = -1
            }
        }

        if (array2 != null) {
            output = [array, array2]
        }
        else {
            output = array
        }
        return output
    }

    //check if pawn reached oponents edge of the board

    reach_edge(array) {

        let colors = [0, 0]
        if (player.role == 'white') { colors = [2, 1] } else colors = [1, 2]

        for (let j = 0; j < 8; j++) {
            if (array[0][j] == colors[0]) {
                let pawn = game.board.find_by_coordinates('pawn', game.convert(0), game.convert(j))
                if (!pawn.queen) { return pawn }
            }
            if (array[7][j] == colors[1]) {
                let pawn = game.board.find_by_coordinates('pawn', game.convert(7), game.convert(j))
                if (!pawn.queen) { return pawn }
            }
        }

        // return null
    }


    //queen possible moves

    possible_queen_moves(array, element) {


        let output = []

        let i = game.convert(element.position.x)
        let j = game.convert(element.position.z)

        for (let k = 1; k < 8; k++) {
            if (array?.[i + k]?.[j + k] == 0) {
                output.push({ i: i + k, j: j + k })
            }
            else if (array?.[i + k]?.[j + k] != 0 && array?.[i + k]?.[j + k] != array[i][j] && array?.[i + k + 1]?.[j + k + 1] == 0) {
                output.push({ i: i + k + 1, j: j + k + 1 })
                k = 8
            }
        }
        for (let k = 1; k < 8; k++) {
            if (array?.[i + k]?.[j - k] == 0) {
                output.push({ i: i + k, j: j - k })
            }
            else if (array?.[i + k]?.[j - k] != 0 && array?.[i + k]?.[j - k] != array[i][j] && array?.[i + k + 1]?.[j - k - 1] == 0) {
                output.push({ i: i + k + 1, j: j - k - 1 })
                k = 8
            }
        }
        for (let k = 1; k < 8; k++) {
            if (array?.[i - k]?.[j + k] == 0) {
                output.push({ i: i - k, j: j + k })
            }
            else if (array?.[i - k]?.[j + k] != 0 && array?.[i - k]?.[j + k] != array[i][j] && array?.[i - k - 1]?.[j + k + 1] == 0) {
                output.push({ i: i - k - 1, j: j + k + 1 })
                k = 8
            }
        }
        for (let k = 1; k < 8; k++) {
            if (array?.[i - k]?.[j - k] == 0) {
                output.push({ i: i - k, j: j - k })
            }
            else if (array?.[i - k]?.[j - k] != 0 && array?.[i - k]?.[j - k] != array[i][j] && array?.[i - k - 1]?.[j - k - 1] == 0) {
                output.push({ i: i - k - 1, j: j - k - 1 })
                k = 8
            }
        }

        return output
    }

    queen_capture(x1, z1, x2, z2, array) {


        let x_direction = Math.sign(x2 - x1)
        let z_direction = Math.sign(z2 - z1)

        for (let i = 0; i < Math.abs(x2 - x1) + 1; i++) {

            x1 += x_direction
            z1 += z_direction
            console.log(x1, z1);

            if (array[x1][z1] == (player.role == 'white' ? 2 : 1)) {
                return { i: x1, j: z1 }
            }
        }

        return false

    }

}