import * as THREE from "../js/three"

const geom = new THREE.Geometry()
const capGeometry = new THREE.CylinderGeometry(0.7, 1.1, 0.3, 7, 1, false)
const capMatrix = new THREE.Matrix4().makeTranslation(
  0,
  +capGeometry.parameters.height / 2,
  0
)
geom.merge(capGeometry, capMatrix)
const ptGeometry = new THREE.CylinderGeometry(1.1, 0, 1, 7, 1, false)
const ptMatrix = new THREE.Matrix4().makeTranslation(
  0,
  -ptGeometry.parameters.height / 2,
  0
)
geom.merge(ptGeometry, ptMatrix)

// adds texture
const material = new THREE.MeshBasicMaterial()
material.map = new THREE.TextureLoader().load('../obj/diamond.png')
const DiamondMesh = new THREE.Mesh(geom, material)

export default DiamondMesh;