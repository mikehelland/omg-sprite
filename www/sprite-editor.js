var inputsDiv = document.getElementById("inputs")
var inputs = {name: document.getElementById("set-name"),
    data: [],
    frameHeight: document.getElementById("frame-height"),
    frameWidth: document.getElementById("frame-width")
};
var set = {}
set.type = "SPRITE"
set.frameHeight = 128
set.frameWidth = 128
var autoPrefix
var params = omg.util.getPageParams();

var spriters = []

var setupPage = () => {
    if (params.id) {
        autoPrefix = "/uploads/" + omg.user.id + "/" + params.id + "/"
        omg.server.getId(params.id, function (response) {

            setInputs(response)

            var newDiv;
            set = response
        });
    }

    if (params.use) {
        fetch(window.location.origin + "/data/" + params.use).then(res=>res.json()).then(data => {
            makeListItem(params.use, {projectFile: window.location.origin + "/data/" + params.use})
            set.height = data.height
            set.width = data.width
            inputs.frameHeight.value = data.height
            inputs.frameWidth.value = data.width
        }).catch(console.error)
        
    }
}

var setInputs = (data) => {
    inputs.name.value = data.name
    inputs.frameHeight.value = data.frameHeight
    inputs.frameWidth.value = data.frameWidth

    setList(data)
}

var setList = (data) => {
    inputsDiv.innerHTML = ""
    inputs.data = []

    for (var code in data.sheets) {
        makeListItem(code, data.sheets[code])
    }
}

var makeUploadDiv = filename => {
    var div = document.createElement("div")
    div.className = "list-item"

    var uploadDiv = document.createElement("div")
    uploadDiv.className = "upload-status"

    var filenameEl = document.createElement("span")
    var status = document.createElement("span")
    
    uploadDiv.appendChild(filenameEl)
    uploadDiv.appendChild(status)
    uploadDiv.appendChild(document.createElement("br"))

    div.appendChild(uploadDiv)
    inputsDiv.appendChild(div)

    filenameEl.innerHTML = filename
    status.innerHTML = "Uploading..."
    return {status, div}
}

var makeListItem = (code, data, parentDiv) => {
    
    if (!parentDiv) {
        parentDiv = document.createElement("div")
        parentDiv.className = "list-item"
        inputsDiv.appendChild(parentDiv)
    }

    
    var div = document.createElement("div")
    var inputRow = document.createElement("div")
    inputRow.className = "list-item-input-row"
    
    inputRow.innerHTML = "Sheet Name: "
    var nameInput = document.createElement("input")
    nameInput.value = code
    inputRow.appendChild(nameInput)
    var caption = document.createElement("span")
    caption.innerHTML = "URL: "
    inputRow.appendChild(caption)
    
    var urlInput = document.createElement("input")
    urlInput.value = typeof data === "string" ? data : data.url || "" 
    urlInput.className = "list-item-url-input"
    inputRow.appendChild(urlInput)

    caption = document.createElement("span")
    caption.innerHTML = "Piskel: "
    inputRow.appendChild(caption)

    var sourceInput = document.createElement("input")
    sourceInput.value = data.projectFile || ""
    sourceInput.className = "list-item-url-input"
    inputRow.appendChild(sourceInput)

    var editButton = document.createElement("button")
    editButton.innerHTML = "Edit"
    inputRow.appendChild(editButton)

    editButton.onclick = () => {

        var openEditor = () => {
            var url = "/apps/piskel/editor/?update_id=" + set.id + "&sheet=" + nameInput.value
            if (sourceInput.value) {
                url += "&edit=" + encodeURIComponent(sourceInput.value)
            }
            window.open(url)
        }

        if (set.id) {
            openEditor()
        }
        else {
            set.draft = true
            submit((res) => {
                set.user_id = res.user_id
                set.username = res.username
                openEditor()
            })
        }
    }


    parentDiv.appendChild(div)

    urlInput.addEventListener("paste", function (e) {
        if (nameInput.value.length == 0) {

            var filename;
            filename = e.clipboardData.getData("Text");

             nameInput.value = makeSoundName(filename) //todo
             data.name = nameInput.value
        }
    }, false);
    //urlInput.onchange = ()=>data.url = urlInput.value
    //nameInput.onchange = ()=>data.name = nameInput.value

    var el = document.createElement("div")
    el.innerHTML = "&times;"
    el.className = "search-thing-menu"
    div.appendChild(el)
    el.onclick = (e) => {
        e.stopPropagation()
        remove(code)
    }

    el = document.createElement("div")
    el.innerHTML = "&darr;"
    el.className = "search-thing-menu"
    div.appendChild(el)
    el.onclick = (e) => {
        e.stopPropagation()
        moveDown(code)
    }

    el = document.createElement("div")
    el.innerHTML = "&uarr;"
    el.className = "search-thing-menu"
    div.appendChild(el)
    el.onclick = (e) => {
        e.stopPropagation()
        moveUp(code)
    }

    div.appendChild(inputRow)
    
    var canvas = document.createElement("canvas")
    var img = document.createElement("img")
    canvas.className = "sprite-canvas"
    canvas.width = set.frameWidth
    canvas.height = set.frameHeight
    img.className = "sprite-img"
    if (data) {
        img.src = data.url || data
    }
    img.onload = e => {
        var spriter = new OMGSpriter(set, canvas)
        spriter.autoIncrementRow = true
        spriter.setSheet(code)
        spriter.draw()

        spriters.push(spriter)
    }

    div.appendChild(document.createElement("hr"))
    div.appendChild(canvas)
    div.appendChild(img)

    inputs.data.push({nameInput: nameInput, urlInput, sourceInput})
    return {urlInput, canvas, img}
}

