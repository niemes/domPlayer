

let currentPlaylist = []
class Playlist {
    constructor(){

        let self = this
        this.addVideo = function(){
    
            const dialogConfig = {
                title: 'Select video files',
                buttonLabel: 'Validate Selection',
                filters: [
                    { name: 'Movies', extensions: ['mkv', 'avi', 'mp4', "m4v", "webm", "ogv"] }
                ],
                properties: ['openFile', 'multiSelections']
            };
            
            electron.openDialog('showOpenDialog', dialogConfig)
            .then( (result) => {
                window.videoPlayer.src = result?.filePaths[0]
                window.videoPlayer.play()
        
                self.createPlaylist(result.filePaths)
            })
            .catch( (err) => {console.log("err", err)})
        
        }

        this.createPlaylist = function(list){
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
        
                delButton.addEventListener('click', function (event) {
                    self.removeVideo(event.srcElement.parentNode)
                });
        
                videoNeo.innerHTML = `<span class="hand">  </span>${filename}`
                videoNeo.setAttribute("path", source);
                videoNeo.setAttribute("index", playlist.getElementsByTagName('li').length);
                videoNeo.appendChild(delButton)
        
                videoNeo.addEventListener('dblclick', function (event) {
                    videoPlayer.src = videoNeo.getAttribute('path')
                    window.curVideo = videoNeo.getAttribute('index')
                    window.videoPlayer.play()
                });
        
                playlist.appendChild(videoNeo)
                // console.log("window.playlist", window.playlist);
            })
        }
        
        this.removeVideo = function(val) {
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

        this.initPlaylist = function() {
    
            let el = document.getElementById('playlist')
        
            window.playlist = new Sortable(el, {
                group: "videos",  // or { name: "...", pull: [true, false, 'clone', array], put: [true, false, array] }
                sort: true,  // sorting inside list
                delay: 0, // time in milliseconds to define when the sorting should start
                delayOnTouchOnly: false, // only delay if user is using touch
                touchStartThreshold: 0, // px, how many pixels the point should move before cancelling a delayed drag event
                store: null,  // @see Store
                animation: 150,  // ms, animation speed moving items when sorting, `0` ??? without animation
                easing: "cubic-bezier(1, 0, 0, 1)", // Easing for animation. Defaults to null. See https://easings.net/ for examples.
                handle: ".hand",  // Drag handle selector within list items
                // filter: ".ignore-elements",  // Selectors that do not lead to dragging (String or Function)
                preventOnFilter: true, // Call `event.preventDefault()` when triggered `filter`
                // draggable: ".item",  // Specifies which items inside the element should be draggable
        
                dataIdAttr: 'data-id', // HTML attribute that is used by the `toArray()` method
        
                ghostClass: "sortable-ghost",  // Class name for the drop placeholder
                chosenClass: "sortable-chosen",  // Class name for the chosen item
                dragClass: "sortable-drag",  // Class name for the dragging item
        
                swapThreshold: 1, // Threshold of the swap zone
                invertSwap: false, // Will always use inverted swap zone if set to true
                invertedSwapThreshold: 1, // Threshold of the inverted swap zone (will be set to swapThreshold value by default)
                direction: 'horizontal', // Direction of Sortable (will be detected automatically if not given)
        
                forceFallback: false,  // ignore the HTML5 DnD behaviour and force the fallback to kick in
        
                fallbackClass: "sortable-fallback",  // Class name for the cloned DOM Element when using forceFallback
                fallbackOnBody: false,  // Appends the cloned DOM Element into the Document's Body
                fallbackTolerance: 0, // Specify in pixels how far the mouse should move before it's considered as a drag.
        
                removeCloneOnHide: true, // Remove the clone element when it is not showing, rather than just hiding it
                emptyInsertThreshold: 5, // px, distance mouse must be from empty sortable to insert drag element into it
        
        
                setData: function (/** DataTransfer */dataTransfer, /** HTMLElement*/dragEl) {
                    dataTransfer.setData('Text', dragEl.textContent); // `dataTransfer` object of HTML5 DragEvent
                },
        
                // Element is chosen
                onChoose: function (/**Event*/evt) {
                    evt.oldIndex;  // element index within parent
                },
        
                // Element is unchosen
                onUnchoose: function(/**Event*/evt) {
                    // same properties as onEnd
                },
        
                // Element dragging started
                onStart: function (/**Event*/evt) {
                    evt.oldIndex;  // element index within parent
                },
        
                // Element dragging ended
                onEnd: function (/**Event*/evt) {
                    var itemEl = evt.item;  // dragged HTMLElement
                    evt.to;    // target list
                    evt.from;  // previous list
                    evt.oldIndex;  // element's old index within old parent
                    evt.newIndex;  // element's new index within new parent
                    evt.oldDraggableIndex; // element's old index within old parent, only counting draggable elements
                    evt.newDraggableIndex; // element's new index within new parent, only counting draggable elements
                    evt.clone // the clone element
                    evt.pullMode;  // when item is in another sortable: `"clone"` if cloning, `true` if moving
                },
        
                // Element is dropped into the list from another list
                onAdd: function (/**Event*/evt) {
                    // same properties as onEnd
                    console.log("vid??o Ajout??", evt)
                },
        
                // Changed sorting within list
                onUpdate: function (/**Event*/evt) {
                    // same properties as onEnd
                    console.log("Update Vid??oList", evt);
                },
        
                // Called by any change to the list (add / update / remove)
                onSort: function (/**Event*/evt) {
                    // same properties as onEnd
                },
        
                // Element is removed from the list into another list
                onRemove: function (/**Event*/evt) {
                    // same properties as onEnd
                },
        
                // Attempt to drag a filtered element
                onFilter: function (/**Event*/evt) {
                    var itemEl = evt.item;  // HTMLElement receiving the `mousedown|tapstart` event.
                },
        
                // Event when you move an item in the list or between lists
                onMove: function (/**Event*/evt, /**Event*/originalEvent) {
                    // Example: https://jsbin.com/nawahef/edit?js,output
                    evt.dragged; // dragged HTMLElement
                    evt.draggedRect; // DOMRect {left, top, right, bottom}
                    evt.related; // HTMLElement on which have guided
                    evt.relatedRect; // DOMRect
                    evt.willInsertAfter; // Boolean that is true if Sortable will insert drag element after target by default
                    originalEvent.clientY; // mouse position
                    // return false; ??? for cancel
                    // return -1; ??? insert before target
                    // return 1; ??? insert after target
                    // return true; ??? keep default insertion point based on the direction
                    // return void; ??? keep default insertion point based on the direction
                },
        
                // Called when creating a clone of element
                onClone: function (/**Event*/evt) {
                    var origEl = evt.item;
                    var cloneEl = evt.clone;
                },
        
                // Called when dragging element changes position
                onChange: function(evt) {
                    evt.newIndex // most likely why this event is used is to get the dragging element's current index
                    // same properties as onEnd
                    // console.log("change", evt.oldIndex, evt.newIndex);
                    if (evt.oldIndex == window.curVideo) {
                        window.curVideo = evt.newIndex
                    }
                    let currentPlaylist = window.playlist.el.getElementsByTagName("li")
                        
                    for (let index = 0; index < currentPlaylist.length; index++) {
                        const element = currentPlaylist[index];
                        element.setAttribute('index', index)
                    }
                }
            });
        }
    }
}

export { Playlist };
