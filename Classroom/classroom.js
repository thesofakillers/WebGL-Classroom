// Vertex shader program
var VSHADER_SOURCE =
  //attributes
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +        // Normal
  //uniforms
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +

  //varyings
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +

  //what to do i.e. (main)
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
     // Calculate the vertex position in the world coordinate
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program. Supports per fragment lighting
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  //uniforms
  'uniform vec3 u_DiffuseLight[5];\n' +   // array of Diffuse light colors
  'uniform vec3 u_LightPosition[5];\n' + // array of Positions of the light source
  'uniform vec3 u_AmbientLight;\n' +   // Color of an ambient light
  //varyings
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec4 v_Color;\n' +
  //what to do
  'void main() {\n' +
  '  vec3 diffuse;\n' + // declare diffuse color
  '  for(int i = 0; i < 5; i++) {\n' +
  //calculate distance between light source and objct
  '    float distance = length(u_LightPosition[i]-vec3(v_Position));\n'+
  // Normalize the normal because it is interpolated and not 1.0 in length any more
  '    vec3 normal = normalize(v_Normal);\n' +
  // Calculate the light direction and normalize it
  '    vec3 lightDirection = normalize(u_LightPosition[i] - vec3(v_Position));\n' +
        // The dot product of the light direction and the normal
  '    float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
        // Calculate the color due to diffuse reflection
  //calculate diffuse reflection. Simulate light attenuation with distance
  '    diffuse += (u_DiffuseLight[i] * v_Color.rgb * nDotL)*(1.0 / (1.0 + (0.40 * distance * distance)));\n' +
  '  }\n' +
  // Calculate the color due to ambient reflection //sum of lights
  '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
        // Add the surface colors due to diffuse reflection and ambient reflection //defining ambient light
  '  gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' + //defining color
  '}\n';

