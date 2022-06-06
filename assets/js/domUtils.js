// control panel hide/show
// shortcuts 


let domUtils = function () {
    let optionPanel = document.getElementById('panel')
    let progres = document.getElementById('controls')


    function hidepanel(bool) {
        if (!bool) {
            optionPanel.style.right = "15px"
            optionPanel.style.opacity = 1
            progres.style.opacity = 1
        } else {
            optionPanel.style.right = "-315px"
            optionPanel.style.opacity = 0
            progres.style.opacity = 0
        }
    }

    function miam(mess, type, duration = 1000, pos = "top-left") {
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

    document.addEventListener("keydown", function (event) {
        // console.log("event.key", event.key)
        let usedKeys = ["p", " ", "m"]

        if (usedKeys.indexOf(event.key) !== -1) { // touche - debug info
            event.preventDefault();

            if (event.key == "m") { // m for muted
                if (!videoPlayer.muted) videoPlayer.muted = true
                else videoPlayer.muted = false
                // notif("success", "mute", videoPlayer.muted)
                miam(videoPlayer.muted ? "Mute" : "Unmute", 'is-primary')
            }

            if (event.key == " ") { // space for pause
                if (!videoPlayer.paused) {
                    videoPlayer.pause()
                    miam('Video Paused.', 'is-primary')
                }
                else {
                    videoPlayer.play()
                    miam('Video is playing.', 'is-primary')
                }

            }

            if (event.key === "p") { // P for panel
                event.preventDefault();
                if (optionPanel.style.opacity == 0) hidepanel(false)
                else hidepanel(true)
            }
        }
    });

    function centerVideo(){
        let wrapLoca = document.getElementById('wrap')
    
        wrapLoca.style.left = `calc(50vw - ${wrapLoca.offsetWidth / 2}px)`
        wrapLoca.style.top = `calc(50vh - ${wrapLoca.offsetHeight / 2}px)`
        localStorage.setItem('playerTop', wrapLoca.style.top);
        localStorage.setItem('playerLeft', wrapLoca.style.left);
    }

    miam("Press 'P' to open the Menu.", 'is-info', 4000, "top-center")
}


export { domUtils };