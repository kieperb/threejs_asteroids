import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'dat.gui';

// https://threejs.org/

// https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html#L296

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
    const radius = Math.random() * 0.4;
    //const radius = Math.random() * 1.2;
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

let physicsWorld;
let rigidBodiy_List = [];
let tmpTransformation;

let raycaster = new THREE.Raycaster();
let tmpPos = new THREE.Vector3();
let mouseCoords = new THREE.Vector2();

let canShoot = true;

// stats
const stats = new Stats();
document.body.appendChild(stats.dom);

// gui
//const gui = new GUI();

// clock
const clock = new THREE.Clock();

// instructions
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
let locked = false;

Ammo().then(start);

function start() {
  tmpTransformation = new Ammo.btTransform();

  initPhysicsWorld();
  initGraphicsWorld();

  //createGround();
  //createGridCubes();
  //createDropCube();

  //addEventHandlers();

  //render();

}

function initPhysicsWorld() {
  let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();

  let dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);

  let overlappingPairCache = new Ammo.btDbvtBroadphase();

  let solver = new Ammo.btSequentialImpulseConstraintSolver();

  physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
  physicsWorld.setGravity(new Ammo.btVector3(0, 0, 0));
}

function initGraphicsWorld() {

  // https://www.youtube.com/watch?v=30bO8SBIZYw&t=154s

}



// scene
const scene = new THREE.Scene();
//scene.fog = new THREE.FogExp2(0x000, 0.2);
//scene.fog = new THREE.Fog(0x000, 200, 2500);
//scene.background = new THREE.Color(0x000);
//scene.environment =
const cubeTexture = new THREE.CubeTexture(new Array(6).fill(createStarTexture(2048, 2048, 1500)));
cubeTexture.needsUpdate = true;
scene.background = cubeTexture;
scene.environment = cubeTexture;

// camera
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// sound
const listener = new THREE.AudioListener();
camera.add(listener);

const audioLoader = new THREE.AudioLoader();

// background sound like maschine humm 
const backgroundSound = new THREE.Audio(listener);
audioLoader.load('./public/sounds/cockpit2.mp3', function (buffer) {
  backgroundSound.setBuffer(buffer);
  backgroundSound.setLoop(true);
  backgroundSound.setVolume(0.1);

});


// shooting sound
const shootSound = new THREE.Audio(listener);
audioLoader.load('./public/sounds/shoot.mp3', function (buffer) {
  shootSound.setBuffer(buffer);
  shootSound.setVolume(0.6);
});

// lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.6);
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

const controls = new PointerLockControls(camera, document.body);
// https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html#L296




controls.addEventListener('lock', function () {

  instructions.style.display = 'none';
  blocker.style.display = 'none';
  backgroundSound.play();
});

controls.addEventListener('unlock', function () {
  locked = false;
  blocker.style.display = 'block';
  instructions.style.display = '';
  backgroundSound.pause();

});

scene.add(controls.object);


const bullets = [];
// input
const onKeyDown = function (event) {
  switch (event.code) {
    case 'KeyW':
      moveForward = true;
      break;
    case 'KeyA':
      moveLeft = true;
      break;
    case 'KeyS':
      moveBackward = true;
      break;
    case 'KeyD':
      moveRight = true;
      break;
    case 'Space':
      if (canShoot === true) {
        canShoot = false;
        shootSound.stop();

        // nicht zu viele Kugeln
        while (bullets.length > 10) {
          scene.remove(bullets.shift());
        }

        const bullet = new THREE.Mesh(
          new THREE.BoxGeometry(0.005, 0.02, 1),
          new THREE.MeshBasicMaterial({ color: 0xff66ff })
        );

        bullet.position.copy(camera.position);
        bullet.position.x += 0.051;
        bullet.quaternion.copy(camera.quaternion);
        bullet.velocity = new THREE.Vector3(0, 0, -0.5);
        scene.add(bullet);
        bullets.push(bullet);
        shootSound.play();
      }

      break;
  }
};

