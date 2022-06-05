
var getAbsPosition = function (el) {
    var el2 = el;
    var curtop = 0;
    var curleft = 0;
    if (document.getElementById || document.all) {
        do {
            curleft += el.offsetLeft - el.scrollLeft;
            curtop += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
            el2 = el2.parentNode;
            while (el2 != el) {
                curleft -= el2.scrollLeft;
                curtop -= el2.scrollTop;
                el2 = el2.parentNode;
            }
        } while (el.offsetParent);

    } else if (document.layers) {
        curtop += el.y;
        curleft += el.x;
    }
    return [curtop, curleft];
};


$(document).ready(function () {
    let wrapLoca = document.getElementById('wrap')
    $("#wrap").draggable({
        drag: function (e, ui) {
            let coords = getAbsPosition(wrapLoca)
            // console.log("Drag - top", coords[0], "left", coords[1])
            localStorage.setItem('playerTop', `${coords[0]}px`);
            localStorage.setItem('playerLeft', `${coords[1]}px`);
        },
    }).resizable({
        start: function (e, ui) {
            // alert('resizing started');
        },
        resize: function (e, ui) {
            // console.log("resize - width", wrapLoca.style.width, "height", wrapLoca.style.height)
            if (window.onWindowResize) window.onWindowResize(true)
            localStorage.setItem('playerWidth', wrapLoca.style.width);
            localStorage.setItem('playerHeight', wrapLoca.style.height);
        },
        stop: function (e, ui) {
            if (window.onWindowResize) window.onWindowResize(false)

        }
    });
});