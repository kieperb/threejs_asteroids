/*
// https://dustinpfister.github.io/2018/04/22/threejs-cube-texture/
// https://jsfiddle.net/greggman/38qdzb9k/
const drawingCanvas = document.createElement('canvas');
document.body.appendChild(drawingCanvas);
const ctx = drawingCanvas.getContext('2d');
ctx.canvas.width = 2048;
ctx.canvas.height = 2048;

for (let i = 0; i < 9500; i++) {
  ctx.beginPath();
  ctx.arc(Math.random() * 2048, Math.random() * 2048, Math.random() * 1.3, 0, 2 * Math.PI);

  if (Math.random() < 0.7) {
    // bläulich
    ctx.fillStyle = "rgba(185, 185, " + (Math.random() * 55 + 200) + ", " + Math.random() + ")";
  } else {
    // rötlich
    ctx.fillStyle = "rgba(" + (Math.random() * 55 + 200) + ", 185, 185, " + Math.random() + ")";
  }
  ctx.fill();
}

*/

function createStarTexture(width, height, numberOfStars) {
  const drawingCanvas = document.createElement('canvas');
  const ctx = drawingCanvas.getContext('2d');
  ctx.canvas.width = width;
  ctx.canvas.height = height;

  const fullCircle = 2 * Math.PI;

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