var modelMatrix = new Matrix4(); // The model matrix
var viewMatrix = new Matrix4();  // The view matrix
var projMatrix = new Matrix4();  // The projection matrix
var g_normalMatrix = new Matrix4();  // Coordinate transformation matrix for normals

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) { //handle exceptions
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {//handle exceptions
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set background color to dusk sky color and enable hidden surface removal
  gl.clearColor(0.40, 0.531, 0.849, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Get the storage locations of uniform attributes
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  //getting lights
  //sun
  var u_DiffuseLight0 = gl.getUniformLocation(gl.program, 'u_DiffuseLight[0]');
  var u_LightPosition0 = gl.getUniformLocation(gl.program, 'u_LightPosition[0]');
  //front left
  var u_DiffuseLight1 = gl.getUniformLocation(gl.program, 'u_DiffuseLight[1]');
  var u_LightPosition1 = gl.getUniformLocation(gl.program, 'u_LightPosition[1]');
  //front right
  var u_DiffuseLight2 = gl.getUniformLocation(gl.program, 'u_DiffuseLight[2]');
  var u_LightPosition2 = gl.getUniformLocation(gl.program, 'u_LightPosition[2]');
  //back left
  var u_DiffuseLight3 = gl.getUniformLocation(gl.program, 'u_DiffuseLight[3]');
  var u_LightPosition3 = gl.getUniformLocation(gl.program, 'u_LightPosition[3]');
  //back right
  var u_DiffuseLight4 = gl.getUniformLocation(gl.program, 'u_DiffuseLight[4]');
  var u_LightPosition4 = gl.getUniformLocation(gl.program, 'u_LightPosition[4]');
  //ambient
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');

  // //checking storage location success
  // if (!u_ModelMatrix || !u_ViewMatrix || !u_NormalMatrix ||
  //     !u_ProjMatrix || !u_AmbientLight || !u_LightPosition0
  //     || !u_DiffuseLight0 || !u_LightPosition1 || !u_DiffuseLight1 ||
  //     !u_LightPosition2 || !u_DiffuseLight2 || !u_LightPosition3 ||
  //     !u_DiffuseLight3 || !u_LightPosition4 || !u_DiffuseLight4) {
  //   console.log('Failed to Get the storage locations of uniforms');
  //   return;
  // }
  //checking storage location success
  if (!u_ModelMatrix || !u_ViewMatrix || !u_NormalMatrix ||
      !u_ProjMatrix || !u_AmbientLight || !u_LightPosition0
      || !u_DiffuseLight0 || !u_LightPosition1 || !u_DiffuseLight1 ||
      !u_LightPosition2 || !u_DiffuseLight2 || !u_LightPosition3 ||
      !u_DiffuseLight3 || !u_LightPosition4 || !u_DiffuseLight4) {
    console.log('Failed to Get the storage locations of uniforms');
    return;
  }

  //assigning values to light uniforms
    //lights
      //sun
  gl.uniform3f(u_DiffuseLight0, sunIntensity, sunIntensity, sunIntensity);
        // Set the light position (sun is outside, on the window side, slightly behind)
  gl.uniform3f(u_LightPosition0, 40, 30, -30);

      //artifical lights
        //color setting (tungsten)
          //top left
  gl.uniform3f(u_DiffuseLight1, LightScale1*255/255, LightScale1*197/255, LightScale1*140/255);
          //top right
  gl.uniform3f(u_DiffuseLight2, LightScale2*255/255, LightScale2*197/255, LightScale2*140/255);
          //back left
  gl.uniform3f(u_DiffuseLight3, LightScale3*255/255, LightScale3*197/255, LightScale3*140/255);
          //back right
  gl.uniform3f(u_DiffuseLight4, LightScale4*255/255, LightScale4*197/255, LightScale4*140/255);
        //position setting
          // top left
  gl.uniform3f(u_LightPosition1, 6, 9, 16);
          // top right
  gl.uniform3f(u_LightPosition2, -6, 9, 16);
          // back left
  gl.uniform3f(u_LightPosition3, 6, 9, -6);
          // back right
  gl.uniform3f(u_LightPosition4, -6, 9, -6);

      //ambient light (almost unnescessary)
  gl.uniform3f(u_AmbientLight, 0.15, 0.15, 0.15);

  // Calculate the view matrix and the projection matrix
  viewMatrix.setLookAt(cameraX, cameraY, cameraZ, lookX, lookY, lookZ, 0, 1, 0);
  projMatrix.setPerspective(60, canvas.width/canvas.height, 1, 100);
  // Pass the model, view, and projection matrix to the uniform variable respectively
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  //detect keypress
  document.onkeydown = function(ev){
    //call keydown when key is pressed
    keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_ViewMatrix,
      u_DiffuseLight0, u_DiffuseLight1, u_DiffuseLight2, u_DiffuseLight3,
      u_DiffuseLight4);
  };
  draw(gl, u_ModelMatrix, u_NormalMatrix); //draws everything
}

//variables used throughout document
//set to initial values, will change on key press generally
// variables used for camera interaction
var cameraTranslStep = 0.005; // The increments of rotation angle (degrees)
var shiftStep = 0.5
var lookAngleStep = 0.05
var angleSTEP = 1
var cameraY = 10;
var cameraX = 0;
var cameraZ = -15;
var lookY = -50;
var lookX = 0;
var lookZ = 100;
//variables necessary for object interaction
var doorAngle = 90; // is increased/decreased on keypress to open/close door
var chairDepth = 1; //is increased/decresed on keypress to move chairs in and out
var blindAngle = 0;
var drawingScale = 0;
//variables necessary for lights
var sunIntensity = 1000;
var LightScale1 = 0
var LightScale2 = 0
var LightScale3 = 0
var LightScale4 = 0
var toggle1 = false
var toggle2 = false
var toggle3 = false
var toggle4 = false

//carrys out actions depending on what key is pressed
function keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_ViewMatrix,
  u_DiffuseLight0, u_DiffuseLight1, u_DiffuseLight2, u_DiffuseLight3,
  u_DiffuseLight4) {
  switch (ev.keyCode) {
    case 87: // w  key -> move camera towards target
      //based on the vector equation of a line
      cameraX = cameraX + cameraTranslStep*(lookX-cameraX);
      cameraY = cameraY + cameraTranslStep*(lookY-cameraY);
      cameraZ = cameraZ + cameraTranslStep*(lookZ-cameraZ);
      viewMatrix.setLookAt(cameraX, cameraY, cameraZ, lookX, lookY, lookZ, 0, 1, 0);
      gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
      break;
    case 83: // s key -> move camera away from target
      //based on the vector equation of a line
      cameraX = cameraX - cameraTranslStep*(lookX-cameraX);
      cameraY = cameraY - cameraTranslStep*(lookY-cameraY);
      cameraZ = cameraZ - cameraTranslStep*(lookZ-cameraZ);
      viewMatrix.setLookAt(cameraX, cameraY, cameraZ, lookX, lookY, lookZ, 0, 1, 0);
      gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
      break;
    case 68: // d key -> strafe right
      //hard to explain this with comments, rough diagram at https://i.imgur.com/QTqzLSq.png
      //denominator and numerator are result of dotproduct to calculate angle
      var numerator = cameraX - lookX
      var denominator = Math.sqrt(Math.pow((lookX-cameraX), 2) + Math.pow((lookZ-cameraZ), 2))
      var theta = Math.acos(numerator/denominator)
      var shiftZ = shiftStep*Math.cos(theta)
      var shiftX = shiftStep*Math.sin(theta)
      lookX = lookX - shiftX
      cameraX = cameraX - shiftX
      lookZ = lookZ - shiftZ
      cameraZ = cameraZ - shiftZ
      viewMatrix.setLookAt(cameraX, cameraY, cameraZ, lookX, lookY, lookZ, 0, 1, 0);
      gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
      break;
    case 65: // a key -> strafe left
      //same as strafe right
      var numerator = cameraX - lookX
      var denominator = Math.sqrt(Math.pow((lookX-cameraX), 2) + Math.pow((lookZ-cameraZ), 2))
      var theta = Math.acos(numerator/denominator)
      var shiftZ = shiftStep*Math.cos(theta)
      var shiftX = shiftStep*Math.sin(theta)
      lookX = lookX + shiftX
      cameraX = cameraX + shiftX
      lookZ = lookZ + shiftZ
      cameraZ = cameraZ + shiftZ
      viewMatrix.setLookAt(cameraX, cameraY, cameraZ, lookX, lookY, lookZ, 0, 1, 0);
      gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
      break;
    case 81: // q key -> strafe up
      //same as strafe right, x changed to Y
      var numerator = cameraY - lookY
      var denominator = Math.sqrt(Math.pow((lookY-cameraY), 2) + Math.pow((lookZ-cameraZ), 2))
      var theta = Math.acos(numerator/denominator)
      var shiftZ = shiftStep*Math.cos(theta)
      var shiftY = shiftStep*Math.sin(theta)
      lookY = lookY + shiftY
      cameraY = cameraY + shiftY
      lookZ = lookZ - shiftZ
      cameraZ = cameraZ - shiftZ
      viewMatrix.setLookAt(cameraX, cameraY, cameraZ, lookX, lookY, lookZ, 0, 1, 0);
      gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
      break;
    case 69: // e -> strafe down
      //same as strafe up
      var numerator = cameraY - lookY
      var denominator = Math.sqrt(Math.pow((lookY-cameraY), 2) + Math.pow((lookZ-cameraZ), 2))
      var theta = Math.acos(numerator/denominator)
      var shiftZ = shiftStep*Math.cos(theta)
      var shiftY = shiftStep*Math.sin(theta)
      lookY = lookY - shiftY
      cameraY = cameraY - shiftY
      lookZ = lookZ + shiftZ
      cameraZ = cameraZ + shiftZ
      viewMatrix.setLookAt(cameraX, cameraY, cameraZ, lookX, lookY, lookZ, 0, 1, 0);
      gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
      break;
    //pitch and yaw are just coordinate transform after rotation
    case 38: // up key -> pitch up
      lookY = lookZ * Math.sin(lookAngleStep%(2*Math.PI)) + lookY*Math.cos(lookAngleStep%(2*Math.PI))
      lookZ = lookZ * Math.cos(lookAngleStep%(2*Math.PI)) - lookY*Math.sin(lookAngleStep%(2*Math.PI))
      viewMatrix.setLookAt(cameraX, cameraY, cameraZ, lookX, lookY, lookZ, 0, 1, 0);
      gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
      break;
    case 40: // down key -> pitch down
      lookY = lookZ * Math.sin(-lookAngleStep%(2*Math.PI)) + lookY*Math.cos(-lookAngleStep%(2*Math.PI))
      lookZ = lookZ * Math.cos(-lookAngleStep%(2*Math.PI)) - lookY*Math.sin(-lookAngleStep%(2*Math.PI))
      viewMatrix.setLookAt(cameraX, cameraY, cameraZ, lookX, lookY, lookZ, 0, 1, 0);
      gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
      break;
    case 37: // left key -> yaw left
      lookX = lookZ * Math.sin(lookAngleStep%(2*Math.PI)) + lookX*Math.cos(lookAngleStep%(2*Math.PI))
      lookZ = lookZ * Math.cos(lookAngleStep%(2*Math.PI)) - lookX*Math.sin(lookAngleStep%(2*Math.PI))
      viewMatrix.setLookAt(cameraX, cameraY, cameraZ, lookX, lookY, lookZ, 0, 1, 0);
      gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
      break;
    case 39: // right key -> yaw right
      lookX = lookZ * Math.sin(-lookAngleStep%(2*Math.PI)) + lookX*Math.cos(-lookAngleStep%(2*Math.PI))
      lookZ = lookZ * Math.cos(-lookAngleStep%(2*Math.PI)) - lookX*Math.sin(-lookAngleStep%(2*Math.PI))
      viewMatrix.setLookAt(cameraX, cameraY, cameraZ, lookX, lookY, lookZ, 0, 1, 0);
      gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
      break;
    //opening door just consists in rotating it about y axis
    case 79: // o key -> open door
    if (doorAngle > -44){
      doorAngle = (doorAngle - angleSTEP) % 360;
    }
      console.log(doorAngle)
      break;
    case 80: // p key -> close door
      if (doorAngle < 90){
        doorAngle = (doorAngle + angleSTEP) % 360;
      }
      console.log(doorAngle)
      break;
    //change z translation for charis to move them
    case 77: // m key -> move chairs backwards
      if (chairDepth < 1.41){
        chairDepth = (chairDepth + shiftStep/50);
      }
      break;
    case 78: // n key -> move chairs forwards
      if (chairDepth > 0.96){
        chairDepth = (chairDepth - shiftStep/50);
      }
      break;
    //opening and closing blinds affects sun light intensity proportionally
    case 75: // k key -> close blinds
      if (((blindAngle) <= 90)&&((blindAngle) > -90)){
        blindAngle = (blindAngle - angleSTEP) % -360;
      }
      if (((blindAngle) < 0)&&((blindAngle) > -180)){
        sunIntensity = Math.abs(90+blindAngle)/90*1000
        gl.uniform3f(u_DiffuseLight0, sunIntensity, sunIntensity, sunIntensity);
      }else{
        sunIntensity = 1000
      }
      console.log(blindAngle)
      break;
    case 76: // l key -> open blinds
      if (((blindAngle) < 90)&&((blindAngle) >= -90)){
        blindAngle = (blindAngle + angleSTEP) % 360;
      }
      if (((blindAngle) < 0)&&((blindAngle) > -180)){
        sunIntensity = Math.abs(90+blindAngle)/90 *1000
        gl.uniform3f(u_DiffuseLight0, sunIntensity, sunIntensity, sunIntensity);
      }else{
        sunIntensity = 1000
      }
      console.log(blindAngle)
      break;
    //erasing and writing consists in scaling a dimension of the words
    case 67: // c key -> erase
      if ((drawingScale >= 0) && (drawingScale <= 1.1)){
        drawingScale -= shiftStep/10
      }
      break;
    case 86: // v key -> write
      if ((drawingScale > -0.1) && (drawingScale <= 1)){
        drawingScale += shiftStep/10
      }
      break;
    //toggle sets light intensity to 1 or 0 (current color or black)
    case 49: // 1  key -> toggle top left light
      toggle1 = !toggle1;
      if (toggle1){
        LightScale1 = 20
      } else{
        LightScale1 = 0
      }
      gl.uniform3f(u_DiffuseLight1, LightScale1*255/255, LightScale1*241/255, LightScale1*224/255);
      break;
    case 50: // 2 key -> toggle top right light
      toggle2 = !toggle2;
      if (toggle2){
        LightScale2 = 20
      } else{
        LightScale2 = 0
      }
      gl.uniform3f(u_DiffuseLight2, LightScale2*255/255, LightScale2*241/255, LightScale2*224/255);
      break;
    case 51: // 3 key -> toggle back left light
      toggle3 = !toggle3;
      if (toggle3){
        LightScale3 = 20
      } else{
        LightScale3 = 0
      }
      gl.uniform3f(u_DiffuseLight3, LightScale3*255/255, LightScale3*241/255, LightScale3*224/255);
      break;
    case 52: // 4 key -> toggle back right light
      toggle4 = !toggle4;
      if (toggle4){
        LightScale4 = 20
      } else{
        LightScale4 = 0
      }
      gl.uniform3f(u_DiffuseLight4, LightScale4*255/255, LightScale4*241/255, LightScale4*224/255);
      break;
    default: return; // Skip drawing at no effective action
  }
  // Draw the scene whenever key is pressed
  draw(gl, u_ModelMatrix, u_NormalMatrix);
}

