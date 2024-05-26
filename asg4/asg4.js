// ColoredPoint.js (c) 2012 matsuda
// Modified by Bruce Tang for CSE 160 at UCSC
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0);
    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else {
      gl_FragColor = vec4(1,.2,.2,1);
    }
    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);
    // if (r < 1.0) {
    //   gl_FragColor = vec4(1,0,0,1);
    // } else if (r < 2.0) {
    //   gl_FragColor = vec4(0,1,0,1);
    // }
    // gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);
    vec3 R = reflect(-L, N);
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));
    float specular = pow(max(dot(E, R), 0.0), 100.0);
    vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.3;
    if (u_lightOn) {
      gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
    }
  }`

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_whichTexture;
let u_lightPos;
let u_cameraPos;
let u_lightOn;

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
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
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
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }
  // Get the storage location of u_Sampler
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
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
let g_xAxis = true;
let g_yAxis = false;
let g_texUnit0 = false;
let g_texUnit1 = false;
let g_camera = new Camera();
let g_normalOn = false;
let g_lightPos = [0,1,-2];
let g_lightOn = true;

function addActionsForHtmlUI() {
  document.getElementById('animationLegOffButton').onclick = function () { g_legAnimation = false; };
  document.getElementById('animationLegOnButton').onclick = function () { g_legAnimation = true; };
  document.getElementById('animationHeadOffButton').onclick = function () { g_headAnimation = false; };
  document.getElementById('animationHeadOnButton').onclick = function () { g_headAnimation = true; };
  document.getElementById('animationTailOffButton').onclick = function () { g_tailAnimation = false; };
  document.getElementById('animationTailOnButton').onclick = function () { g_tailAnimation = true; };
  document.getElementById('animationJawOffButton').onclick = function () { g_jawAnimation = false; };
  document.getElementById('animationJawOnButton').onclick = function () { g_jawAnimation = true; };
  document.getElementById('normalOnButton').onclick = function () { g_normalOn = true; };
  document.getElementById('normalOffButton').onclick = function () { g_normalOn = false; };
  document.getElementById('xaxisButton').onclick = function () { g_xAxis = true; g_yAxis = false; };
  document.getElementById('yaxisButton').onclick = function () { g_yAxis = true; g_xAxis = false; };
  document.getElementById('lightOnButton').onclick = function () { g_lightOn = true; };
  document.getElementById('lightOffButton').onclick = function () { g_lightOn = false; };
  document.getElementById('jawSlide').addEventListener('mousemove', function() { g_jawAngle = this.value; renderAllShapes(); });
  document.getElementById('headSlide').addEventListener('mousemove', function() { g_headAngle = this.value; renderAllShapes(); });
  document.getElementById('tailSlide').addEventListener('mousemove', function() { g_tailAngle = this.value; renderAllShapes(); });
  document.getElementById('rightBackSlide').addEventListener('mousemove', function() { g_rightBackAngle = this.value; renderAllShapes(); });
  document.getElementById('leftBackSlide').addEventListener('mousemove', function() { g_leftBackAngle = this.value; renderAllShapes(); });
  document.getElementById('leftFrontSlide').addEventListener('mousemove', function() { g_leftFrontAngle = this.value; renderAllShapes(); });
  document.getElementById('rightFrontSlide').addEventListener('mousemove', function() { g_rightFrontAngle = this.value; renderAllShapes(); });
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) { g_lightPos[0] = this.value/100; renderAllShapes(); }});
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) { g_lightPos[1] = this.value/100; renderAllShapes(); }});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) { g_lightPos[2] = this.value/100; renderAllShapes(); }});

}

function initTextures() {
  var texture = gl.createTexture();   // Create a texture object
  var texture1 = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  if (!texture1) {
    console.log('Failed to create the texture1 object');
    return false;
  }
  var image = new Image();  // Create the image object
  var image1 = new Image();
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  if (!image1) {
    console.log('Failed to create the image1 object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ sendImageToTEXTURE0(texture, u_Sampler0, image, 0); };
  image1.onload = function(){ sendImageToTEXTURE0(texture1, u_Sampler1, image1, 1); };
  // Tell the browser to load an image
  image.src = 'sky.jpg';
  image1.src = '7herbs.jpg';

  return true;
}

function sendImageToTEXTURE0(texture, u_Sampler, image, texUnit) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  if (texUnit == 0) {
    gl.activeTexture(gl.TEXTURE0);
    g_texUnit0 = true;
  } else {
    gl.activeTexture(gl.TEXTURE1);
    g_texUnit1 = true;
  }
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler, texUnit);
  
  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

 // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log("Finished loadTexture");
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  // Register function (event handler) to be called on a mouse press
  //canvas.onmousedown = click;
  //canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev); } } ;
  g_camera.setCamera();
  document.onkeydown = keydown;
  initTextures();
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
  g_lightPos[0] = Math.cos(g_seconds);
}

function keydown(ev) {
  if (ev.keyCode == 87) {
    g_camera.moveForward();
  } else if (ev.keyCode == 83) {
    g_camera.moveBackwards();
  } else if (ev.keyCode == 65) {
    g_camera.moveLeft();
  } else if (ev.keyCode == 68) {
    g_camera.moveRight();
  } else if (ev.keyCode == 81) {
    g_camera.panLeft();
  } else if (ev.keyCode == 69) {
    g_camera.panRight();
  } else if (ev.keyCode == 82) {
    placeBlock();
  } else if (ev.keycode == 70) {
    deleteBlock();
  }
  renderAllShapes();
  g_camera.setCamera();
  console.log(ev.keyCode);
}

var g_map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]

function drawMap() {
  for (x = 0; x < 32; x++) {
    for (y = 0; y < 32; y++) {
      for (z = 0; z < 3; z++) {
        if (g_map[x][y] >= 1) {
          var wall = new Cube();
          wall.color = [1.0,1.0,1.0,1.0];
          wall.textureNum = -2;
          wall.matrix.translate(x-4, -0.6+z, y-4);
          wall.render();
        }
      }
    }
  }
}

function placeBlock() {
  let f = new Vector3();
  f.set(g_camera.at);
  f.sub(g_camera.eye);
  f.normalize();
  let g = new Vector3();
  g.set(g_camera.eye);
  g.add(f);
  g_map[Math.floor(g.elements[0])+4][Math.floor(g.elements[2])+4] += 1;
  renderAllShapes();
}

function renderAllShapes() {
  var startTime = performance.now();
  // var projMat = new Matrix4();
  // projMat.setPerspective(60, canvas.width/canvas.height, .1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);
  // var viewMat = new Matrix4();
  // viewMat.setLookAt(0,0,3, 0,0,-100, 0,1,0);
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);
  if (g_xAxis == true) {
    var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  } else {
    var globalRotMat = new Matrix4().rotate(g_globalAngle,1,0,0);
  }
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // var len = g_points.length;
  // var len = g_shapesList.length;
  // for(var i = 0; i < len; i++) {
  //   g_shapesList[i].render();
  // }
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
  gl.uniform1i(u_lightOn, g_lightOn);
  var light = new Cube();
  light.color = [2,2,0,1];
  light.textureNum = -2;
  light.matrix.translate(g_lightPos[0],g_lightPos[1],g_lightPos[2]);
  light.matrix.scale(-.1,-.1,-.1);
  light.matrix.translate(-.5,-.5,-.5);
  light.render();
  var ball = new Sphere();
  if (g_normalOn) {
    ball.textureNum = -3;
  } else {
    ball.textureNum = -2;
  }
  ball.matrix.translate(0,0.1,0);
  ball.matrix.scale(0.5,0.5,0.5);
  ball.matrix.translate(-3,0,0)
  ball.render();
  var ground = new Cube();
  ground.color = [1.0,0.0,0.0,1.0];
  ground.textureNum = 1;
  ground.matrix.translate(0,-.6,0);
  ground.matrix.scale(32,0,32);
  ground.matrix.translate(-.1,0,-.1);
  ground.render();
  var sky = new Cube();
  sky.color = [0.0,1.0,1.0,1.0];
  if (g_normalOn) {
    sky.textureNum = -3;
  } else {
    sky.textureNum = -2;
  }
  sky.matrix.scale(-100,-100,-100);
  sky.matrix.translate(-.5,-.5,-.5);
  sky.render();
  var body = new Cube();
  body.color = [0.9,0.9,0.9,1.0];
  if (g_normalOn) {
    body.textureNum = -3;
  } else {
    body.textureNum = -2;
  }
  body.matrix.translate(-.25,-.25,-.35);
  // body.matrix.rotate(-5,1,0,0);
  body.matrix.scale(0.5,.5,.75);
  body.render();
  var leftFrontLeg = new Cube();
  leftFrontLeg.color = [0.9,0.9,0.9,1.0];
  if (g_normalOn) {
    leftFrontLeg.textureNum = -3;
  } else {
    leftFrontLeg.textureNum = -2;
  }
  leftFrontLeg.matrix.translate(0,0,-.34);
  leftFrontLeg.matrix.rotate(g_leftFrontAngle,1,0,0);
  leftFrontLeg.matrix.translate(-.2,-.55,0);
  leftFrontLeg.matrix.scale(0.1,0.4,0.1);
  leftFrontLeg.render();
  var rightFrontLeg = new Cube();
  rightFrontLeg.color = [0.9,0.9,0.9,1.0];
  if (g_normalOn) {
    rightFrontLeg.textureNum = -3;
  } else {
    rightFrontLeg.textureNum = -2;
  }
  rightFrontLeg.matrix.translate(0,0,-.34);
  rightFrontLeg.matrix.rotate(g_rightFrontAngle,1,0,0);
  rightFrontLeg.matrix.translate(.1,-.55,0);
  rightFrontLeg.matrix.scale(0.1,0.4,0.1);
  rightFrontLeg.render();
  var leftBackLeg = new Cube();
  leftBackLeg.color = [0.9,0.9,0.9,1.0];
  if (g_normalOn) {
    leftBackLeg.textureNum = -3;
  } else {
    leftBackLeg.textureNum = -2;
  }
  leftBackLeg.matrix.translate(0,0,.29);
  leftBackLeg.matrix.rotate(g_leftBackAngle,1,0,0);
  leftBackLeg.matrix.translate(-.2,-.55,0);
  leftBackLeg.matrix.scale(0.1,0.4,0.1);
  leftBackLeg.render();
  var rightBackLeg = new Cube();
  rightBackLeg.color = [0.9,0.9,0.9,1.0];
  if (g_normalOn) {
    rightBackLeg.textureNum = -3;
  } else {
    rightBackLeg.textureNum = -2;
  }
  rightBackLeg.matrix.translate(0,0,.29);
  rightBackLeg.matrix.rotate(g_rightBackAngle,1,0,0);
  rightBackLeg.matrix.translate(.1,-.55,0);
  rightBackLeg.matrix.scale(0.1,0.4,0.1);
  rightBackLeg.render();
  var tail = new Cube();
  tail.color = [0.9,0.9,0.9,1];
  if (g_normalOn) {
    tail.textureNum = -3;
  } else {
    tail.textureNum = -2;
  }
  tail.matrix.rotate(g_tailAngle,0,1,0);
  tail.matrix.translate(-.05,.15,.29);
  tail.matrix.scale(0.1,0.1,0.4);
  tail.render();
  var upperJaw = new Cube();
  upperJaw.color = [1,1,1,1];
  if (g_normalOn) {
    upperJaw.textureNum = -3;
  } else {
    upperJaw.textureNum = -2;
  }
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
  if (g_normalOn) {
    lowerJaw.textureNum = -3;
  } else {
    lowerJaw.textureNum = -2;
  }
  lowerJaw.matrix = jawCoords;
  lowerJaw.matrix.translate(-.125,.2,0);
  lowerJaw.matrix.rotate(g_jawAngle,1,0,0);
  lowerJaw.matrix.translate(0,0,-.6);
  lowerJaw.matrix.scale(0.25,0.05,0.25);
  lowerJaw.render();
  var head = new Cube();
  head.color = [0.9,0.9,0.9,1];
  if (g_normalOn) {
    head.textureNum = -3;
  } else {
    head.textureNum = -2;
  }
  head.matrix = jawCoords2;
  head.matrix.translate(-.15,.4,-.5);
  head.matrix.scale(0.3,0.15,0.3);
  head.render();
  var leftEar = new Cube();
  leftEar.color = [0.9,0.9,0.9,1];
  if (g_normalOn) {
    leftEar.textureNum = -3;
  } else {
    leftEar.textureNum = -2;
  }
  leftEar.matrix = jawCoords3;
  leftEar.matrix.translate(-.15,.55,-.3);
  leftEar.matrix.scale(0.05,0.1,0.05);
  leftEar.render();
  var rightEar = new Cube();
  rightEar.color = [0.9,0.9,0.9,1];
  if (g_normalOn) {
    rightEar.textureNum = -3;
  } else {
    rightEar.textureNum = -2;
  }
  rightEar.matrix = jawCoords4;
  rightEar.matrix.translate(.1,.55,-.3);
  rightEar.matrix.scale(0.05,0.1,0.05);
  rightEar.render();
  var leftEye = new Cube();
  leftEye.color = [0,0,1,1];
  leftEye.textureNum = 0;
  leftEye.matrix = jawCoords5;
  leftEye.matrix.translate(-.15,.4,-.51);
  leftEye.matrix.scale(0.05,0.1,0.001);
  leftEye.render();
  var rightEye = new Cube();
  rightEye.color = [0,0,1,1];
  rightEye.textureNum = 0;
  rightEye.matrix = jawCoords6;
  rightEye.matrix.translate(.1,.4,-.51);
  rightEye.matrix.scale(0.05,0.1,0.01);
  rightEye.render();
  drawMap();

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