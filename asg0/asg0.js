// DrawTriangle.js (c) 2012 matsuda
function drawVector(v, color) {
  ctx.beginPath();
  ctx.moveTo(200, 200);
  var x = v.elements[0] * 20;
  var y = v.elements[1] * 20;
  ctx.lineTo(200 + x, 200 - y);
  if (color == "red") {
    ctx.strokeStyle = "#ff0000";
  }
  if (color == "blue") {
    ctx.strokeStyle = "#0000ff";
  }
  if (color == "green") {
    ctx.strokeStyle = "#00ff00";
  }
  ctx.stroke();
}

function handleDrawEvent() {
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  var x1 = document.getElementById('x1').value;
  var y1 = document.getElementById('y1').value;
  var x2 = document.getElementById('x2').value;
  var y2 = document.getElementById('y2').value;
  var coordarray1 = [x1, y1, 0];
  var coordarray2 = [x2, y2, 0];
  var v1 = new Vector3(coordarray1);
  var v2 = new Vector3(coordarray2);
  drawVector(v1, "red");
  drawVector(v2, "blue");
}

function areaTriangle(v1, v2) {
  var v3 = Vector3.cross(v1, v2);
  var m = v3.magnitude();
  var a = m / 2;
  return a;
}

function handleDrawOperationEvent() {
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  var x1 = document.getElementById('x1').value;
  var y1 = document.getElementById('y1').value;
  var x2 = document.getElementById('x2').value;
  var y2 = document.getElementById('y2').value;
  var coordarray1 = [x1, y1, 0];
  var coordarray2 = [x2, y2, 0];
  var v1 = new Vector3(coordarray1);
  var v2 = new Vector3(coordarray2);
  drawVector(v1, "red");
  drawVector(v2, "blue");
  var operation = document.getElementById('operationselect').value;
  var scalar = document.getElementById('scalar').value;
  var v3, v4;
  if (operation == "add") {
    v3 = v1.add(v2);
    drawVector(v3, "green");
  } else if (operation == "sub") {
    v3 = v1.sub(v2);
    drawVector(v3, "green");
  } else if (operation == "mul") {
    v3 = v1.mul(scalar);
    v4 = v2.mul(scalar);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (operation == "div") {
    v3 = v1.div(scalar);
    v4 = v2.div(scalar);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (operation == "mag") {
    let m1 = v1.magnitude();
    let m2 = v2.magnitude();
    console.log("Magnitude v1: " + m1);
    console.log("Magnitude v2: " + m2);
  } else if (operation == "nor") {
    v3 = v1.normalize();
    v4 = v2.normalize();
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (operation == "ang") {
    let d1 = Vector3.dot(v1, v2);
    let m1 = v1.magnitude();
    let m2 = v2.magnitude();
    let m3 = m1 * m2;
    let d2 = d1 / m3;
    let d3 = Math.acos(d2);
    let d4 = d3 * 180 / Math.PI;
    console.log("Angle: " + d4);
  } else if (operation == "area") {
    let m = areaTriangle(v1, v2);
    console.log("Area of the triangle: " + m);
  }
}

function main() {  
  // Retrieve <canvas> element
  canvas = document.getElementById('cnv1');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  ctx = canvas.getContext('2d');

  // Draw a black rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height);        // Fill a rectangle with the color

  document.getElementById('drawbutton').onclick = function() {handleDrawEvent()};
  document.getElementById('drawbutton2').onclick = function() {handleDrawOperationEvent()};
}
