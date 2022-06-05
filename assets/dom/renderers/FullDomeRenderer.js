/* The FullDomeRenderer code presented here is adapted from:
 *
 *   https://github.com/spite/THREE.CubemapToEquirectangular
 */

import {initPlaylist} from '../../js/playlist.js'

const inchesToMeters     = 0.0254;
const feetToMeters       = 0.3048;
const degreesToRadians   = Math.PI / 180;
let domRender;
let RendererConfig = {
    camera: {
        /* The cube camera takes in the 360 view of the scene. The
        starting position is at average eye height for a standing
           person. */
        startingPosition:   new THREE.Vector3(0, 5 * feetToMeters, 0),
        /* The cameraRig member carries the camera. Move this around to
        animate the viewpoint */
        rig:        null,
        near:       .01, // .1,
        far:        1000,
        cubeMapSize: 1024
    },
    dome: {
        radius:             35.0 * feetToMeters / 2,
        inclination:        20 * degreesToRadians,
        fullSphere:         false
    },
};

// Load defaults from session storage

// var val = sessionStorage.getItem('defaultCubeMapResolution');
// if(val) {
//     console.log("cubeMapSize from session storage", val);
//     RendererConfig.camera.cubeMapSize = parseInt(val);
// }

/* Trick for inline strings for GLSL code:
     http://stackoverflow.com/questions/805107/creating-multiline-strings-in-javascript
 */
Function.prototype.getComment = function() {
    var startComment = "/*!";
    var endComment = "*/";
    var str = this.toString();

    var start = str.indexOf(startComment);
    var end = str.lastIndexOf(endComment);

    return str.slice(start + startComment.length, -(str.length - end));
};

FullDomeRenderer.vertexShader = function() {/*!
attribute vec3 position;
attribute vec2 uv;
uniform   mat4 projectionMatrix;
uniform   mat4 modelViewMatrix;
varying   vec2 vUv;

#define M_PI 3.1415926535897932384626433832795

void main() {
    vUv         = vec2(uv.x - 0.5, uv.y - 0.5);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
*/}.getComment();

FullDomeRenderer.fragmentShader = function() {/*!
precision highp       float;
uniform   samplerCube map;
varying   vec2        vUv;

#define M_PI 3.1415926535897932384626433832795

void main()  {
    float l             = length(vUv);
    float latitude      = l * M_PI;
    float sinOfLatitude = sin( latitude );
    float cosOfLatitude = cos( latitude );
    vec3 dir = vec3(
          vUv.x/l * sinOfLatitude,
                    cosOfLatitude,
          vUv.y/l * sinOfLatitude
    );
    gl_FragColor = textureCube( map, dir );
}
*/}.getComment();

function getDomeGeometry(radius, fullSphere) {
    var geometry = new THREE.SphereBufferGeometry(
        radius, 64, 64,
        0, Math.PI*2,
        0, fullSphere ? Math.PI : Math.PI/2
    );

    /* If rendering a half sphere, the UV texture coordinates
     * need to be halved in the y direction. */
    if(!fullSphere) {
        var uv = geometry.attributes.uv.array;
        for(var i = 1; i < uv.length; i += 2) {
            uv[i] = uv[i]/2 + 0.5;
        }
    }
    return geometry;
}

