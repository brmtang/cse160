// ColoredPoint.js (c) 2012 matsuda
// Modified by Bruce Tang for CSE 160 at UCSC
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
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
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;
let g_globalAngle = 0;
let g_rightFrontAngle = 0;
let g_leftFrontAngle = 0;
let g_leftBackAngle = 0;
let g_rightBackAngle = 0;
let g_tailAngle = 0;
let g_headAngle = 0;
let g_jawAngle = 0;
let g_legAnimation = false;
let g_headAnimation = false;
let g_tailAnimation = false;
let g_jawAnimation = false;

function addActionsForHtmlUI() {
  document.getElementById('animationLegOffButton').onclick = function () { g_legAnimation = false; };
  document.getElementById('animationLegOnButton').onclick = function () { g_legAnimation = true; };
  document.getElementById('animationHeadOffButton').onclick = function () { g_headAnimation = false; };
  document.getElementById('animationHeadOnButton').onclick = function () { g_headAnimation = true; };
  document.getElementById('animationTailOffButton').onclick = function () { g_tailAnimation = false; };
  document.getElementById('animationTailOnButton').onclick = function () { g_tailAnimation = true; };
  document.getElementById('animationJawOffButton').onclick = function () { g_jawAnimation = false; };
  document.getElementById('animationJawOnButton').onclick = function () { g_jawAnimation = true; };
  document.getElementById('jawSlide').addEventListener('mousemove', function() { g_jawAngle = this.value; renderAllShapes(); });
  document.getElementById('headSlide').addEventListener('mousemove', function() { g_headAngle = this.value; renderAllShapes(); });
  document.getElementById('tailSlide').addEventListener('mousemove', function() { g_tailAngle = this.value; renderAllShapes(); });
  document.getElementById('rightBackSlide').addEventListener('mousemove', function() { g_rightBackAngle = this.value; renderAllShapes(); });
  document.getElementById('leftBackSlide').addEventListener('mousemove', function() { g_leftBackAngle = this.value; renderAllShapes(); });
  document.getElementById('leftFrontSlide').addEventListener('mousemove', function() { g_leftFrontAngle = this.value; renderAllShapes(); });
  document.getElementById('rightFrontSlide').addEventListener('mousemove', function() { g_rightFrontAngle = this.value; renderAllShapes(); });
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
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
  // gl.clear(gl.COLOR_BUFFER_BIT);
  // renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000;
var g_seconds = performance.now() / 1000 - g_startTime;

function tick() {
  g_seconds = performance.now() / 1000 - g_startTime;
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
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

function updateAnimationAngles() {
  if (g_legAnimation) {
     g_leftFrontAngle = (30*Math.sin(5*g_seconds));
     g_leftBackAngle = (30*Math.sin(5*g_seconds));
     g_rightFrontAngle = (-30*Math.sin(5*g_seconds));
     g_rightBackAngle = (-30*Math.sin(5*g_seconds));
  }
  if (g_tailAnimation) {
    g_tailAngle = (30*Math.sin(5*g_seconds));
  }
  if (g_headAnimation) {
    g_headAngle = (15*Math.sin(5*g_seconds));
  }
  if (g_jawAnimation) {
    g_jawAngle = -Math.abs(15*Math.sin(5*g_seconds));
  }
}

function renderAllShapes() {
  var startTime = performance.now();
  var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // var len = g_points.length;
  // var len = g_shapesList.length;
  // for(var i = 0; i < len; i++) {
  //   g_shapesList[i].render();
  // }
  var body = new Cube();
  body.color = [0.9,0.9,0.9,1.0];
  body.matrix.translate(-.25,-.25,-.35);
  // body.matrix.rotate(-5,1,0,0);
  body.matrix.scale(0.5,.5,.75);
  body.render();
  var leftFrontLeg = new Cube();
  leftFrontLeg.color = [0.9,0.9,0.9,1.0];
  leftFrontLeg.matrix.translate(0,0,-.34);
  leftFrontLeg.matrix.rotate(g_leftFrontAngle,1,0,0);
  leftFrontLeg.matrix.translate(-.2,-.55,0);
  leftFrontLeg.matrix.scale(0.1,0.4,0.1);
  leftFrontLeg.render();
  var rightFrontLeg = new Cube();
  rightFrontLeg.color = [0.9,0.9,0.9,1.0];
  rightFrontLeg.matrix.translate(0,0,-.34);
  rightFrontLeg.matrix.rotate(g_rightFrontAngle,1,0,0);
  rightFrontLeg.matrix.translate(.1,-.55,0);
  rightFrontLeg.matrix.scale(0.1,0.4,0.1);
  rightFrontLeg.render();
  var leftBackLeg = new Cube();
  leftBackLeg.color = [0.9,0.9,0.9,1.0];
  leftBackLeg.matrix.translate(0,0,.29);
  leftBackLeg.matrix.rotate(g_leftBackAngle,1,0,0);
  leftBackLeg.matrix.translate(-.2,-.55,0);
  leftBackLeg.matrix.scale(0.1,0.4,0.1);
  leftBackLeg.render();
  var rightBackLeg = new Cube();
  rightBackLeg.color = [0.9,0.9,0.9,1.0];
  rightBackLeg.matrix.translate(0,0,.29);
  rightBackLeg.matrix.rotate(g_rightBackAngle,1,0,0);
  rightBackLeg.matrix.translate(.1,-.55,0);
  rightBackLeg.matrix.scale(0.1,0.4,0.1);
  rightBackLeg.render();
  var tail = new Cube();
  tail.color = [0.9,0.9,0.9,1];
  tail.matrix.rotate(g_tailAngle,0,1,0);
  tail.matrix.translate(-.05,.15,.29);
  tail.matrix.scale(0.1,0.1,0.4);
  tail.render();
  var upperJaw = new Cube();
  upperJaw.color = [1,1,1,1];
  upperJaw.matrix.rotate(g_headAngle,1,0,0);
  var jawCoords = new Matrix4(upperJaw.matrix);
  var jawCoords2 = new Matrix4(upperJaw.matrix);
  var jawCoords3 = new Matrix4(upperJaw.matrix);
  var jawCoords4 = new Matrix4(upperJaw.matrix);
  var jawCoords5 = new Matrix4(upperJaw.matrix);
  var jawCoords6 = new Matrix4(upperJaw.matrix);
  upperJaw.matrix.translate(-.2,.25,-.6);
  upperJaw.matrix.scale(0.4,0.15,0.4);
  upperJaw.render();
  var lowerJaw = new Cube();
  lowerJaw.color = [1,1,1,1];
  lowerJaw.matrix = jawCoords;
  lowerJaw.matrix.translate(-.125,.2,0);
  lowerJaw.matrix.rotate(g_jawAngle,1,0,0);
  lowerJaw.matrix.translate(0,0,-.6);
  lowerJaw.matrix.scale(0.25,0.05,0.25);
  lowerJaw.render();
  var head = new Cube();
  head.color = [0.9,0.9,0.9,1];
  head.matrix = jawCoords2;
  head.matrix.translate(-.15,.4,-.5);
  head.matrix.scale(0.3,0.15,0.3);
  head.render();
  var leftEar = new Cube();
  leftEar.color = [0.9,0.9,0.9,1];
  leftEar.matrix = jawCoords3;
  leftEar.matrix.translate(-.15,.55,-.3);
  leftEar.matrix.scale(0.05,0.1,0.05);
  leftEar.render();
  var rightEar = new Cube();
  rightEar.color = [0.9,0.9,0.9,1];
  rightEar.matrix = jawCoords4;
  rightEar.matrix.translate(.1,.55,-.3);
  rightEar.matrix.scale(0.05,0.1,0.05);
  rightEar.render();
  var leftEye = new Cube();
  leftEye.color = [0,0,1,1];
  leftEye.matrix = jawCoords5;
  leftEye.matrix.translate(-.15,.4,-.51);
  leftEye.matrix.scale(0.05,0.1,0.001);
  leftEye.render();
  var rightEye = new Cube();
  rightEye.color = [0,0,1,1];
  rightEye.matrix = jawCoords6;
  rightEye.matrix.translate(.1,.4,-.51);
  rightEye.matrix.scale(0.05,0.1,0.01);
  rightEye.render();
  // var yellow = new Cube();
  // yellow.color = [1,1,0,1];
  // yellow.matrix.setTranslate(0,-.5,0);
  // yellow.matrix.rotate(-5,1,0,0);
  // yellow.matrix.rotate(-g_yellowAngle,0,0,1);
  // var yellowCoordinatesMat = new Matrix4(yellow.matrix);
  // yellow.matrix.scale(.25,.7,.5);
  // yellow.matrix.translate(-.5,0,0);
  // yellow.render();
  // var magenta = new Cube();
  // magenta.color = [1,0,1,1];
  // magenta.matrix = yellowCoordinatesMat;
  // magenta.matrix.translate(0,.65,0);
  // magenta.matrix.rotate(-g_magentaAngle,0,0,1);
  // magenta.matrix.scale(.3,.3,.3);
  // magenta.matrix.translate(-.5,0,-0.001);
  // box.matrix.translate(-.1,.1,0,0);
  // box.matrix.rotate(-30,1,0,0);
  // box.matrix.scale(.2,.4,.2);
  // magenta.render();

  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "performance");
}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}