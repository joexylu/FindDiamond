import * as THREE from "../js/three"
'use strict';

Physijs.scripts.worker = '/js/physijs_worker.js';
Physijs.scripts.ammo = '/js/ammo.js';


import DiamondMesh from "./diamond";
import light from "./light"


var camera, scene, renderer;
var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();
let collidableMeshList = [];
let winningMesh = []
let collided = false;
let win = false;

// new scene
scene = new THREE.Scene();
// scene.setGravity(new THREE.Vector3(0, -10, 0))
renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setClearColor("black")
renderer.setSize( window.innerWidth, window.innerHeight );
// $("#game-show-place").append(renderer.domElement);
document.body.append(renderer.domElement);
window.addEventListener('resize', ()=>{
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
})
camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 5);
camera.lookAt(scene.position);
//add light
scene.add( light );

// //random method:
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function initial(){
    collidableMeshList = [];
    winningMesh = []

    //add random walls:
    var BlockGeometry = new THREE.CubeGeometry(getRandom(5,6), 1, getRandom(5,6));
    var BlockMaterial = new THREE.MeshNormalMaterial();
    for (let i = 0; i < 10; i ++){
        var wall = new THREE.Mesh(BlockGeometry, BlockMaterial);
        wall.position.set(getRandom(-10,10), 0, getRandom(-17,17));
        wall.rotateY(getRandom(0, Math.PI));
        scene.add(wall);
        collidableMeshList.push(wall);
    }

    // Diamond
    DiamondMesh.position.set(getRandom(-10,10),0.5,-20)
    DiamondMesh.scale.set(0.8,0.8,0.8)
    scene.add(DiamondMesh)
    winningMesh.push(DiamondMesh)

    // field 
    
    var groundTexture = new THREE.TextureLoader().load("../obj/grass.png");
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping; 
    groundTexture.repeat.set( 10, 200 );
    var groundMaterial = new THREE.MeshBasicMaterial({map: groundTexture, side:THREE.DoubleSide})
    var meshFloor = new THREE.Mesh(new THREE.PlaneGeometry(20,40,0),groundMaterial);
    meshFloor.rotation.x -= Math.PI / 2; // Rotate the floor 90 degrees
    scene.add(meshFloor);
}
    

// ball model:
var geometry = new THREE.SphereGeometry(0.2, 10,10);
var material = new THREE.MeshNormalMaterial();
var Ballsphere = new THREE.Mesh( geometry, material );
// scene.add(Ballsphere)
Ballsphere.position.set(0,0.25,20)


function ControlUpdate(Ballsphere){
	var delta = clock.getDelta(); // seconds.
	var moveDistance = 5 * delta;
	var rotateAngle = Math.PI / 5 * delta;

    //ball reset
    if ( keyboard.pressed("Z") )
    {
        Ballsphere.position.set(0,0.25,20);
    }

    // move forwards/backwards/left/right
    if (keyboard.pressed("W") )  Ballsphere.translateZ( -moveDistance );
    if ( keyboard.pressed("S") )Ballsphere.translateZ(  moveDistance );
    if (isValidPos(Ballsphere.position, moveDistance) &&  keyboard.pressed("Q") ) Ballsphere.translateX( -moveDistance );
    if ( isValidPos(Ballsphere.position, moveDistance) && keyboard.pressed("E") ) Ballsphere.translateX(  moveDistance );	
        
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
    
    
    // global coordinates
    if ( keyboard.pressed("left"))
        Ballsphere.position.x -= moveDistance;
    if ( keyboard.pressed("right") )
        Ballsphere.position.x += moveDistance;
    if (keyboard.pressed("up") )
        Ballsphere.position.z -= moveDistance;
    if (keyboard.pressed("down") )
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
            collided = true
        } 
        if ( winning.length > 0 && winning[0].distance < directionVector.length() ){
            win = true;
        }
    }	
}


function isValidPos(BallPos){
    if ((BallPos.x) <= -10){      
        return false;
    } else if ((BallPos.x ) >= 10) {
        return false;
    }
    return true
    
    // if ((BallPos.z - moveDis) < -20.5) return false;
    // if ((BallPos.z + moveDis) > 20.5) return false;
}


function animate(){ 
    // scene.simulate();
    requestAnimationFrame(animate);
    render();
    if (isValidPos(Ballsphere.position)){
        ControlUpdate(Ballsphere)
    } else{
        setTimeout(()=>{
            Ballsphere.position.set(0,0.25,20);
        }, 2000)
    }
}

function render() 
{
    renderer.clear()
	renderer.render( scene, camera );
}


initial();
animate();

document.body.addEventListener("click", () => {
    scene.add(Ballsphere);
});

const screen = document.getElementsByTagName('canvas')[0];
screen.innerHTML += "<div class='title'>GetDiamond!</div>";
screen.innerHTML += "<div id='HitWall'>Hit the wall, press Z to back to origin</div>";