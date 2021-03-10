function OMGEmbeddedViewerSPRITE(viewer) {
    this.data = viewer.data
    this.embedDiv = viewer.embedDiv

    let dir = omg.apps["sprite"].path

    this.interval = 250
    
    import("/apps/sprite/spriter.js").then(o => {
        this.setup(o.default)
    })
}

OMGEmbeddedViewerSPRITE.prototype.setup = function (OMGSpriter) {
    var spriters = []

    for (var sheetName in this.data.sheets) {
        
        var canvas = document.createElement("canvas")
        canvas.width = this.data.frameWidth
        canvas.height = this.data.frameHeight
        canvas.style.width = canvas.width + "px"
        canvas.style.height = canvas.height + "px"
        this.embedDiv.appendChild(canvas)

        var spriter = new OMGSpriter(this.data, canvas)
        spriter.autoIncrementRow = true
        spriter.clearCanvas = true
        spriter.setSheet(sheetName)
        spriter.draw()
    
        spriters.push(spriter)
    }
    
    setInterval(() => {
        for (var i = 0; i < spriters.length; i++) {
            spriters[i].drawNext()
        }
    }, this.interval)
}
