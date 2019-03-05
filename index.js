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

function Grid(size) {
    this.grid = buildGrid(size)

    this.toString = () => {
        let ret = ""
        for (let row = 0; row < this.grid.length; row++) {
            for (let col = 0; col < this.grid.length; col++) {
                let char = this.grid[row][col] ? '*' : '.'
                ret += char
            }
            ret += '\n'
        }
        return ret
    }
}

const g = new Grid(5)

console.log('Welcome to minesweeper.\nGrid:\n' + g)