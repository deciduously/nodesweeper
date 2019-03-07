const readLineSync = require('readline-sync')

const buildGrid = (size, numMines) => {
    const ret = []
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
const plantMines = (grid, numMines) => {
    for (let i = 0; i < numMines; i++) {
        const randX = Math.floor(Math.random() + 1) * grid.length - 1
        const randY = Math.floor(Math.random() + 1) * grid.length - 1
        grid[randX][randY].mine = true
    }
}

function Game(size, numMines) {
    this.currentCell = { row: 0, col: 0 }
    this.grid = buildGrid(size, numMines)

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
        let neighbors = [
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
            const xOffset = row + pair[0]
            const yOffset = col + pair[1]
            const maxIdx = this.grid.length - 1

            // don't check if out of bounds
            if (xOffset < 0 || xOffset > maxIdx || yOffset < 0 || yOffset > maxIdx) {
                if (this.grid[xOffset][yOffset].mine) ret += 1
            }
        })
        return ret
    }

    // reveals current cell if not revealed
    // ends game if mine
    this.reveal = function () {
        const row = this.currentCell.row
        const col = this.currentCell.col
        const cell = this.grid[row][col]
        if (!cell.revealed) {
            if (cell.mine) process.exit() // TODO endGame()
            cell.revealed = !cell.revealed
        }
    }

    this.toString = function () {
        let ret = ""
        for (let row = 0; row < this.grid.length; row++) {
            for (let col = 0; col < this.grid.length; col++) {
                if (row === this.currentCell.row && col === this.currentCell.col) {
                    // always display the cursor regardless of cell contents
                    ret += "X"
                } else {
                    const cell = this.grid[row][col]
                    if (!cell.revealed) {
                        // if we haven't revealed the cell yet, don't reveal the contents but some are flagged
                        cell.flag ? ret += 'F' : ret += '.'
                    } else {
                        cell.mine ? '*' : this.getNeighbors(row, col).toString()
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
    pressedKey = readLineSync.keyIn('W-UP S-DOWN A-LEFT D-RIGHT F-FLAG R-REVEAL Q-QUIT', { limit: 'adfrswq' })
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