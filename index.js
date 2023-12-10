import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// three.js setup ==================

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(window.innerWidth * 0.4, window.innerHeight * 0.4);
renderer.setClearColor(0xFFFFFF);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
canvasResize()
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(15, 80, 5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance =1;
controls.maxDistance = 40;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

const groundGeometry = new THREE.PlaneGeometry(1, 1, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0xFFFFFF,
  side: THREE.DoubleSide
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.castShadow = false;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

const spotLight = new THREE.SpotLight(0xffffff,  3, 2200, 0.22, 1);
spotLight.position.set(0, 400, 0);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);

// document element setup
document.getElementById('canvas-container').style.display = 'none';

const localStorageSetHandler = function(e) {
  if (e.key === 'color') {
    const changeColorFunc = changeColor
    changeColorFunc(e.value);
  }
};

document.addEventListener("colorChange", localStorageSetHandler, false);


// mesh loader
const loader = new GLTFLoader();
loader.load('./public/backpack.glb', (gltf) => {
  const mesh = gltf.scene;

  mesh.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  mesh.position.set(0, 1.05, -10);
  scene.add(mesh);

  document.getElementById('progress-container').style.display = 'none';
  document.getElementById('canvas-container').style.display = 'flex';
  canvasResize()
}, ( xhr ) => {
  document.getElementById('progress').innerHTML = `LOADING ${Math.max(xhr.loaded / xhr.total, 1) * 100}/100`;
},);

window.addEventListener('resize', () => {
  canvasResize()
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function changeColor(colorHex) {
  // console.log("heil Hitler");
  colorHex = colorHex.replace("#", "0x");
  const colorInt = parseInt(colorHex, 16);
  const colorRGB = new THREE.Color(colorInt);
  // const mesh = scene.getObjectByName('mesh');
  // mesh.material.color = colorRGB;
  scene.traverse( function( object ) {

    if ( object.isMesh && object.material.type === "MeshPhysicalMaterial") {
        object.material.color = colorRGB;
    };
    
} );
}

function canvasResize() {
  let canvas = document.getElementById('canvas');
  if (canvas !== null && canvas !== undefined) {
    canvas.remove();
  }
  let container = document.getElementById('canvas-container');
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  container.appendChild(renderer.domElement);
}
animate();

