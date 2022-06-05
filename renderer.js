// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
function centerVideo(){
    let wrapLoca = document.getElementById('wrap')

    wrapLoca.style.left = `calc(50vw - ${wrapLoca.offsetWidth / 2}px)`
    wrapLoca.style.top = `calc(50vh - ${wrapLoca.offsetHeight / 2}px)`
    localStorage.setItem('playerTop', wrapLoca.style.top);
    localStorage.setItem('playerLeft', wrapLoca.style.left);
    // console.log("new location save", wrapLoca.style.left, wrapLoca.style.top)
}

let currentPlaylist = []
function addVideo(){
    
    const dialogConfig = {
        title: 'Select a file',
        buttonLabel: 'This one will do',
        properties: ['openFile', 'multiSelections']
    };
    
    electron.openDialog('showOpenDialog', dialogConfig)
    .then( (result) => {
        // console.log(result)
        // console.log('urlPath video local', result?.filePaths[0])
        window.videoPlayer.src = result?.filePaths[0]
        window.videoPlayer.play()

        createPlaylist(result.filePaths)
    })
    .catch( (err) => {console.log("err", err)})

}

function createPlaylist(list){
    let playlist = document.getElementById('playlist')
    let emptyFlag = document.getElementById('emptyFlag')

    emptyFlag.style.display = "none"

    list?.forEach( (source) => {
        currentPlaylist.push(source)
        localStorage.setItem('playlist', currentPlaylist.join("|"));
        let pathfull = source.split("/")
        let filename = pathfull[pathfull.length - 1]

        let videoNeo = document.createElement('li')
        let delButton = document.createElement('button')
        delButton.className = "delete is-small"
        delButton.onclick = (event) => {
            console.log("remove !!!")
            removeVideo(event.srcElement.parentNode)
        }
        videoNeo.innerHTML = `<span class="hand">  </span>${filename}`
        videoNeo.setAttribute("path", source);
        videoNeo.setAttribute("index", playlist.getElementsByTagName('li').length);
        videoNeo.appendChild(delButton)

        videoNeo.onclick = () => {
            videoPlayer.src = videoNeo.getAttribute('path')
            window.curVideo = videoNeo.getAttribute('index')
            window.videoPlayer.play()
        }
        playlist.appendChild(videoNeo)
        // console.log("window.playlist", window.playlist);
    })
}



function removeVideo(val) {
    var emptyFlag = document.getElementById('emptyFlag')
    var listElements = document.getElementById("playlist");
    let sourcePath = val.getAttribute("path")
    let sourceIndex = currentPlaylist.indexOf(sourcePath)
    listElements.removeChild(val);
    
    if ( sourceIndex !== -1) {
        currentPlaylist.splice(sourceIndex,1);
    }

    // If playlist is empty
    if (listElements.childElementCount == 1) {
        emptyFlag.style.display = "flex"
        window.videoPlayer.pause()
        window.videoPlayer.src = "./assets/preview.mp4";
        window.videoPlayer.play()
    }
    //update playlist cache 
    localStorage.setItem('playlist', currentPlaylist.join("|"));
}

// Init playlist
document.addEventListener('DOMContentLoaded', ()=> {
    let lastPlaylist = localStorage.getItem('playlist').split("|")
    if (lastPlaylist.length > 0) createPlaylist(lastPlaylist)
}, false);