function FullDomeRenderer( renderer ) {
    this.renderer = renderer;

    /* For doing the warpping, we use a scene that consists of
     * a quad that covers the entire canvas and paint it with a
     * fragment shader */
    this.material = new THREE.RawShaderMaterial( {
        uniforms: {
            map: { type: 't', value: null }
        },
        vertexShader:   FullDomeRenderer.vertexShader,
        fragmentShader: FullDomeRenderer.fragmentShader,
        side: THREE.DoubleSide
    } );
    
    this.scene = new THREE.Scene();
    this.quad = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1, 1),
        this.material
    );
    this.scene.add(this.quad);
    this.camera = new THREE.OrthographicCamera(
        1 / -2, // Camera frustum left  plane
        1 /  2, // Camera frustum right plane
        1 /  2, // Camera frustum top plane
        1 / -2, // Camera frustum bottom plane
        -10000, // Camera frustum near plane
         10000  // Camera frustum far plane
    );

    /* The cube camera snaps a 360 picture of the user's scene into a cube texture */
	var gl = this.renderer.getContext();
	var maxSize = gl.getParameter( gl.MAX_CUBE_MAP_TEXTURE_SIZE );

    var cameraRig = new THREE.Object3D();
    this.cubeCamera = new THREE.CubeCamera(
        RendererConfig.camera.near,
        RendererConfig.camera.far,
        Math.min(maxSize, RendererConfig.camera.cubeMapSize)
    );
    cameraRig.add(this.cubeCamera);
    this.cubeCamera.rotation.x = -RendererConfig.dome.inclination;
    cameraRig.position.copy(RendererConfig.camera.startingPosition);
    RendererConfig.camera.rig = cameraRig;

    /* If we have a half-dome, obstructing the lower half of
     * the cube camera with a hemisphere improves performance on
     * complex scenes. */
    if(!RendererConfig.dome.fullSphere) {
        var domeGeometry = getDomeGeometry(RendererConfig.dome.radius, RendererConfig.dome.fullSphere);

        var shield = new THREE.Mesh(domeGeometry, new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.BackSide
        }));
        shield.rotation.x = Math.PI;
        // shield.scale.set(0.10, 0.10, 0.10);
        shield.scale.set(0.01, 0.01, 0.01);
        this.cubeCamera.add(shield);
    }
}

FullDomeRenderer.prototype.setSize = function( width, height ) {
	this.width = width;
	this.height = height;

	this.quad.scale.set( this.width, this.height, 1 );

	this.camera.left   = this.width / - 2;
	this.camera.right  = this.width / 2;
	this.camera.top    = this.height / 2;
	this.camera.bottom = this.height / - 2;

	this.camera.updateProjectionMatrix();
}

FullDomeRenderer.prototype.render = function( scene ) {
    /* Step 1: Render the user's scene to the CubeCamera's texture */
	var autoClear = this.renderer.autoClear;
	this.renderer.autoClear = true;
	this.cubeCamera.updateCubeMap( this.renderer, scene );
	this.renderer.autoClear = autoClear;
    
    /* Step 2: Assign the CubeCamera's texture to the quad's fragment shader */
    this.quad.material.uniforms.map.value = this.cubeCamera.renderTarget.texture;

    /* Step 3: Paints the quad to the screen using the fragment shader to
     * perform the equirectangular distortion. */
    this.renderer.render(this.scene, this.camera);
}

/* Main function that kickstarts the animation loop */


// SETUP VIDEO PLAYER
function setupScene(scene) {
    
    var geometry = new THREE.SphereBufferGeometry( RendererConfig.dome.radius, 60, 40 );
    geometry.scale( -1, 1, 1 );

    window.videoPlayer = document.createElement('video');
    window.videoPlayer.id = "window.videoPlayerplayer"
    window.videoPlayer.width  = 1024;
    window.videoPlayer.height =  640;
    window.videoPlayer.loop = false;
    window.videoPlayer.loopPlaylist = true
    window.videoPlayer.muted  = true;

    window.videoPlayer.src = "./assets/preview.mp4";
    window.videoPlayer.setAttribute( 'webkit-playsinline', 'webkit-playsinline' );
    window.videoPlayer.setAttribute( 'playsinline', 'playsinline' );
    window.videoPlayer.setAttribute( 'crossorigin', 'anonymous' );
    window.videoPlayer.play();

    window.curVideo = 0;
    
    window.videoPlayer.onended = function () {
        let playlistVideos = window.playlist.el.getElementsByTagName("li")

        if (playlistVideos.length !== 0) {
            window.curVideo++;
            // go to next video in the playlist
            if (window.curVideo < playlistVideos.length) {
                // console.log("try to switch no next video", playlistVideos[window.curVideo]);
                window.videoPlayer.src = playlistVideos[window.curVideo].getAttribute('path');
                window.videoPlayer.play()
            }
            // last video of the playlist loop back to the begining.
            else if (window.curVideo == playlistVideos.length && window.videoPlayer.loopPlaylist){
                window.curVideo = 0;
                window.videoPlayer.src = playlistVideos[window.curVideo].getAttribute('path');
                window.videoPlayer.play()
            }
        } else {
            window.curVideo = 0
            window.videoPlayer.play()
        }
    }
    // iOS require the video to start muted in order for it to autoplay, so we use a click
    // to enable the sound.
    document.getElementsByTagName("canvas")[0].addEventListener("click",
        function() {window.videoPlayer.muted = false;}
    );

    var texture = new THREE.VideoTexture( window.videoPlayer );
    texture.minFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    var material   = new THREE.MeshBasicMaterial( { map : texture } );
    let mesh = new THREE.Mesh( geometry, material );
    mesh.rotation.y = -Math.PI/2;
    scene.add( mesh );
}