document.getElementById("add-item").onclick = ()=>{
    makeListItem("", "")
}

var makeSoundName = (filename) => {
    return filename.split("/").pop().split(".")[0].replace("_", " ").replace("-", " ")
}

var dropZone = document.getElementById("drop-zone")
dropZone.ondragover = (e) => {
    e.preventDefault()
    dropZone.className = "drop-zone-hover"
}
dropZone.ondragleave = (e) => {
    e.preventDefault()
    dropZone.className = ""
}
dropZone.ondrop = (e) => {
    e.preventDefault()
    var handleDroppedItems = (items) => {
        for (var i = 0; i < e.dataTransfer.items.length; i++) {
            if (e.dataTransfer.items[i].kind === "file" && 
                    e.dataTransfer.items[i].type.startsWith("image/")) {
                handleDroppedItem(e.dataTransfer.items[i])
            }
        }
    }
    dropZone.className = ""

    var handleDroppedItem = (item) => {
        var file = item.getAsFile()
        var sound = {url: file.name, name: makeSoundName(file.name)}
        
        var {div, status} = this.makeUploadDiv(file.name)

        
        var fd = new FormData();
        fd.append('setId', set.id);
        fd.append('file', file);
        fd.append('filename', file.name);
        
        omg.server.postHTTP("/upload", fd, (res)=>{
            status.innerHTML = res.success ? 
                "<font color='green'>Uploaded</font>" : ("<font color='red'>Error</font> " + res.error)
            var url = window.location.origin + res.filename
            
            var {urlInput, canvas, img} = makeListItem("", url, div)
            urlInput.value = url
            img.src = url

            //load up te sprite
            //spriter
        });
    }

    if (e.dataTransfer.items) {
        if (set.id) {
            handleDroppedItems(e.dataTransfer.items)
        }
        else {
            set.draft = true
            submit((res) => {
                set.user_id = res.user_id
                set.username = res.username
                handleDroppedItems(e.dataTransfer.items)
            })
        }
    }
}

document.getElementById("submit-button").onclick = function () {
    console.log("1", set.id)
    if (!inputs.name.value || inputs.data.length == 0) {
        alert("set needs a name, and a sound with a caption and url.")
        return
    }

    delete set.draft 
    submit((res)=>{
        console.log("2", res)
        if (res.id > 0) {
            window.location = "sprite.htm?id=" + res.id;
        }
    })
}

var submit = (cb) => {

    set.name = document.getElementById("set-name").value
    set.frameWidth = parseInt(document.getElementById("frame-width").value)
    set.frameHeight = parseInt(document.getElementById("frame-height").value)

    set.sheets = {}
    inputs.data.forEach(item => {
        set.sheets[item.nameInput.value] = {
            url: item.urlInput.value,
            projectFile: item.sourceInput.value
        }
    })

    omg.server.post(set, function (response) {
        if (response.id) {
            set.id = response.id
        }
        if (set.draft) {
            history.pushState({},"",window.location.origin + window.location.pathname + "?id=" + response.id)
        }

        if (cb) {
            cb(response)
        }
    });
};

var moveUp = function (item) {

    var i = set.data.indexOf(item) 
    if (i < 1) {
        return
    }

    set.data.splice(i, 1)
    set.data.splice(i - 1, 0, item)

    setList(set)
}

var moveDown = function (item) {

    var i = set.data.indexOf(item) 
    if (i > -1 && i > set.data.length - 1) {
        return
    }

    set.data.splice(i, 1)
    set.data.splice(i + 1, 0, item)

    setList(set)
}

var remove = function (item) {

    console.log(item)
    delete set.sheets[item]
    
    /*var i = set.sheets.indexOf(item) 
    if (i == -1) {
        return
    }

    set.sheets.splice(i, 1)*/

    setList(set)
}

omg.server.getUser(user => {
    if (!user) {
        window.location = "/signin.htm?fwd=" + encodeURIComponent(window.location.href)
    }
    else {
        setupPage()
    }
})
