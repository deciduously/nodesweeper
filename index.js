const readLineSync = require('readline-sync')

const buildGrid = (size, numMines) => {
    let ret = []
    for (let i = 0; i < size; i++) {
        const row = []
        for (let j = 0; j < size; j++) {
            row.push({ mine: false, flag: false, revealed: false })
        }
        ret.push(row)
    }
    plantMines(ret, numMines)
    return ret
}

// takes a 2d array of cells and plants the given number of mines
// TODO handle collisions - if current = mine, find new cell
const plantMines = (grid, numMines) => {
    console.log('laying ' + numMines + ' mines')
    const max = grid.length
    for (let i = 0; i < numMines; i++) {
        const randX = getRandomInt(max)
        const randY = getRandomInt(max)
        //console.log('laying (' + randX + ', ' + randY + ')')
        grid[randX][randY].mine = true
    }
}

const getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max))
}

function Game(size, numMines) {
    this.size = size
    this.numMines = numMines
    this.currentCell = { row: 0, col: 0 }
    this.grid = buildGrid(size, numMines)

    this.checkWin = function () {
        // If the number of flags placed equals the number of mines placed
        // and all those flags are actually on mines, the player wins
        if (this.numMines === this.getFlags()) {
            if (this.validateFlags()) {
                this.endGame(true)
            }
        }
    }

    // accepts a bool, true if game was won
    this.endGame = function (won) {
        this.revealAll()
        this.currentCell = {} // for display purposes, get the cursor off the board
        console.clear()
        console.log(this.toString())
        console.log('YOU ' + (won ? 'WIN' : 'LOSE'))
        process.exit()
    }

    // toggles flag at the current cell
    this.flag = function () {
        const row = this.currentCell.row
        const col = this.currentCell.col
        this.getCell(row, col).flag = !this.getCell(row, col).flag
    }

    this.getCell = function (row, col) {
        if (this.grid[row] === undefined) return
        return this.grid[row][col]
    }

    // return total number of flags
    this.getFlags = function () {
        let ret = 0
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.getCell(row, col).flag) ret += 1
            }
        }
        return ret
    }

    // Returns the number of cells around the given cell which contain mines
    this.getNeighbors = function (row, col) {
        let ret = 0
        // enumerate delta coords of neighbors
        const neighbors = [
            [1, 1],
            [1, 0],
            [1, -1],
            [0, 1],
            [0, -1],
            [-1, 0],
            [-1, 1],
            [-1, -1]
        ]
        neighbors.forEach(pair => {
            const rowOffset = row + pair[0]
            const colOffset = col + pair[1]

            // don't check if out of bounds
            if (this.grid[rowOffset] !== undefined) {
                if (this.getCell(rowOffset, colOffset) !== undefined) {
                    if (this.getCell(rowOffset, colOffset).mine) ret += 1
                }
            }
        })
        return ret
    }

    // reveals current cell if not revealed
    // ends game if mine
    // with no args passed, reveals current cell
    this.reveal = function (r, c) {
        // hacky fix - do nothing if row or coll out of bounds
        // not sure why i'm ever getting values that are though
        // and i want to know why
        if (r >= this.size - 1 || c >= this.size - 1) return

        const row = r | this.currentCell.row
        const col = c | this.currentCell.col
        const cell = this.getCell(row, col)
        if (cell === {}) return
        if (!cell.revealed) {
            if (cell.flag) return // don't touch it
            if (cell.mine) this.endGame(false) // false displays loss message
            cell.revealed = true

            // if we revealed a 0, call reveal on each neighbor
            if (this.getNeighbors(row, col) === 0) {
                this.revealNeighbors(row, col)
            }
        }
    }

    this.revealNeighbors = function (row, col) {
        const neighbors = [
            [1, 1],
            [1, 0],
            [1, -1],
            [0, 1],
            [0, -1],
            [-1, 0],
            [-1, 1],
            [-1, -1]
        ]
        neighbors.forEach(pair => {
            const rowOffset = row + pair[0]
            const colOffset = col + pair[1]

            // don't check if out of bounds
            if (this.grid[rowOffset] !== undefined) {
                if (this.getCell(rowOffset, colOffset) !== undefined) {
                    //console.log(rowOffset + ', ' + colOffset)
                    this.reveal(rowOffset, colOffset)
                }
            }
        })
    }

    this.revealAll = function () {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                this.getCell(row, col).revealed = true
            }
        }
    }

    this.toString = function () {
        let ret = ""
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                // first check if we display the cursor instead of the cell contents
                if (row === this.currentCell.row && col === this.currentCell.col) {
                    ret += "X "
                } else {
                    const cell = this.grid[row][col]
                    if (!cell.revealed) {
                        // if we haven't revealed the cell yet, don't reveal the contents but some are flagged
                        cell.flag ? ret += 'F' : ret += '.'
                    } else {
                        cell.mine ? ret += '*' : ret += this.getNeighbors(row, col)
                    }
                    ret += " "
                }
            }
            ret += '\n'
        }
        return ret
    }

    // accepts one of 'w' 's' 'a' 'd' 
    // moves wrap of edges of board
    this.translate = function (action) {
        const maxIdx = this.size - 1
        switch (action) {
            case 'w':
                // go up
                this.currentCell.row > 0 ? this.currentCell.row -= 1 : this.currentCell.row = maxIdx
                break
            case 's':
                // go down
                this.currentCell.row < maxIdx ? this.currentCell.row += 1 : this.currentCell.row = 0
                break
            case 'a':
                // go left
                this.currentCell.col > 0 ? this.currentCell.col -= 1 : this.currentCell.col = maxIdx
                break
            case 'd':
                // go right
                this.currentCell.col < maxIdx ? this.currentCell.col += 1 : this.currentCell.col = 0
                break
            default:
                // TODO throw error
                console.log('Unknown action')
        }
    }

    // ensures every cell that's on a flag is a mine
    this.validateFlags = function () {
        // this is really a fold - look up how to write that
        // assume true, if any arent return a false with (&&)
        let ret = true
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = this.getCell(row, col)
                // if it's not a flag, keep it true, we dont care
                console.log('validating (' + row + ', ' + col + ')')
                ret = ret && cell.flag ? cell.mine : true
            }
        }
        return ret
    }
}

// Beginner 9x9, 10 mines
// Intermediate 16x16, 40 mines
const g = new Game(9, 2)

while (true) {
    g.checkWin()
    console.log('NODESWEEPER')
    console.log('Grid:\n' + g)
    const flags = g.getFlags()
    const mines = g.numMines
    console.log('Flags placed: ' + flags + (flags >= mines ? ' !!!!' : ''))
    console.log('Mines to sweep: ' + mines)
    pressedKey = readLineSync.keyIn('W-UP S-DOWN A-LEFT D-RIGHT F-FLAG R-REVEAL Q-QUIT', { limit: 'adfrswq' })
    if (pressedKey === 'q') {
        process.exit()
    } else if (['w', 'a', 's', 'd'].includes(pressedKey)) {
        g.translate(pressedKey)
    } else if (pressedKey === 'f') {
        g.flag()
    } else if (pressedKey === 'r') {
        g.reveal()
    } else {
        console.log('unknown command')
    }
    console.clear()
}