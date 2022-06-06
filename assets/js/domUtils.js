// control panel hide/show
// shortcuts 
class Utils {
    constructor(){
        let self = this
        this.optionPanel = document.getElementById('panel')
        this.progres = document.getElementById('controls')

        this.centerVideo = function () {
            let wrapLoca = document.getElementById('wrap')
        
            wrapLoca.style.left = `calc(50vw - ${wrapLoca.offsetWidth / 2}px)`
            wrapLoca.style.top = `calc(50vh - ${wrapLoca.offsetHeight / 2}px)`
            localStorage.setItem('playerTop', wrapLoca.style.top);
            localStorage.setItem('playerLeft', wrapLoca.style.left);
        }
    
        this.hidepanel = function(bool) {
            if (!bool) {
                self.optionPanel.style.right = "15px"
                self.optionPanel.style.opacity = 1
                self.progres.style.opacity = 1
            } else {
                self.optionPanel.style.right = "-315px"
                self.optionPanel.style.opacity = 0
                self.progres.style.opacity = 0
            }
        },
    
        this.miam = function(mess, type, duration = 1000, pos = "top-left") {
            bulmaToast.toast({
                message: mess,
                type: type,
                dismissible: true,
                duration: duration,
                position: pos,
                "single": false,
                // animate: { in: 'fadeIn', out: 'fadeOut' }
            })
        }
    
        this.initEvents = function(){
            document.addEventListener("keydown", function (event) {
                // console.log("event.key", event.key)
                let usedKeys = ["p", " ", "m"]
        
                if (usedKeys.indexOf(event.key) !== -1) { // touche - debug info
                    event.preventDefault();
        
                    if (event.key == "m") { // m for muted
                        console.log(videoPlayer)
                        if (!videoPlayer.muted) videoPlayer.muted = true
                        else videoPlayer.muted = false
                        // notif("success", "mute", videoPlayer.muted)
                        self.miam(videoPlayer.muted ? "Mute" : "Unmute", 'is-primary')
                    }
        
                    if (event.key == " ") { // space for pause
                        if (!videoPlayer.paused) {
                            videoPlayer.pause()
                            self.miam('Video Paused.', 'is-primary')
                        }
                        else {
                            videoPlayer.play()
                            self.miam('Video is playing.', 'is-primary')
                        }
        
                    }
        
                    if (event.key === "p") { // P for panel
                        event.preventDefault();
                        if (self.optionPanel.style.opacity == 0) self.hidepanel(false)
                        else self.hidepanel(true)
                    }
                }
            });
        }

        this.miam("Press 'P' to open the Menu.", 'is-info', 4000, "top-center")
    }



    
}


export { Utils };