//initialize VertexBuffers. Color info is passed to be able to change color
function initVertexBuffers(gl, r, g, b) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array([   // Coordinates
     0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5, // v0-v1-v2-v3 front
     0.5, 0.5, 0.5,   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5, // v0-v3-v4-v5 right
     0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5, // v0-v5-v6-v1 up
    -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5, // v1-v6-v7-v2 left
    -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5, // v7-v4-v3-v2 down
     0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5  // v4-v7-v6-v5 back
  ]);

  var colors = new Float32Array([    // Colors //no gradients
    r, g, b,   r, g, b,   r, g, b,  r, g, b,     // v0-v1-v2-v3 front
    r, g, b,   r, g, b,   r, g, b,  r, g, b,     // v0-v3-v4-v5 right
    r, g, b,   r, g, b,   r, g, b,  r, g, b,     // v0-v5-v6-v1 up
    r, g, b,   r, g, b,   r, g, b,  r, g, b,     // v1-v6-v7-v2 left
    r, g, b,   r, g, b,   r, g, b,  r, g, b,     // v7-v4-v3-v2 down
    r, g, b,   r, g, b,   r, g, b,  r, g, b,　    // v4-v7-v6-v5 back
 ]);
  var normals = new Float32Array([    // Normal
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);


  // Indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
 ]);

  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer (gl, attribute, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}

