// https://dustinpfister.github.io/2018/04/22/threejs-cube-texture/


/*
//console.log(createPositions(90, 10));
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
*/


/*
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
*/
