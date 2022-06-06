import { Playlist } from './playlist.js'

let baseClass = "button is-small is-light"
let clactive = baseClass + " is-link"
let currentPlaylist = []

class MainPlayer {
    constructor() {

        this.playlist = new Playlist()
        this.config = {
            currentIndex: 0,
            loop: () => localStorage.getItem('loop'),
        }

        this.button = {
            play: document.getElementById("play"),
            pause: document.getElementById("pause"),
            loop: document.getElementById("loop")
        }
        this.controls = {
            play: (elem, act) => {
                window.videoPlayer.play()
                if (!act) {
                    elem.className = clactive
                    this.button.pause.className = baseClass
                    this.button.pause.setAttribute('active', "false")
                } else {
                    elem.className = baseClass
                    document.getElementById("pause").className = baseClass
                }
            },
            pause: (elem, act) => {
                window.videoPlayer.pause()
                if (!act) {
                    elem.className = clactive
                    this.button.play.className = baseClass
                    this.button.play.setAttribute('active', "false")
                } else {
                    elem.className = baseClass
                    document.getElementById("play").className = clactive
                }
            },
            previous: (elem) => {
        
            },
            next: (elem) => {
        
            },
            loop: (elem, act) => {
                let swap = act ? false : true
                elem.setAttribute('active', swap)
                localStorage.setItem('loop', swap);

                console.log("swap", swap)
                if (swap) elem.className = clactive
                else elem.className = baseClass
            }
        }

        this.ctrlPlayer = (cmd, srcElem) => {
            let active = srcElem.getAttribute("active") == "false" ? false : true
            this.controls[cmd](srcElem, active)
        },

        this.addVideo = function () {

            const dialogConfig = {
                title: 'Select video files',
                buttonLabel: 'Validate Selection',
                filters: [
                    { name: 'Movies', extensions: ['mkv', 'avi', 'mp4', "m4v", "webm", "ogv"] }
                ],
                properties: ['openFile', 'multiSelections']
            };

            electron.openDialog('showOpenDialog', dialogConfig)
                .then((result) => {
                    window.videoPlayer.src = result?.filePaths[0]
                    window.videoPlayer.play()

                    createPlaylist(result.filePaths)
                })
                .catch((err) => { console.log("err", err) })
        }


        this.createPlaylist = function (list) {
            let playlist = document.getElementById('playlist')
            let emptyFlag = document.getElementById('emptyFlag')

            emptyFlag.style.display = "none"

            list?.forEach((source) => {
                currentPlaylist.push(source)
                localStorage.setItem('playlist', currentPlaylist.join("|"));
                let pathfull = source.split("/")
                let filename = pathfull[pathfull.length - 1]

                let videoNeo = document.createElement('li')
                let delButton = document.createElement('button')
                delButton.className = "delete is-small"

                delButton.addEventListener('dblclick', function (event) {
                    console.log("db click")
                    removeVideo(event.srcElement.parentNode)
                });

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
        },

        this.removeVideo = function (val) {
            var emptyFlag = document.getElementById('emptyFlag')
            var listElements = document.getElementById("playlist");
            let sourcePath = val.getAttribute("path")
            let sourceIndex = currentPlaylist.indexOf(sourcePath)
            listElements.removeChild(val);

            if (sourceIndex !== -1) {
                currentPlaylist.splice(sourceIndex, 1);
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
        },

        this.initPlayer = function() {
            window.videoPlayer = document.createElement('video');
            window.videoPlayer.id = "window.videoPlayerplayer"
            window.videoPlayer.width = 1024;
            window.videoPlayer.height = 640;
            window.videoPlayer.loop = false;
            window.videoPlayer.muted = true;

            window.videoPlayer.src = "./assets/preview.mp4";
            window.videoPlayer.setAttribute('webkit-playsinline', 'webkit-playsinline');
            window.videoPlayer.setAttribute('playsinline', 'playsinline');
            window.videoPlayer.setAttribute('crossorigin', 'anonymous');
            window.videoPlayer.play();

            window.curVideo = 0;
            
            let self = this
            window.videoPlayer.onended = function () {
                let playlistVideos = window.playlist.el.getElementsByTagName("li")
                let looping = self.config.loop()

                if (playlistVideos.length !== 0) {
                    window.curVideo++;
                    console.log("looping", looping)
                    console.log("window.curVideo", window.curVideo, playlistVideos.length, window.curVideo < playlistVideos.length - 1)

                    // go to next video in the playlist
                    if (window.curVideo < playlistVideos.length) {
                        // console.log("try to switch no next video", playlistVideos[window.curVideo]);
                        window.videoPlayer.src = playlistVideos[window.curVideo].getAttribute('path');
                        window.videoPlayer.play()
                    }
                    // last video of the playlist loop back to the begining.
                    else if (window.curVideo >= playlistVideos.length - 1&& looping == "true") {
                        console.log("is looping ? !", looping)
                        window.curVideo = 0;
                        window.videoPlayer.src = playlistVideos[window.curVideo].getAttribute('path');
                        window.videoPlayer.play()
                    } else {
                        console.log("playlist end")
                        window.curVideo = 0
                    }
                } else {
                    window.curVideo = 0
                    window.videoPlayer.play()
                }
            }
            console.log("init loop", this.config.loop())
            this.button.loop.setAttribute('active', this.config.loop() ? "true" : "false")

            console.log("test loop", this.config.loop() == "true" ? clactive : baseClass)
            this.button.loop.className = ""
            this.button.loop.className = this.config.loop() == "true" ? clactive : baseClass

            console.log("className = ", this.button.loop.className)
        }
        
    }
}

export { MainPlayer };