var g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}
function popMatrix() { // Retrieve the matrix from the array
  return g_matrixStack.pop();
}

function draw(gl, u_ModelMatrix, u_NormalMatrix) {

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Set the vertex coordinates and color (for the x, y axes) (color arbitrary)
  var n = initVertexBuffers(gl, 1, 1, 1) //basically need this for n

  //columns and rows of desks and chairs
  var Columns = 4
  var Rows = 4
  //drawing several desks
  for (i = 0; i < Columns; i++) {
    for (k = 0; k < Rows; k++) {
      // Rotate, and then translate
      modelMatrix.setTranslate(i*5-7.5, 0.3, k*7-10.5+1);  // Translation
      drawDesk(gl, u_ModelMatrix, u_NormalMatrix, n)
      }
    }
  //drawing several chairs
  for (i = 0; i < Columns; i++) {
    for (k = 0; k < Rows; k++) {
      // Rotate, and then translate
      modelMatrix.setTranslate(i*5-7.5, 0, k*7-10.5*chairDepth);  // Translation
      //modelMatrix.translate(0, 0, something) move chairs in and out
      drawChair(gl, u_ModelMatrix, u_NormalMatrix)
    }
  }
  //drawing teacher's desk
  modelMatrix.setTranslate(5, 0.3, 20)
  drawCattedra(gl, u_ModelMatrix, u_NormalMatrix)

  //drawing teacher's chair
  modelMatrix.setTranslate(5, 0, 22);
  modelMatrix.rotate(180, 0, 1, 0);
  drawChair(gl, u_ModelMatrix, u_NormalMatrix);

  //drawing whiteboard
  modelMatrix.setTranslate(-3, 4, 25.7)
  modelMatrix.rotate(180, 0, 1, 0)
  drawWhiteboard(gl, u_ModelMatrix, u_NormalMatrix, n)

  // drawing numbers
  modelMatrix.setTranslate(-3, 4, 25.6)
  modelMatrix.rotate(180, 0, 1, 0)
  var n = initVertexBuffers(gl, 0.1, 0.1, 0.1); // black
  drawNumbers(gl, u_ModelMatrix, u_NormalMatrix, n, drawingScale)

  //drawing front wall
  modelMatrix.setTranslate(0, 4.6, 26)
  drawSimpleWall(gl, u_ModelMatrix, u_NormalMatrix, n)

  //drawing back wall
  modelMatrix.setTranslate(0, 4.6, -16)
  drawSimpleWall(gl, u_ModelMatrix, u_NormalMatrix, n)

  //drawing floor
  modelMatrix.setTranslate(0, -1.45, 5.2)
  drawFloor(gl, u_ModelMatrix, u_NormalMatrix, n)

  //drawing ceiling
  modelMatrix.setTranslate(0, 10.5, 5.2)
  drawCeiling(gl, u_ModelMatrix, u_NormalMatrix, n)

  //drawing left wall with holes for windows
  for (i = 0; i < 4; i++) {
    modelMatrix.setTranslate(15, 4.6, -13+12*i)
    modelMatrix.scale(1, 1, 0.2)
    modelMatrix.rotate(90, 0, 1, 0)
    drawSimpleWall(gl, u_ModelMatrix, u_NormalMatrix, n)
  }
  //draw windows
  for (i = 0; i < 3; i++){
    modelMatrix.setTranslate(15, 5.1, -7+12*i)
    modelMatrix.scale(1, 1.1, 1.2)
    drawWindowWall(gl, u_ModelMatrix, u_NormalMatrix, n)
  }
  //draw windowblinds
  for (j = 0; j < 3; j++){
    modelMatrix.setTranslate(15, 5.4, -4+12*j)
    modelMatrix.scale(1, 0.68, 1.2)
    modelMatrix.rotate(blindAngle, 0, 1, 0)
    drawBlinds(gl, u_ModelMatrix, u_NormalMatrix, n)
  }

  //drawing right wall with hole for door
  modelMatrix.setTranslate(-15, 4.6, 23.8)
  modelMatrix.scale(1, 1, 0.15)
  modelMatrix.rotate(90, 0, 1, 0)
  drawSimpleWall(gl, u_ModelMatrix, u_NormalMatrix, n)
  modelMatrix.setTranslate(-15, 4.6, -0.3)
  modelMatrix.scale(1, 1, 1.06)
  modelMatrix.rotate(90, 0, 1, 0)
  drawSimpleWall(gl, u_ModelMatrix, u_NormalMatrix, n)
  modelMatrix.setTranslate(-15, 9.4, 18.6)
  modelMatrix.scale(1, 0.2, 0.21)
  modelMatrix.rotate(90, 0, 1, 0)
  drawSimpleWall(gl, u_ModelMatrix, u_NormalMatrix, n)

  //drawing door
  modelMatrix.setTranslate(-15, 4.2, 21.55)
  modelMatrix.scale(1, 0.8, 1.20)
  modelMatrix.rotate(doorAngle, 0, 1, 0)
  drawDoor(gl, u_ModelMatrix, u_NormalMatrix, n)

  //draw front left light
  modelMatrix.setTranslate(6, 10.4, 16)
  modelMatrix.scale(2, 1, 2)
  drawLight(gl, u_ModelMatrix, u_NormalMatrix, n)
  //draw front right light
  modelMatrix.setTranslate(-6, 10.4, 16)
  modelMatrix.scale(2, 1, 2)
  drawLight(gl, u_ModelMatrix, u_NormalMatrix, n)
  //draw back left light
  modelMatrix.setTranslate(6, 10.4, -6)
  modelMatrix.scale(2, 1, 2)
  drawLight(gl, u_ModelMatrix, u_NormalMatrix, n)
  //draw back right light
  modelMatrix.setTranslate(-6, 10.4, -6)
  modelMatrix.scale(2, 1, 2)
  drawLight(gl, u_ModelMatrix, u_NormalMatrix, n)
}

