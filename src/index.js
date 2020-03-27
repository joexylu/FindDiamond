// const Game = require("./game");
// const GameView = require("./game_view");

'use strict';

Physijs.scripts.worker = '/js/physijs_worker.js';
Physijs.scripts.ammo = '/js/ammo.js';

import MTLLoader from "../obj/mtlLoader";
import OBJLoader from "../obj/objLoader";

import TrackballControls from "../js/trackballControl";

var camera, scene, renderer;
var pressed = {};
var clock = new THREE.Clock();
var time = 0;


scene = new Physijs.Scene();
scene.setGravity(new THREE.Vector3(0, -10, 0))
camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.set(0, 10, 20);
// camera.lookAt(scene.position); 

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setClearColor("#e5e5e5")
renderer.setSize( window.innerWidth, window.innerHeight );
//add to DOM
$("#game-show-place").append(renderer.domElement);
window.addEventListener('resize', ()=>{
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
})

// add light
var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 5 );
var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

//make a object

// basketball model:
var basketballGeo = new THREE.SphereGeometry( 1, 20, 300 );
var basketballTexture = new THREE.TextureLoader().load("../obj/basketballTexture.jpg")
var basketballMtl = new THREE.MeshBasicMaterial({map: basketballTexture});

var basketballMesh = new Physijs.SphereMesh( basketballGeo, basketballMtl );

var sphereGroup = new THREE.Group();
sphereGroup.add(basketballMesh)
sphereGroup.position.set(0, 1, 90);
scene.add(sphereGroup);

// scene.add( basketballMesh ); 

// field 

var groundTexture = new THREE.TextureLoader().load("../obj/grass.png");
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping; 
groundTexture.repeat.set( 10, 200 );
var groundMaterial = new THREE.MeshBasicMaterial({map: groundTexture, side:THREE.DoubleSide})
var meshFloor = new Physijs.BoxMesh(
    new THREE.PlaneGeometry(20,200,20,20),
    groundMaterial
);
meshFloor.rotation.x -= Math.PI / 2; // Rotate the floor 90 degrees
scene.add(meshFloor);

//hoop


// var hoopMtl = new MTLLoader();
// hoopMtl.setPath( "../obj/" );
// hoopMtl.load('basketball_hoop.jpg', function(materials){

// var hoop = new OBJLoader();
// // hoop.setMaterials(materials)
// hoop.setPath( "../obj/" );
// hoop.load('basketball_hoop.obj', function(hoopObject){

//     hoopObject.scale.set(0.0015,0.0015,0.0015);
//     scene.add(hoopObject)
//     hoopObject.position.set(0,11,-10)
// })



// })

// var render = function(){
//     requestAnimationFrame(render);

//     renderer.render( scene, camera );
// }


// control: camera
var controls = new TrackballControls(camera, renderer.domElement);
controls.zoomSpeed = 0.4;
controls.panSpeed = 0.4;


//eventListener:
function addListeners() {
    window.addEventListener('keydown', function(e) {
      pressed[e.key.toUpperCase()] = true;
    })
    window.addEventListener('keyup', function(e) {
      pressed[e.key.toUpperCase()] = false;
    })
}

//moving object:
function moveSphere(delta) {
    // var delta = clock.getDelta(); // seconds
    var moveDistance = 20 * delta; // 200 pixels per second
    var rotateAngle = Math.PI / 2 * delta; // pi/2 radians (90 deg) per sec

    // move forwards/backwards/left/right
    if ( pressed['W'] ) {
        basketballMesh.rotateOnAxis(new THREE.Vector3(1,0,0), -rotateAngle)
        sphereGroup.translateZ( -moveDistance );
    }
    if ( pressed['S'] ) 
        sphereGroup.translateZ(  moveDistance );
    if ( pressed['A'] )
        sphereGroup.translateX( -moveDistance );
    if ( pressed['D'] )
        sphereGroup.translateX(  moveDistance ); 

    // rotate left/right/up/down
    if ( pressed['J'] )
        sphereGroup.rotateOnAxis(new THREE.Vector3(0,1,0), rotateAngle);
    if ( pressed['L'] )
        sphereGroup.rotateOnAxis(new THREE.Vector3(0,1,0), -rotateAngle);
    if ( pressed['I'] )
        sphereGroup.rotateOnAxis(new THREE.Vector3(1,0,0), rotateAngle);
    if ( pressed['K'] )
        sphereGroup.rotateOnAxis(new THREE.Vector3(1,0,0), -rotateAngle);
}

//Follow the sphere

function moveCamera() {
    var relativeCameraOffset = new THREE.Vector3(0,5,10);
    var cameraOffset = relativeCameraOffset.applyMatrix4(sphereGroup.matrixWorld);
    camera.position.x = cameraOffset.x;
    camera.position.y = cameraOffset.y;
    camera.position.z = cameraOffset.z;
    camera.lookAt(sphereGroup.position);
}


function animate(){
    
    scene.simulate();
    requestAnimationFrame(animate);
    var delta = clock.getDelta();
    time += delta;
    // basketballMesh.rotation.x = time * -4;
    // basketballMesh.position.y = Math.abs(Math.sin(time * 3));
    renderer.render(scene, camera);
    moveSphere(delta);
    moveCamera();
}


addListeners();
animate();