const onKeyUp = function (event) {
  switch (event.code) {
    case 'KeyP':
      if (locked === false) {
        controls.lock();
        locked = true;
      }
      break;
    case 'KeyW':
      moveForward = false;
      break;
    case 'KeyA':
      moveLeft = false;
      break;
    case 'KeyS':
      moveBackward = false;
      break;
    case 'KeyD':
      moveRight = false;
      break;
  }
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

//draw crosshair
const crosshair = new THREE.Mesh(
  new THREE.RingGeometry(0.081, 0.0815, 32),
  new THREE.MeshBasicMaterial({ color: 0x3399ff })
);
crosshair.position.z = -1;
camera.add(crosshair);

const crosshair3 = new THREE.Mesh(
  new THREE.RingGeometry(0.061, 0.0615, 32),
  new THREE.MeshBasicMaterial({ color: 0x888888 })
);
crosshair3.position.z = -1;
camera.add(crosshair3);

const crosshair2 = new THREE.Mesh(
  new THREE.RingGeometry(0.011, 0.0115, 32),
  new THREE.MeshBasicMaterial({ color: 0x888888 })
);
crosshair2.position.z = -1;
camera.add(crosshair2);


// objects
const dummy = new THREE.Object3D();
const mesh = createAsteroidsInstanced(1000, 1000);
// https://github.com/kieperb/instancedrendering/blob/main/src/js/scripts.js#L46
function createAsteroidsInstanced(amount, distance) {

  const geometry = new THREE.IcosahedronGeometry();
  const material = new THREE.MeshStandardMaterial({
    color: 0x664433,
    roughness: 1,
    metalness: 0
  });
  const mesh = new THREE.InstancedMesh(geometry, material, amount);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  scene.add(mesh);

  const twoPi = 2 * Math.PI;

  for (let i = 0; i < amount; i++) {
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(distance));
    dummy.position.x = x;
    dummy.position.y = y;
    dummy.position.z = z;

    //dummy.position.x = Math.random() * 80 - 20;
    //dummy.position.y = Math.random() * 80 - 20;
    //dummy.position.z = Math.random() * 80 - 20;

    dummy.rotation.x = Math.random() * twoPi;
    dummy.rotation.y = Math.random() * twoPi;
    dummy.rotation.z = Math.random() * twoPi;


    dummy.scale.x = dummy.scale.y = dummy.scale.z = Math.random() * 25;

    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    //mesh.setColorAt(i, new THREE.Color(Math.random() * 0x664433));
  }
  return mesh;
}

const velocities = [];
for (let i = 0; i < 1000; i++) {
  velocities.push(new THREE.Vector3(Math.random() * 0.1, Math.random() * 0.1, Math.random() * 0.1));
}

const matrix = new THREE.Matrix4();
let reloadTime = 100;

function animate(time) {
  const delta = clock.getDelta();

  // feuerrate
  if (canShoot === false) {
    reloadTime -= delta * 600;
    if (reloadTime <= 0) {
      canShoot = true;
      reloadTime = 100;
    }
  }

  for (const bullet of bullets) {
    bullet.position.add(bullet.velocity);
  }

  // entferne bullets die zu weit weg sind
  while (bullets.length > 0 && bullets[0].position.z < -60) {
    scene.remove(bullets.shift());
  } 



  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;

  for (let i = 0; i < 1000; i++) {
    mesh.getMatrixAt(i, matrix);
    matrix.decompose(dummy.position, dummy.rotation, dummy.scale);

    dummy.rotation.x = i / 10000 * time / 200;
    dummy.rotation.y = i / 10000 * time / 200;
    dummy.rotation.z = i / 10000 * time / 200;

    dummy.position.x += velocities[i].x;
    dummy.position.y += velocities[i].y;
    dummy.position.z += velocities[i].z;

    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;

  //mesh.rotation.y = time / 10000;

  renderer.render(scene, camera);
  stats.update();
}

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//const folder = gui.addFolder('Camera');
//folder.add(camera.position, 'x').min(-100).max(100).step(0.1);