function drawNumbers(gl, u_ModelMatrix, u_NormalMatrix, n, drawingScale){
  //model 1s
  for (i = 0; i < 2; i++) {
    pushMatrix(modelMatrix);
      modelMatrix.translate(-1+i*1, 0, 0);
      modelMatrix.scale(0.01, 1*drawingScale, 0.01); // Scale
      drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();
  }
  //model +
  pushMatrix(modelMatrix);
    modelMatrix.translate(-0.5, 0, 0)
    modelMatrix.scale(0.01, 0.5*drawingScale, 0.01); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    modelMatrix.translate(-0.5, 0, 0)
    modelMatrix.rotate(90, 0, 0, 1)
    modelMatrix.scale(0.01, 0.5*drawingScale, 0.01); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model =
  for (i = 0; i < 2; i++) {
    pushMatrix(modelMatrix);
      modelMatrix.translate(0.5, 0.1-i*0.2, 0)
      modelMatrix.rotate(90, 0, 0, 1)
      modelMatrix.scale(0.01, 0.5*drawingScale, 0.01); // Scale
      drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();
  }
  //model 4
  pushMatrix(modelMatrix);
    modelMatrix.translate(1.5, 0, 0)
    modelMatrix.scale(0.01, 1*drawingScale, 0.01); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    modelMatrix.translate(1, 0.2, 0)
    modelMatrix.scale(0.01, 0.6*drawingScale, 0.01); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    modelMatrix.translate(1.4, -0.1, 0)
    modelMatrix.rotate(90, 0, 0, 1)
    modelMatrix.scale(0.01, 0.8*drawingScale, 0.01); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}
