import * as THREE from "../js/three"

var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 5 );
var light = new THREE.AmbientLight( 0x404040 ); // soft white light

export default light;