function startAnimation() {
    var clock  = new THREE.Clock();
    var renderer = new THREE.WebGLRenderer();
    domRender = new FullDomeRenderer(renderer, true);
    
    const container = document.getElementById('wrap');
    const canvas = renderer.domElement;

    canvas.id = "mainVideoCanvas"
    container.appendChild(canvas);
    
    // Setup Initial position

    let playerTop = localStorage.getItem('playerTop');
    let playerLeft = localStorage.getItem('playerLeft');
    let playerWidth =  localStorage.getItem('playerWidth');
    let playerHeight = localStorage.getItem('playerHeight');
    
    // console.log("playerTop", playerTop, "playerLeft", playerLeft)

    container.style.left = playerLeft ?  playerLeft : `calc(50vw - ${container.offsetWidth / 2}px)`
    container.style.top = playerTop ? playerTop : `calc(50vh - ${container.offsetHeight / 2}px)`
    container.style.width = playerWidth ? playerWidth : "250px"
    container.style.height = playerHeight ? playerHeight: "250px"
    
    const canvasNode = document.getElementById('mainVideoCanvas');

    // Call the user routine to setup the scene
    var scene  = new THREE.Scene();
    setupScene(scene);
    scene.add(RendererConfig.camera.rig);

    const progress = document.getElementById("progressBar");
    const slidControl = document.getElementById("slidControl");
    slidControl.onchange = function() {
        window.videoPlayer.currentTime = (this.value / 100) * window.videoPlayer.duration
    }
    // The animation routine
    function animate() {
        
        progress.setAttribute("value", Math.round((window.videoPlayer.currentTime / window.videoPlayer.duration) * 100))
        slidControl.setAttribute("value", Math.round((window.videoPlayer.currentTime / window.videoPlayer.duration) * 100))

        var dt = clock.getDelta();
        var t  = clock.getElapsedTime();
        if(RendererConfig.animationCallback) {
            RendererConfig.animationCallback(t, dt);
        }
        
        canvasNode.width = container.clientWidth;
        canvasNode.height = container.clientHeight;
        
        domRender.render(scene);
        requestAnimationFrame( animate );
    }
    
    // The resize handler
    window.onWindowResize = function(bool) {
        
        let width = container.clientWidth;
        let height = container.clientHeight;

        canvasNode.width  = width;
        canvasNode.height = height;
        domRender.setSize(width, height);
        renderer.setViewport(0, 0, width, height);

        // Show canvas size while resizing
        const resizeInfoTime = 3000;
        if(!this.resizeInfo) {
            this.resizeInfo = document.createElement("div");
            this.resizeInfo.style.position = "absolute";
            this.resizeInfo.style.top      = "0px";
            this.resizeInfo.style.left     = "0px";
            this.resizeInfo.style.color    = "white";
            this.resizeInfo.innerText      = width + "x" + height;
            document.body.appendChild(this.resizeInfo);
        }
        function checkStillResizing() {
            if(this.stillResizing) {
                this.stillResizing = false;
                window.setTimeout(checkStillResizing, resizeInfoTime);
            } else {
                this.resizeInfo.style.display = "none";
            }
        }
        if(!this.stillResizing) {
            window.setTimeout(checkStillResizing, resizeInfoTime);
            this.resizeInfo.style.display = "block";
        }
        this.stillResizing            = bool;
        this.resizeInfo.innerText     = width + " x " + height;
    }

    // Begin the animation
    animate();
    
}

if(window.onRendererReady) {
    window.onRendererReady();
}

window.onload = function () {
    initPlaylist()
    startAnimation()
    window.onWindowResize(true)
};