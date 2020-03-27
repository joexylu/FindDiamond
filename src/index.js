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
sphereGroup.position.set(0, 1, 20);
scene.add(sphereGroup);

// scene.add( basketballMesh ); 

// field 

var groundTexture = new THREE.TextureLoader().load("../obj/grass.png");
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping; 
groundTexture.repeat.set( 10, 200 );
var groundMaterial = new THREE.MeshBasicMaterial({map: groundTexture, side:THREE.DoubleSide})
var meshFloor = new Physijs.BoxMesh(
    new THREE.PlaneGeometry(20,40,0),
    groundMaterial
);
meshFloor.rotation.x -= Math.PI / 2; // Rotate the floor 90 degrees
scene.add(meshFloor);


//add models:
var loadingManager = null;
var RESOURCES_LOADED = false;
var meshes = {};

loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = function(item, loaded, total){
    console.log(item, loaded, total);
};
loadingManager.onLoad = function(){
    console.log("loaded all resources");
    RESOURCES_LOADED = true;
    onResourcesLoaded();
};

var models = {
    block:{
        obj: "../obj/MoreObj/block.obj",
        mtl: "../obj/MoreObj/block.mtl",
        mesh: null
    },
    blockSnow:{
        obj: "../obj/MoreObj/blockSnow.obj",
        mtl: "../obj/MoreObj/blockSnow.mtl",
        mesh: null
    },
    crate:{
        obj: "../obj/MoreObj/crate.obj",
        mtl: "../obj/MoreObj/crate.mtl",
        mesh: null
    },
    spikes:{
        obj: "../obj/MoreObj/spikesLarge.obj",
        mtl: "../obj/MoreObj/spikesLarge.mtl",
        mesh: null
    }
}

for( var _key in models ){
    (function(key){
        var mtlLoader = new MTLLoader(loadingManager);
        mtlLoader.load(models[key].mtl, function(materials){
            materials.preload();
            var objLoader = new OBJLoader(loadingManager);
            objLoader.setMaterials(materials);
            objLoader.load(models[key].obj, function(mesh){
                models[key].mesh = mesh;  
            });
        });
        
    })(_key);
}

//random method:
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function onResourcesLoaded(){

    const arr = [models.block.mesh.clone(), models.blockSnow.mesh.clone(), models.crate.mesh.clone(), models.spikes.mesh.clone()]

    for (let i = 0; i < 15; i ++){
            meshes[i] = models.block.mesh.clone()
    }
    for (let i = 15; i < 30; i ++){
        meshes[i] = models.blockSnow.mesh.clone()
    }
    for (let i = 30; i < 45; i ++){
        meshes[i] = models.crate.mesh.clone()
    }
    for (let i = 45; i < 60; i ++){
        meshes[i] = models.spikes.mesh.clone()
    }
    var items = Object.values(meshes) 
    for(let j = 0; j < items.length; j ++){
        items[j].position.set(getRandom(-9,9), 0, getRandom(-18,18))
        scene.add(items[j]);
    }
}

// })


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