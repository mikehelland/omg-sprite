function OMGEmbeddedViewerSPRITE(viewer) {
    this.data = viewer.data
    this.embedDiv = viewer.embedDiv

    let dir = omg.types["SPRITE"].path
    
    omg.util.loadScripts([dir + "spriter.js"], () => this.setup())

    this.interval = 250
}

OMGEmbeddedViewerSPRITE.prototype.setup = function () {
    var spriters = []

    for (var sheetName in this.data.sheets) {
        
        var canvas = document.createElement("canvas")
        canvas.width = this.data.frameWidth
        canvas.height = this.data.frameHeight
        canvas.style.width = canvas.width + "px"
        canvas.style.height = canvas.height + "px"
        this.embedDiv.appendChild(canvas)

        var spriter = new OMGSpriter(this.data, canvas)
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
if (typeof omg === "object") omg.registerEmbeddedViewer("SPRITE", OMGEmbeddedViewerSPRITE, document.currentScript.src)