import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'dat.gui';


function createStarTexture(width, height, numberOfStars) {
  const drawingCanvas = document.createElement('canvas');
  const ctx = drawingCanvas.getContext('2d');
  ctx.canvas.width = width;
  ctx.canvas.height = height;

  const fullCircle = 2 * Math.PI;
  ctx.fillStyle = `rgb(0, 0, 1)`;
  ctx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
  for (let i = 0; i < numberOfStars; i++) {
    ctx.beginPath();
    const posX = Math.random() * width;
    const posY = Math.random() * height;
    const radius = Math.random() * 1.2;
    ctx.arc(posX, posY, radius, 0, fullCircle);

    if (Math.random() < 0.7) {
      // bläulich
      ctx.fillStyle = "rgba(185, 185, " + ((Math.random() * 35) + 220) + ", " + Math.random() + ")";
    } else {
      // rötlich
      ctx.fillStyle = "rgba(" + ((Math.random() * 35) + 220) + ", 185, 185, " + Math.random() + ")";
    }
    ctx.fill();
  }
  return new THREE.CanvasTexture(ctx.canvas).image;
}



const stats = new Stats();
document.body.appendChild(stats.dom);

const gui = new GUI();



const scene = new THREE.Scene();
//scene.fog = new THREE.FogExp2(0x000, 0.2);
scene.fog = new THREE.Fog(0x000, 0.01, 100);
//scene.background = new THREE.Color(0x000);
//scene.environment =

const cubeTexture = new THREE.CubeTexture(new Array(6).fill(createStarTexture(4096, 4096, 1500)));
cubeTexture.needsUpdate = true;
scene.background = cubeTexture;
scene.environment = cubeTexture;


const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;


// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);
renderer.getContext().getProgramInfoLog = function () { return '' }


// controls
const controls = new OrbitControls(camera, renderer.domElement);
// add speed and damping
controls.enableZoom = true;
controls.enablePan = true;
//controls.panSpeed = 0.1;
controls.enableRotate = true;
//controls.rotateSpeed = 0.1;
controls.enableDamping = true;
controls.dampingFactor = 0.025;

controls.update();

// lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);


const directionalLight = new THREE.DirectionalLight(0xffffff, 1.4);
//enable shadows
directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 1500;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;

directionalLight.castShadow = true;
directionalLight.position.set(10, 10, 1);
scene.add(directionalLight);

createCube();

function createCube() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    envMap: cubeTexture,
    roughness: 0.01,
    metalness: 0.95,
    wireframe: false,
    color: 0x777777
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
}

//createAsteroidsInstanced(4000, 1500);
const geometry = new THREE.IcosahedronGeometry();
const material = new THREE.MeshPhongMaterial({
  color: 0x664433,
  roughness: 1,
  metalness: 0
});
const mesh = new THREE.InstancedMesh(geometry, material, 4000);
mesh.receiveShadow = true;
mesh.castShadow = true;
scene.add(mesh);

const dummy = new THREE.Object3D();
for (let i = 0; i < 4000; i++) {
  dummy.position.x = Math.random() * 80 - 20;
  dummy.position.y = Math.random() * 80 - 20;
  dummy.position.z = Math.random() * 80 - 20;

  dummy.rotation.x = Math.random() * 2 * Math.PI;
  dummy.rotation.y = Math.random() * 2 * Math.PI;
  dummy.rotation.z = Math.random() * 2 * Math.PI;

  dummy.scale.x = dummy.scale.y = dummy.scale.z = Math.random();

  dummy.updateMatrix();
  mesh.setMatrixAt(i, dummy.matrix);
  //mesh.setColorAt(i, new THREE.Color(Math.random() * 0x664433));
}




//console.log(createPositions(90, 10));

// https://github.com/kieperb/instancedrendering/blob/main/src/js/scripts.js#L46
function createAsteroidsInstanced(amount, distance) {
  const geometry = new THREE.IcosahedronGeometry(1, 0);
  const material = new THREE.MeshPhongMaterial({ color: 0x664433 });
  const asteroids = new THREE.InstancedMesh(geometry, material, amount);
  asteroids.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
  asteroids.receiveShadow = true;
  asteroids.castShadow = true;
  for (let i = 0; i < amount; i++) {
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(distance));
    const matrix = new THREE.Matrix4();
    matrix.makeRotationY(THREE.MathUtils.randFloat(0, Math.PI * 2));
    matrix.makeRotationX(THREE.MathUtils.randFloat(0, Math.PI * 2));
    matrix.makeRotationZ(THREE.MathUtils.randFloat(0, Math.PI * 2));
    matrix.setPosition(x, y, z);
    const val = THREE.MathUtils.randFloat(0.5, 17.5);
    matrix.scale(new THREE.Vector3(val, val, val));
    asteroids.setMatrixAt(i, matrix);
  }
  scene.add(asteroids);
}

function createPositions(amount, distance) {

  const positions = [];
  for (let i = 0; i < amount; i++) {
    // zufällige Winkel
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    // optimierung
    const sinPhidist = Math.sin(phi) * distance;

    const x = Math.cos(theta) * sinPhidist;
    const y = Math.sin(theta) * sinPhidist;
    const z = Math.cos(phi) * distance;
    const vec3 = new THREE.Vector3(x, y, z);

    positions.push(vec3);
  }
  return positions;
}

const velocities = [];
for (let i = 0; i < 4000; i++) {
  velocities.push(new THREE.Vector3(Math.random() * 0.01, Math.random() * 0.01, Math.random() * 0.01));
}

const matrix = new THREE.Matrix4();

function animate(time) {

  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;

  for (let i = 0; i < 4000; i++) {
    mesh.getMatrixAt(i, matrix);
    matrix.decompose(dummy.position, dummy.rotation, dummy.scale);

    dummy.rotation.x = i / 10000 * time / 2000;
    dummy.rotation.y = i / 10000 * time / 2000;
    dummy.rotation.z = i / 10000 * time / 2000;

    dummy.position.x += velocities[i].x;
    dummy.position.y += velocities[i].y;
    dummy.position.z += velocities[i].z;


    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;

  //mesh.rotation.y = time / 10000;


  controls.update();
  renderer.render(scene, camera);
  stats.update();
}

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});