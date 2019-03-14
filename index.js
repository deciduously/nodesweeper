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
        console.log('laying (' + randX + ', ' + randY + ')')
        grid[randX][randY].mine = true
    }
}

const getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max))
}

function Game(size, numMines) {
    this.currentCell = { row: 0, col: 0 }
    this.grid = buildGrid(size, numMines)

    this.loseGame = function () {
        this.revealAll()
        process.exit()
    }

    // toggles flag at the current cell
    this.flag = function () {
        const row = this.currentCell.row
        const col = this.currentCell.col
        this.grid[row][col].flag = !this.grid[row][col].flag
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
                if (this.grid[rowOffset][colOffset] !== undefined) {
                    if (this.grid[rowOffset][colOffset].mine) ret += 1
                }
            }
        })
        return ret
    }

    // reveals current cell if not revealed
    // ends game if mine
    // with no args passed, reveals current cell
    this.reveal = function (r, c) {
        const row = r | this.currentCell.row
        const col = c | this.currentCell.col
        const cell = this.grid[row][col]
        if (!cell.revealed) {
            if (cell.mine) this.loseGame()
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
                if (this.grid[rowOffset][colOffset] !== undefined) {
                    console.log(rowOffset + ', ' + colOffset)
                    this.reveal(rowOffset, colOffset)
                }
            }
        })
    }

    // for debug/endgame
    this.revealAll = function () {
        for (let row = 0; row < this.grid.length; row++) {
            for (let col = 0; col < this.grid.length; col++) {
                this.grid[row][col].revealed = true
            }
        }
    }

    this.toString = function () {
        let ret = ""
        for (let row = 0; row < this.grid.length; row++) {
            for (let col = 0; col < this.grid.length; col++) {
                // first check if we display the cursor instead of the cell contents
                if (row === this.currentCell.row && col === this.currentCell.col) {
                    ret += "X"
                } else {
                    const cell = this.grid[row][col]
                    if (!cell.revealed) {
                        // if we haven't revealed the cell yet, don't reveal the contents but some are flagged
                        cell.flag ? ret += 'F' : ret += '.'
                    } else {
                        cell.mine ? ret += '*' : ret += this.getNeighbors(row, col)
                    }
                }
            }
            ret += '\n'
        }
        return ret
    }

    // accepts one of 'w' 's' 'a' 'd' 
    // moves wrap of edges of board
    this.translate = (action) => {
        const maxIdx = this.grid.length - 1
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
}

// Beginner 9x9, 10 mines
// Intermediate 16x16, 40 mines
const g = new Game(9, 10)

while (true) {
    console.log('NODESWEEPER')
    console.log('Grid:\n' + g)
    pressedKey = readLineSync.keyIn('W-UP S-DOWN A-LEFT D-RIGHT F-FLAG R-REVEAL X-REVEAL_ALL Q-QUIT', { limit: 'adfrswqx' })
    if (pressedKey == 'q') {
        process.exit()
    } else if (['w', 'a', 's', 'd'].includes(pressedKey)) {
        g.translate(pressedKey)
    } else if (pressedKey == 'f') {
        g.flag()
    } else if (pressedKey == 'r') {
        g.reveal()
    } else {
        console.log('unknown command')
    }
    console.clear()
}