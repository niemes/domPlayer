// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
// Init player
    // init playlist
    // init DomRenderer
    // domUtils
    
import { Utils } from './assets/js/domUtils.js'
import { MainPlayer } from './assets/js/player.js'
import { initDom } from './assets/dom/renderers/FullDomeRenderer.js'

let player = new MainPlayer()
player.playlist.initPlaylist()
player.initPlayer()

initDom()
let utils = new Utils()
utils.initEvents()

window.utils = utils
window.player = player
window.control = player.ctrlPlayer

document.addEventListener('DOMContentLoaded', ()=> {
    let lastPlaylist = localStorage.getItem('playlist').split("|")
    if (lastPlaylist.length > 0) player.playlist.createPlaylist(lastPlaylist)
}, false);


