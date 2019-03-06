const readLineSync = require('readline-sync')

const buildGrid = (size) => {
    const ret = []
    for (let i = 0; i < size; i++) {
        const row = []
        for (let j = 0; j < size; j++) {
            row.push(false)
        }
        ret.push(row)
    }
    return ret
}

function Game(size) {
    this.currentCell = [0, 0]
    this.grid = buildGrid(size)

    this.toString = () => {
        let ret = ""
        for (let row = 0; row < this.grid.length; row++) {
            for (let col = 0; col < this.grid.length; col++) {
                if (row === this.currentCell[0] && col === this.currentCell[1]) {
                    ret += "X"
                } else {
                    let char = this.grid[row][col] ? '*' : '.'
                    ret += char
                }
            }
            ret += '\n'
        }
        return ret
    }
}

const g = new Game(10)

console.log('Welcome to minesweeper.\nGrid:\n' + g)
// W - up
// A - left
// D - right
// S - down
// F - flag
// R - reveal
pressedKey = readLineSync.keyIn('Command: ', { limit: 'adfrsw' })