function drawLight(gl, u_ModelMatrix, u_NormalMatrix, n){
  var n = initVertexBuffers(gl, 0.90, 0.90, 0.90); //off white
  // Model the base
  pushMatrix(modelMatrix);
    modelMatrix.scale(2, 0.1, 2); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // Model middle tube
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, -0.2, 0)
    modelMatrix.scale(2, 0.2, 0.2); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  // Model top tube
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, -0.2, 0.7)
    modelMatrix.scale(2, 0.2, 0.2); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  // Model bottom tube
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, -0.2, -0.7)
    modelMatrix.scale(2, 0.2, 0.2); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  var n = initVertexBuffers(gl, 0.40, 0.40, 0.40); //gray
  //model front border
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, -0.1, 1.05)
    modelMatrix.scale(2, 0.4, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model back border
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, -0.1, -1.05)
    modelMatrix.scale(2, 0.4, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model right border
  pushMatrix(modelMatrix);
    modelMatrix.translate(1.05, -0.1, 0)
    modelMatrix.scale(0.1, 0.4, 2.2); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model left border
  pushMatrix(modelMatrix);
    modelMatrix.translate(-1.05, -0.1, 0)
    modelMatrix.scale(0.1, 0.4, 2.2); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}
function drawBlinds(gl, u_ModelMatrix, u_NormalMatrix, n){
  var n = initVertexBuffers(gl, 0.80, 0.51, 0.38)
  for (i = 0; i < 16; i++) {
    pushMatrix(modelMatrix);
      modelMatrix.translate(-2.5, 4-0.5*i, 0);
      modelMatrix.rotate(-20, 1, 0, 0);
      modelMatrix.scale(5, 0.5, 0.05); // Scale
      drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();
  }
}
function drawDoor(gl, u_ModelMatrix, u_NormalMatrix, n) {
  var n = initVertexBuffers(gl, 178/255, 119/255, 61/255); // birch brownish
  // Model the top section
  pushMatrix(modelMatrix);
    modelMatrix.translate(2.5, 4, 0)
    modelMatrix.scale(5, 2, 0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model the bottom section
  pushMatrix(modelMatrix);
    modelMatrix.translate(2.5, -4, 0)
    modelMatrix.scale(5, 6, 0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model right section
  pushMatrix(modelMatrix);
    modelMatrix.translate(1.5, 1, 0)
    modelMatrix.scale(3, 4, 0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model right section
  pushMatrix(modelMatrix);
    modelMatrix.translate(4.5, 1, 0)
    modelMatrix.scale(1, 4, 0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  var n = initVertexBuffers(gl, 0.77, 0.77, 0.77); //light gray (metal)
  //model door handle axel
  pushMatrix(modelMatrix);
    modelMatrix.translate(4.5, -1.2, 0.3)
    modelMatrix.scale(0.1, 0.1, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model door handle
  pushMatrix(modelMatrix);
    modelMatrix.translate(4.2, -1.2, 0.5)
    modelMatrix.scale(0.9, 0.2, 0.2); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}
function drawCeiling(gl, u_ModelMatrix, u_NormalMatrix, n){
  var n = initVertexBuffers(gl, 0.90, 0.90, 0.90); // off white
  // Model the ceiling
  pushMatrix(modelMatrix);
    modelMatrix.scale(30, 0.1, 42.575); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}
function drawFloor(gl, u_ModelMatrix, u_NormalMatrix, n){
  var n = initVertexBuffers(gl, 0.45, 0.51, 0.41); // dark green
  // Model the floor
  pushMatrix(modelMatrix);
    modelMatrix.scale(30, 0.1, 42.575); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}
function drawSimpleWall(gl, u_ModelMatrix, u_NormalMatrix, n){
  var n = initVertexBuffers(gl, 0.89, 0.87, 0.71); // off white
  // Model the wall
  pushMatrix(modelMatrix);
    modelMatrix.scale(30, 12, 0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

}
function drawWindowWall(gl, u_ModelMatrix, u_NormalMatrix, n){
  var n = initVertexBuffers(gl, 0.89, 0.87, 0.71); // off white
  // Model the top section
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 4, 0)
    modelMatrix.scale(0.05, 2, 5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model the bottom section
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, -4, 0)
    modelMatrix.scale(0.05, 4, 5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  var n = initVertexBuffers(gl, 0.80, 0.51, 0.38); // light brown
  //model top window frame
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 2.95, 0)
    modelMatrix.scale(0.05, 0.1, 5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model bottom window frame
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, -1.95, 0)
    modelMatrix.scale(0.05, 0.1, 5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model right window frame
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0.5, -2.45)
    modelMatrix.scale(0.05, 4.8, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model left window frame
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0.5, 2.45)
    modelMatrix.scale(0.05, 4.8, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model middle window frame
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0.5, 0)
    modelMatrix.scale(0.05, 4.8, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}
function drawWhiteboard(gl, u_ModelMatrix, u_NormalMatrix, n){
  var n = initVertexBuffers(gl, 0.90, 0.90, 0.90); // off white
  // Model the whiteboard
  pushMatrix(modelMatrix);
    modelMatrix.scale(12, 5, 0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  var n = initVertexBuffers(gl, 0.80, 0.51, 0.38); // light brown
  //model top border
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 2.55, 0)
    modelMatrix.scale(12.2, 0.1, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model bottom border
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, -2.55, 0)
    modelMatrix.scale(12.2, 0.1, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model left border
  pushMatrix(modelMatrix);
    modelMatrix.translate(-6, 0, 0)
    modelMatrix.scale(0.1, 5, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model right border
  pushMatrix(modelMatrix);
    modelMatrix.translate(6, 0, 0)
    modelMatrix.scale(0.1, 5, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}
function drawCattedra(gl, u_ModelMatrix, u_NormalMatrix, n){
  var n = initVertexBuffers(gl, 0.80, 0.51, 0.38); // light brown
  // Model the top
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0.5, 0)
    modelMatrix.scale(6.0, 0.1, 3); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // Model back
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, -0.2, -0.95)
    modelMatrix.scale(6, 1.4, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  var n = initVertexBuffers(gl, 0.36, 0.25, 0.20); //set color to dark brown
  // Model tray bottom
  pushMatrix(modelMatrix);
    modelMatrix.translate(2, -0.025, 0)
    modelMatrix.scale(1.55, 0.05, 1.8); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  // Model drawrer right side
  pushMatrix(modelMatrix);
    modelMatrix.translate(2.8, 0.2, 0)
    modelMatrix.scale(0.05, 0.5, 1.8); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  // Model drawer left side
  pushMatrix(modelMatrix);
    modelMatrix.translate(1.2, 0.2, 0)
    modelMatrix.scale(0.05, 0.5, 1.8); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  var n = initVertexBuffers(gl, 0.2, 0.2, 0.2); //set color to dark gray
  //model right front leg
  pushMatrix(modelMatrix);
    modelMatrix.translate(2.9, -0.6, 1.4)
    modelMatrix.scale(0.1, 2.2, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model left front leg
  pushMatrix(modelMatrix);
    modelMatrix.translate(-2.9, -0.6, 1.4)
    modelMatrix.scale(0.1, 2.2, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model right back leg
  pushMatrix(modelMatrix);
    modelMatrix.translate(2.9, -0.6, -0.85)
    modelMatrix.scale(0.1, 2.2, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model left back leg
  pushMatrix(modelMatrix);
    modelMatrix.translate(-2.9, -0.6, -0.85)
    modelMatrix.scale(0.1, 2.2, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}
function drawChair(gl, u_ModelMatrix, u_NormalMatrix, n){
  var n = initVertexBuffers(gl, 0.38, 0.20, 0.07);

  // Model the chair seat
  pushMatrix(modelMatrix);
    modelMatrix.scale(1.8, 0.1, 1.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // Model the chair back
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 1.5, -0.55);  // Translation
    modelMatrix.scale(1.8, 1, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  var n = initVertexBuffers(gl, 0.2, 0.2, 0.2); //changing colour to dark gray
  //right back support
  pushMatrix(modelMatrix);
    modelMatrix.translate(0.50, 0.8, -0.65);  // Translation
    modelMatrix.scale(0.1, 1.6, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //left back support
  pushMatrix(modelMatrix);
    modelMatrix.translate(-0.50, 0.8, -0.65);  // Translation
    modelMatrix.scale(0.1, 1.6, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //front right leg
  pushMatrix(modelMatrix);
    modelMatrix.translate(0.70, -0.7, 0.65);  // Translation
    modelMatrix.scale(0.1, 1.4, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //front left leg
  pushMatrix(modelMatrix);
    modelMatrix.translate(-0.70, -0.7, 0.65);  // Translation
    modelMatrix.scale(0.1, 1.4, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //back right leg
  pushMatrix(modelMatrix);
    modelMatrix.translate(0.70, -0.7, -0.65);  // Translation
    modelMatrix.scale(0.1, 1.4, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //back left leg
  pushMatrix(modelMatrix);
    modelMatrix.translate(-0.70, -0.7, -0.65);  // Translation
    modelMatrix.scale(0.1, 1.4, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}
function drawDesk(gl, u_ModelMatrix, u_NormalMatrix, n){
  var n = initVertexBuffers(gl, 0.80, 0.51, 0.38); // light brown
  // Model the desk top
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0.5, 0)
    modelMatrix.scale(3.0, 0.1, 2); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  var n = initVertexBuffers(gl, 0.36, 0.25, 0.20); //set color to dark brown
  // Model tray bottom
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0.1, 0.1)
    modelMatrix.scale(2.5, 0.1, 1.8); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  // Model tray back
  pushMatrix(modelMatrix);
    modelMatrix.translate(0, 0.3, 0.95)
    modelMatrix.scale(2.5, 0.3, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  // Model tray right side
  pushMatrix(modelMatrix);
    modelMatrix.translate(1.2, 0.3, 0.1)
    modelMatrix.scale(0.1, 0.3, 1.8); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  // Model tray right side
  pushMatrix(modelMatrix);
    modelMatrix.translate(-1.2, 0.3, 0.1)
    modelMatrix.scale(0.1, 0.3, 1.8); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  var n = initVertexBuffers(gl, 0.2, 0.2, 0.2); //set color to dark gray
  //model right front leg
  pushMatrix(modelMatrix);
    modelMatrix.translate(1.4, -0.6, 0.9)
    modelMatrix.scale(0.1, 2.2, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model left front leg
  pushMatrix(modelMatrix);
    modelMatrix.translate(-1.4, -0.6, 0.9)
    modelMatrix.scale(0.1, 2.2, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model right back leg
  pushMatrix(modelMatrix);
    modelMatrix.translate(1.4, -0.6, -0.9)
    modelMatrix.scale(0.1, 2.2, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //model left back leg
  pushMatrix(modelMatrix);
    modelMatrix.translate(-1.4, -0.6, -0.9)
    modelMatrix.scale(0.1, 2.2, 0.1); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}
function drawbox(gl, u_ModelMatrix, u_NormalMatrix, n) {
  pushMatrix(modelMatrix);

    // Pass the model matrix to the uniform variable
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Calculate the normal transformation matrix and pass it to u_NormalMatrix
    g_normalMatrix.setInverseOf(modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

    // Draw the cube
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  modelMatrix = popMatrix();
}
