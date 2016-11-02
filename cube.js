var canvas;
var gl;

var numVertices  = 36;

var axisArray = [[1,0,0],
                  [0,1,0],
                  [0,0,1]];


var rotateFlag = false;
var axis = 0;
var xaxis = 0;
var yaxis =1;

var zaxis = 2;
// var thetaRot = [ 0, 0, 0 ];
var theta = 0.0;
var thetaLoc;
var objFlagLoc;
var objFlag;
var matrixViewloc,matrixView;
var rotateMatrixLoc,rotateMatrix;
var rotateGlobalMatrixLoc,rotateGlobalMatrix;
var rotateGlobalBackMatrix;
var projectionMatrixLoc,projectionMatrix;
var translateMatrixLoc, translateMatrix;
var faceLoc;


var eye = vec3(2.5,2.0,2.0);
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var  fovy = 80;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var near = 1;
var far = 90;
var radius = 6.0;
var theta  = 0.0;
var thetaGlobal  = 0.0;
var rotateGlobalIncrement = 0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

projectionMatrix = perspective(fovy, 1, near, far );
rotateGlobalMatrix = rotate(thetaGlobal, axisArray[1]);

var verticesObj = [
   [  0.0,  0.0,  1.0 ],
   [  0.0,  1.0,  1.0 ],
   [  1.0,  1.0,  1.0 ],
   [  1.0,  0.0,  1.0 ],
   [  0.0,  0.0,  0.0 ],
   [  0.0,  1.0,  0.0 ],
   [  1.0,  1.0,  0.0 ],
   [  1.0,  0.0,  0.0 ],
   //axiss object
   [  0.5,  0.5,  0.5 ],
   [  1.5,  0.5,  0.5 ],
   [  0.5,  1.5,  0.5 ],
   [  0.5,  0.5,  1.5],
];

var verticesWorld = [
   //axiss world
   [  0.0,  0.0,  0.0 ],
   [  1.5,  0.0,  0.0 ],
   [  0.0,  1.5,  0.0 ],
   [  0.0,  0.0,  1.5],
   //lines for persp
   [ -90.0,  -0.5,  2.0 ],
   [  90.0,  -0.5,  2.0 ],
   [ -90.0,  -0.5, -2.0 ],
   [  90.0,  -0.5, -2.0 ],
   ];


   // indices of the 12 triangles that compise the cube

var indices = [
   //cube indices
   1, 0, 3,
   3, 2, 1,
   2, 3, 7,
   7, 6, 2,
   3, 0, 4,
   4, 7, 3,
   6, 5, 1,
   1, 2, 6,
   4, 5, 6,
   6, 7, 4,
   5, 4, 0,
   0, 1, 5,
   //axis object
   8, 9,
   8, 10,
   8, 11,
   //lines on cube faces
   //axis world
   12, 13,
   12, 14,
   12, 15,
   //lines for persp
   16,17,
   18,19
   ];

