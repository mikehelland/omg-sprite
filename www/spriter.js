export default function OMGSpriter(data, canvas) {

    this.canvas = canvas
    this.data = data

    this.context = canvas.getContext("2d")

    this.x = 0
    this.y = 0
    this.w = data.frameWidth || 128
    this.h = data.frameHeight || 128

    this.frameWidth = data.frameWidth || 128
    this.frameHeight = data.frameHeight || 128
    
    this.sx = 0
    this.sy = 0

    this.i = 0
    this.j = 0

    this.loadedSheets = {}
    this.setSheet()

    this.drawBorder = false
}

OMGSpriter.prototype.drawXY = function (x, y) {
    this.x = x
    this.y = y
    this.draw()
}

OMGSpriter.prototype.draw = function () {

    if (this.clearCanvas) {
        this.canvas.width = this.canvas.width
    }

    if (this.loaded) {
        this.context.drawImage(this.img, 
            this.frameWidth * this.i, 
            this.frameHeight * this.j, 
            this.frameWidth, 
            this.frameHeight,
            this.x, this.y, this.w, this.h)
    }

    if (this.drawBorder) {
        this.context.strokeRect(this.x, this.y, this.w, this.h)
    }
}


OMGSpriter.prototype.drawNext = function () {
    this.next()
    this.draw()
}

OMGSpriter.prototype.next = function (sheetName) {
    this.i++

    if (this.i >= this.tilesWide) {
        this.i = 0
        if (this.autoIncrementRow) {
            this.j++
            if (this.j >= this.tilesHigh) {
                this.j = 0
            }
        }
    }
}

OMGSpriter.prototype.setSheet = function (sheetName) {

    if (!sheetName) {
        sheetName = Object.keys(this.data.sheets)[0]
    }
    this.sheetName = sheetName

    if (this.loadedSheets[this.sheetName]) {
        this.img = this.loadedSheets[this.sheetName]
    }
    else {
        this.img = document.createElement("img")
        this.img.src = this.data.sheets[sheetName].url || this.data.sheets[sheetName] 
        this.img.onload = e => {
            this.loaded = true
            this.tilesWide = this.img.width / this.frameWidth
            this.tilesHigh = this.img.height / this.frameHeight
            this.draw()
        }
        this.img.onerror = console.error
        this.loadedSheets[this.sheetName] = this.img
    }
}

OMGSpriter.prototype.setRow = function (j) {
    this.j = j < this.tilesHigh ? j : 0
}
