// const Game = require("./game");
// const GameView = require("./game_view");


import * as THREE from "../js/three"
'use strict';

Physijs.scripts.worker = '/js/physijs_worker.js';
Physijs.scripts.ammo = '/js/ammo.js';

import MTLLoader from "../obj/mtlLoader";
import OBJLoader from "../obj/objLoader";

import DiamondMesh from "./diamond";
// import TrackballControls from "../js/trackballControl";

var camera, scene, renderer;
var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();
var time = 0;
var collidableMeshList = [];
var winningMesh = []


scene = new THREE.Scene();
// scene.setGravity(new THREE.Vector3(0, -10, 0))
camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 5);
camera.lookAt(scene.position);

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

//add models:
// var loadingManager = null;
// var RESOURCES_LOADED = false;
// var meshes = {};

// loadingManager = new THREE.LoadingManager();
// loadingManager.onProgress = function(item, loaded, total){
//     console.log(item, loaded, total);
// };
// loadingManager.onLoad = function(){
//     console.log("loaded all resources");
//     RESOURCES_LOADED = true;
//     onResourcesLoaded();
// };

// var models = {
//     block:{
//         obj: "../obj/MoreObj/block.obj",
//         mtl: "../obj/MoreObj/block.mtl",
//         mesh: null
//     },
//     blockSnow:{
//         obj: "../obj/MoreObj/blockSnow.obj",
//         mtl: "../obj/MoreObj/blockSnow.mtl",
//         mesh: null
//     },
//     crate:{
//         obj: "../obj/MoreObj/crate.obj",
//         mtl: "../obj/MoreObj/crate.mtl",
//         mesh: null
//     },
//     spikes:{
//         obj: "../obj/MoreObj/spikesLarge.obj",
//         mtl: "../obj/MoreObj/spikesLarge.mtl",
//         mesh: null
//     }
// }

// for( var _key in models ){
//     (function(key){
//         var mtlLoader = new MTLLoader(loadingManager);
//         mtlLoader.load(models[key].mtl, function(materials){
//             materials.preload();
//             var objLoader = new OBJLoader(loadingManager);
//             objLoader.setMaterials(materials);
//             objLoader.load(models[key].obj, function(mesh){
//                 models[key].mesh = mesh; 
//             });
//         });
        
//     })(_key);
// }



// function onResourcesLoaded(){

//     for (let i = 0; i < 15; i ++){
//             meshes[i] = models.block.mesh.clone()
//     }
//     for (let i = 15; i < 30; i ++){
//         meshes[i] = models.blockSnow.mesh.clone()
//     }
//     for (let i = 30; i < 45; i ++){
//         meshes[i] = models.crate.mesh.clone()
//     }
//     for (let i = 45; i < 60; i ++){
//         meshes[i] = models.spikes.mesh.clone()
//     }
//     var items = Object.values(meshes) 
//     for(let j = 0; j < items.length; j ++){
//         items[j].position.set(getRandom(-9,9), 0, getRandom(-18,18))
//         scene.add(items[j]);
//         // collidableMeshList.push(items[j]);
//     }
// }

// //random method:
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

//add random walls:
var BlockGeometry = new THREE.CubeGeometry(getRandom(1.5,3), 1, getRandom(0.5,0.7));
var BlockMaterial = new THREE.MeshNormalMaterial();
for (let i = 0; i < 80; i ++){
    var wall = new THREE.Mesh(BlockGeometry, BlockMaterial);
    wall.position.set(getRandom(-10,10), 0, getRandom(-17,17));
    wall.rotateY(getRandom(0, Math.PI));
    scene.add(wall);
    collidableMeshList.push(wall);
}


// Diamond
DiamondMesh.position.set(0,0.5,-20)
DiamondMesh.scale.set(0.8,0.8,0.8)
scene.add(DiamondMesh)
winningMesh.push(DiamondMesh)



// ball model:

var geometry = new THREE.SphereGeometry(0.2, 32,32);
var material = new THREE.MeshNormalMaterial();
var Ballsphere = new THREE.Mesh( geometry, material );
scene.add(Ballsphere)
Ballsphere.position.set(0,0.25,20)

// field 

var groundTexture = new THREE.TextureLoader().load("../obj/grass.png");
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping; 
groundTexture.repeat.set( 10, 200 );
var groundMaterial = new THREE.MeshBasicMaterial({map: groundTexture, side:THREE.DoubleSide})
var meshFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(20,40,0),
    groundMaterial
);
meshFloor.rotation.x -= Math.PI / 2; // Rotate the floor 90 degrees
scene.add(meshFloor);

// })




function ControlUpdate()
{
	var delta = clock.getDelta(); // seconds.
	var moveDistance = 50 * delta; // 200 pixels per second
	var rotateAngle = Math.PI / 1 * delta;   // pi/2 radians (90 degrees) per second

	// move forwards/backwards/left/right
    if ( keyboard.pressed("W") )    
		Ballsphere.translateZ( -moveDistance );
	if ( keyboard.pressed("S") )
		Ballsphere.translateZ(  moveDistance );
	if ( keyboard.pressed("Q") )
		Ballsphere.translateX( -moveDistance );
	if ( keyboard.pressed("E") )
		Ballsphere.translateX(  moveDistance );	

	// rotate left/right/up/down
	var rotation_matrix = new THREE.Matrix4().identity();
	if ( keyboard.pressed("A") )
		Ballsphere.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
	if ( keyboard.pressed("D") )
		Ballsphere.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
	if ( keyboard.pressed("R") )
		Ballsphere.rotateOnAxis( new THREE.Vector3(1,0,0), rotateAngle);
	if ( keyboard.pressed("F") )
		Ballsphere.rotateOnAxis( new THREE.Vector3(1,0,0), -rotateAngle);
	
	if ( keyboard.pressed("Z") )
	{
		Ballsphere.position.set(0,0.25,20);
	}
		
	// global coordinates
	if ( keyboard.pressed("left") )
		Ballsphere.position.x -= moveDistance;
	if ( keyboard.pressed("right") )
		Ballsphere.position.x += moveDistance;
	if ( keyboard.pressed("up") )
		Ballsphere.position.z -= moveDistance;
	if ( keyboard.pressed("down") )
		Ballsphere.position.z += moveDistance;
            
    var relativeCameraOffset = new THREE.Vector3(0,3,5);

    var cameraOffset = relativeCameraOffset.applyMatrix4( Ballsphere.matrixWorld );

    camera.position.x = cameraOffset.x;
    camera.position.y = cameraOffset.y;
    camera.position.z = cameraOffset.z;
    camera.lookAt( Ballsphere.position );

    var originPoint = Ballsphere.position.clone();
    for (var vertexIndex = 0; vertexIndex < Ballsphere.geometry.vertices.length; vertexIndex++)
	{		
		var localVertex = Ballsphere.geometry.vertices[vertexIndex].clone();
		var globalVertex = localVertex.applyMatrix4( Ballsphere.matrix );
		var directionVector = globalVertex.sub( Ballsphere.position );
		var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
        var collisionResults = ray.intersectObjects( collidableMeshList );
        var winning = ray.intersectObjects( winningMesh );
		if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ){
            console.log("hit")
            //////
        } 
        if ( winning.length > 0 && winning[0].distance < directionVector.length() ){
            console.log("win")
        }
    }	
}



function animate(){ 
    // scene.simulate();
    requestAnimationFrame(animate);
    var delta = clock.getDelta();
    time += delta;
    render();
    ControlUpdate()
}

function render() 
{
    renderer.clear()
	renderer.render( scene, camera );
}

animate();