window.onload = function init()
{
   canvas = document.getElementById( "gl-canvas" );
   aspect =  canvas.width/canvas.height;
   gl = WebGLUtils.setupWebGL( canvas );
   if ( !gl ) { alert( "WebGL isn't available" ); }

   gl.viewport( 0, 0, canvas.width, canvas.height );
   gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

   gl.enable(gl.DEPTH_TEST);;

   //
   //  Load shaders and initialize attribute buffers
   //
   var program = initShaders( gl, "vertex-shader", "fragment-shader" );
   gl.useProgram( program );

   // array element buffer

   var iBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);


   // vertex array attribute buffer

   vertices = verticesObj.concat(verticesWorld);
   var vBuffer = gl.createBuffer();
   gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
   gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

   var vPosition = gl.getAttribLocation( program, "vPosition" );
   gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
   gl.enableVertexAttribArray( vPosition );

   thetaLoc = gl.getUniformLocation(program, "theta"); 
   faceLoc = gl.getUniformLocation(program, "face");
   objFlagLoc = gl.getUniformLocation(program, "objFlag");

   
   modelViewMatrixLoc = gl.getUniformLocation( program, "matrixView");
   gl.uniformMatrix4fv(modelViewMatrixLoc,false, flatten(lookAt(eye,
               at,
               up)));

   projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

   translateMatrixLoc = gl.getUniformLocation( program, "translateMatrix");
   translateMatrix = translate(verticesObj[8][0], verticesObj[8][1], verticesObj[8][2]);
   console.log(verticesObj[8]);

   rotateMatrixLoc = gl.getUniformLocation( program, "rotateMatrix");
   rotateGlobalMatrixLoc = gl.getUniformLocation( program, "rotateGlobalMatrix");
   if(!rotateFlag){
      rotateMatrix = mat4();
   }

   

   //event listeners for buttons
   document.getElementById( "xButton" ).onclick = function () {
        if(!rotateFlag){
           rotateFlag = true;
           axis = 0;;
        } else {
           window.cancelAnimationFrame(AnimFrame);
           axis = 0;
           updateAxisVert();
           updateObjVert();
           theta = 0;
           init();
        }
    };
    document.getElementById( "yButton" ).onclick = function () {
        if(!rotateFlag){
           rotateFlag = true;
           axis = 1;
        } else {
           window.cancelAnimationFrame(AnimFrame);
           axis = 1;
           updateAxisVert();
           updateObjVert();
           theta = 0;
           init();
        }
    };
    document.getElementById( "zButton" ).onclick = function () {
        if(!rotateFlag){
           rotateFlag = true;
           axis = 2;
        } else {
           window.cancelAnimationFrame(AnimFrame);
           axis = 2;
           updateAxisVert();
           updateObjVert();
           theta = 0;
           init();
        }
    };

    document.getElementById( "yGlobal" ).onclick = function () {
       if(rotateGlobalIncrement == 0){
           window.cancelAnimationFrame(AnimFrame);
           rotateGlobalIncrement = 1.5;
           init();
       }
       else if(rotateGlobalIncrement != 0){
           window.cancelAnimationFrame(AnimFrame);
           rotateGlobalIncrement = 0;
           init();
       }
    };

    document.getElementById( "orthogonal" ).onclick = function () {
       window.cancelAnimationFrame(AnimFrame);
       projectionMatrix = ortho( left, right, bottom, ytop, near, far );
       init();
    };

    document.getElementById( "perspective" ).onclick = function () {
       window.cancelAnimationFrame(AnimFrame);
       projectionMatrix = perspective(fovy, 1, near, far );
       init();
    };

    render();
}

function render()
{
   gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


   // gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
   gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
   gl.uniformMatrix4fv( translateMatrixLoc, false, flatten(translateMatrix) );
   gl.uniformMatrix4fv( rotateMatrixLoc, false, flatten(rotateMatrix) );
   gl.uniformMatrix4fv( rotateGlobalMatrixLoc, false, flatten(rotateGlobalMatrix) );


   gl.uniform1i(objFlagLoc, 1);
   var i = 0;
   for(i = 0; i<6; i++) {
      gl.uniform1i(faceLoc, i);
      gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 6*i );
   }
   gl.uniform1i(faceLoc, i++);

   gl.drawElements( gl.LINES, 2, gl.UNSIGNED_BYTE, 36);
   gl.drawElements( gl.LINES, 2, gl.UNSIGNED_BYTE, 38);
   gl.drawElements( gl.LINES, 2, gl.UNSIGNED_BYTE, 40);

   gl.uniform1i(objFlagLoc, 0);
   gl.drawElements( gl.LINES, 2, gl.UNSIGNED_BYTE, 42);
   gl.drawElements( gl.LINES, 2, gl.UNSIGNED_BYTE, 44);
   gl.drawElements( gl.LINES, 2, gl.UNSIGNED_BYTE, 46);
   gl.drawElements( gl.LINES, 2, gl.UNSIGNED_BYTE, 48);
   gl.drawElements( gl.LINES, 2, gl.UNSIGNED_BYTE, 50);
   
   rotateGlobalMatrix = rotate(thetaGlobal,[0,1,0]);
   thetaGlobal += rotateGlobalIncrement;

   if(rotateFlag){
      rotateMatrix = rotate(theta, axisArray[axis]);
      theta += 2.0;
   }  
   AnimFrame = window.requestAnimFrame(render);
}

function multVec( u , v){
   result = [];
   for ( var i = 0; i < u.length; ++i ) {
      var sum = 0.0;
      for ( var k = 0; k < u.length; ++k ) {
         sum += u[i][k] * v[k];
      }
      result.push( sum );
   }
   return result;
}

function updateObjVert(){

   translateBackMatrix = translate(-1 * verticesObj[8][0], -1 * verticesObj[8][1], -1 * verticesObj[8][2]);
   for(var j = 0; j < verticesObj.length; ++j){
      verticesObj[j] = multVec(translateBackMatrix,verticesObj[j].concat(1));
      verticesObj[j] = multVec(rotateMatrix, verticesObj[j].concat(1));
      verticesObj[j] = multVec(translateMatrix, verticesObj[j].concat(1));
      verticesObj[j].pop();
   }
}

function updateAxisVert(){
   for(var j = 0; j < axisArray.length; ++j){
      axisArray[j] = multVec(rotateMatrix, axisArray[j].concat(1));
      axisArray[j].pop();
   }
}
