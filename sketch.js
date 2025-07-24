// Configs for the Canvas
let width = document.documentElement.clientWidth;
if (width > 1000) width = 1000;
const canvasSize = width;

// Setup function from p5.js
function setup() {
  createCanvas(canvasSize, canvasSize).parent('canvas');
  textFont("Calibri");
  background(0);
}

// Draw function from p5.js
function draw() {

}
