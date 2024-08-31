// Three.js - Background Cubemap
// from https://threejsfundamentals.org/threejs/threejs-background-cubemap.html
// https://jsfiddle.net/greggman/38qdzb9k/
'use strict';

/* global THREE */

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.autoClearColor = false;

  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 3;

  const controls = new THREE.OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.update();

  const scene = new THREE.Scene();

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  function makeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({ color });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cube.position.x = x;

    return cube;
  }

  const cubes = [
    makeInstance(geometry, 0x44aa88, 0),
    makeInstance(geometry, 0x8844aa, -2),
    makeInstance(geometry, 0xaa8844, 2),
  ];

  const cubeScene = new THREE.Scene();
  const cubeCamera = new THREE.CubeCamera(0.1, 100, 2048, {
    magFilter: THREE.NarestFilter
  });
  cubeScene.add(cubeCamera);

  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = 4;
  ctx.canvas.height = 4;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = 'white';
  const halfWidth = ctx.canvas.width / 2;
  const halfHeight = ctx.canvas.height / 2;
  ctx.fillRect(0, 0, halfWidth, halfHeight);
  ctx.fillRect(halfWidth, halfHeight, halfWidth, halfHeight);
  const checker = new THREE.CanvasTexture(ctx.canvas);
  checker.magFilter = THREE.NearestFilter;
  checker.repeat.x = 20;
  checker.repeat.y = 800;
  checker.wrapS = THREE.RepeatWrapping;
  checker.wrapT = THREE.RepeatWrapping;
  const sphereGeo = new THREE.CylinderBufferGeometry(1, 1, 300, 24, 1);
  const sphereMat = new THREE.MeshBasicMaterial({
    //color: 'red',
    map: checker,
    side: THREE.DoubleSide,
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  cubeScene.add(sphere);
  cubeCamera.update(renderer, cubeScene)

  const bgScene = new THREE.Scene();
  let bgMesh;
  {
    const shader = THREE.ShaderLib.cube;
    const material = new THREE.ShaderMaterial({
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: shader.uniforms,
      depthWrite: false,
      side: THREE.BackSide,
    });
    material.uniforms.tCube.value = cubeCamera.renderTarget.texture;
    const plane = new THREE.BoxBufferGeometry(2, 2, 2);
    bgMesh = new THREE.Mesh(plane, material);
    bgScene.add(bgMesh);
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    cubes.forEach((cube, ndx) => {
      const speed = 1 + ndx * .1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    });

    bgMesh.position.copy(camera.position);
    renderer.render(bgScene, camera);
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
