function OMGSpriter(data, canvas) {

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
}

OMGSpriter.prototype.draw = function () {

    if (this.clearCanvas) {
        this.canvas.width = this.canvas.width
    }

    this.context.drawImage(this.img, 
        this.frameWidth * this.i, 
        this.frameHeight * this.j, 
        this.frameWidth, 
        this.frameHeight,
        this.x, this.y, this.w, this.h)

}


OMGSpriter.prototype.drawNext = function () {
    this.i++

    if (this.i >= this.tilesWide) {
        this.i = 0
        this.j++
        if (this.j >= this.tilesHigh) {
            this.j = 0
        }
    }

    this.draw()
}


OMGSpriter.prototype.setSheet = function (sheetName) {
    this.img = document.createElement("img")
    this.img.src = this.data.sheets[sheetName]
    this.img.onload = e => {
        this.tilesWide = this.img.width / this.frameWidth
        this.tilesHigh = this.img.height / this.frameHeight
        this.draw()
    }
}