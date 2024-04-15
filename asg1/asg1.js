// ColoredPoint.js (c) 2012 matsuda
// Modified by Bruce Tang for CSE 160 at UCSC
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;
function addActionsForHtmlUI() {
  // Buttons
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; gl.clear(gl.COLOR_BUFFER_BIT); };
  document.getElementById('drawPicture').onclick = function() { drawPicture(); };
  document.getElementById('pointButton').onclick = function() { g_selectedType = POINT; };
  document.getElementById('triButton').onclick = function() { g_selectedType = TRIANGLE; };
  document.getElementById('circleButton').onclick = function() { g_selectedType = CIRCLE; };
  document.getElementById('musicButton').onclick = function() { playMusic(); };
  // Color sliders
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value / 100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value / 100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value / 100; });
  // Other sliders
  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
  document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSegments = this.value; })
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev); } } ;
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function click(ev) {
  let [x,y] = convertCoordinatesEventToGL(ev);
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return [x,y];
}

function renderAllShapes() {
  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  // var len = g_points.length;
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}

function drawPicture() {
  g_selectedColor = [0.5,0.8,0.9,1.0];
  gl.uniform4f(u_FragColor, g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]);
  drawTriangle([-1,-1,1,-1,-1,1]); // sky background 1
  drawTriangle([1,-1,1,1,-1,1]); // sky background 2
  g_selectedColor = [0.1,0.1,0.1,1.0];
  gl.uniform4f(u_FragColor, g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]);
  drawTriangle([-0.625,-0.9375,-0.375,-0.9375,-0.625,-0.6875]); // 1
  drawTriangle([-0.375,-0.9375,-0.375,-0.6875,-0.625,-0.6875]); // 2
  drawTriangle([0.625,-0.9375,0.375,-0.9375,0.625,-0.6875]); // 3
  drawTriangle([0.375,-0.9375,0.375,-0.6875,0.625,-0.6875]); // 4
  drawTriangle([-0.125,0.6875,0.125,0.6875,-0.125,0.8125]); // 27
  drawTriangle([0.125,0.6875,0.125,0.8125,-0.125,0.8125]); // 28
  drawTriangle([-0.625,0.71875,-0.125,0.6875,-0.625,0.84375]); // 29
  drawTriangle([-0.125,0.6875,-0.125,0.8125,-0.625,0.84375]); // 30
  drawTriangle([-1,0.84375,-0.625,0.71875,-1,1]); // 31
  drawTriangle([-0.625,0.71875,-0.625,0.84375,-1,1]); // 32
  drawTriangle([0.625,0.71875,0.125,0.6875,0.625,0.84375]); // 33
  drawTriangle([0.125,0.6875,0.125,0.8125,0.625,0.84375]); // 34
  drawTriangle([1,0.84375,0.625,0.71875,1,1]); // 35
  drawTriangle([0.625,0.71875,0.625,0.84375,1,1]); // 36
  g_selectedColor = [0.9,0.1,0.0,1.0];
  gl.uniform4f(u_FragColor, g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]);
  drawTriangle([-0.625,-0.6875,-0.375,-0.6875,-0.625,0.1875]); // 5
  drawTriangle([-0.375,-0.6875,-0.375,0.1875,-0.625,0.1875]); // 6
  drawTriangle([0.625,-0.6875,0.375,-0.6875,0.625,0.1875]); // 7
  drawTriangle([0.375,-0.6875,0.375,0.1875,0.625,0.1875]); // 8
  drawTriangle([-0.9375,0.1875,0.9375,0.1875,-0.9375,0.375]); // 9
  drawTriangle([0.9375,0.1875,0.9375,0.375,-0.9375,0.375]); // 10
  drawTriangle([0.375,0.375,0.625,0.375,0.375,0.59325]); // 11
  drawTriangle([0.625,0.375,0.625,0.59325,0.375,0.59325]); // 12
  drawTriangle([-0.375,0.375,-0.625,0.375,-0.625,0.59325]); // 13
  drawTriangle([-0.375,0.375,-0.375,0.59325,-0.625,0.59325]); // 14
  drawTriangle([-0.125,0.375,0.125,0.375,-0.125,0.5625]); // 15
  drawTriangle([0.125,0.375,0.125,0.5625,-0.125,0.5625]); // 16
  drawTriangle([-0.125,0.5625,0.125,0.5625,-0.125,0.6875]); // 17
  drawTriangle([0.125,0.5625,0.125,0.6875,-0.125,0.6875]); // 18
  drawTriangle([-0.625,0.59325,-0.125,0.5625,-0.625,0.71875]); // 19
  drawTriangle([-0.125,0.5625,-0.125,0.6875,-0.625,0.71875]); // 20
  drawTriangle([-0.8125,0.625,-0.625,0.59325,-0.8125,0.78125]); // 21
  drawTriangle([-0.625,0.59325,-0.625,0.71875,-0.8125,0.78125]); // 22
  drawTriangle([0.625,0.59325,0.125,0.5625,0.625,0.71875]); // 23
  drawTriangle([0.125,0.5625,0.125,0.6875,0.625,0.71875]); // 24
  drawTriangle([0.8125,0.625,0.625,0.59325,0.8125,0.78125]); // 25
  drawTriangle([0.625,0.59325,0.625,0.71875,0.8125,0.78125]); // 26
}

function playMusic() {
  var audio = document.getElementById("music");
  audio.play();
}