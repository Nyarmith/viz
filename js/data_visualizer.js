var requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
                       window.mozRequestAnimationFrame || window.msRequestAnimationFrame || 
                       function(c) {window.setTimeout(c, 15)};
/**
   Phoria
   pho·ri·a (fôr-)
   n. The relative directions of the eyes during binocular fixation on a given object
*/

theta=180;   //bounded by 0,360

function moveAroundWorld(direction, increment)
{
    if (direction<0)//left
    {
        theta+=increment;
    }

    if (direction>0)
    {
        theta-=increment;
    }
}
function randomNormal()
{
    var U1 = Math.random()
    var U2 = Math.random()
    var myNormal = Math.sqrt(-1*Math.log(U1))*Math.cos(2*Math.PI*U2);
    return myNormal;
}
// bind to window onload event
window.addEventListener('load', onloadHandler, false);

function onloadHandler()
{
   var n = 1000;
   //generate random dataset
   normalArray = new Array(n);
   for (var i=0; i<n; i++) {
       normalArray[i] = randomNormal();
   }

    function compareNumbers(a, b){return a - b;};
   normalArray.sort(compareNumbers);

   bins = new Array(9);
   for (var i=0;i<9;i++){bins[i]=0};
   var iterator=0;
   var bin=0;
   while(normalArray[iterator] < -3.5){
       bins[bin]++;
       iterator++;
   }
   bin++;

   for (var i=-2.5; i<=3.5; i++){
       while(normalArray[iterator] <i) {
           bins[bin]++;
           iterator++;
       }
       bin++;
   }
   bins[8] = normalArray.length-iterator;

   //normalize bins and set as height values
   var sum=0;
   for (var i=0;i< 9;i++){
       sum+=bins[i];
   }

   for (var i=0;i<9;i++){
       bins[i]/=sum;
   }

   var multiplierY=2;
   var cube = Phoria.Util.generateSphere(.2,9,9);
   cubes = new Array(9);
   var iterator=0;
   for (var i=-4; i<=4; i++){
       cubes[iterator] =  Phoria.Entity.create({points: cube.points, edges: cube.edges, polygons: cube.polygons});
       cubes[iterator].translateX(i);
       cubes[iterator].translateY(bins[iterator]*multiplierY);
       iterator++;
   }

   // get the canvas DOM element and the 2D drawing context
   var canvas = document.getElementById('canvas');

   // create the scene and setup camera, perspective and viewport
   var scene = new Phoria.Scene();
   scene.camera.position = {x:0, y:25.0, z:-60.0};
   scene.camera.lookat = {x:0.0, y:15.0, z:0.0};
   scene.perspective.aspect = canvas.width / canvas.height;
   scene.viewport.width = canvas.width;
   scene.viewport.height = canvas.height;

   // create a canvas renderer
   var renderer = new Phoria.CanvasRenderer(canvas);

   // add a grid to help visualise camera position etc.
   var plane = Phoria.Util.generateTesselatedPlane(16,16,0,40);   //the last two might be orientation?
   scene.graph.push(Phoria.Entity.create({
      points: plane.points,
      edges: plane.edges,
      polygons: plane.polygons,
      style: {
         drawmode: "wireframe",
         shademode: "plain",
         linewidth: 0.5,
         objectsortmode: "back"
      }
   }));
   for (var i=0; i<9; i++)
   {
        scene.graph.push(cubes[i]);
   }
   scene.graph.push(new Phoria.DistantLight());

   scene.onCamera(function(position, lookAt, up) {
      var rotMatrix = mat4.create();
      mat4.rotateY(rotMatrix, rotMatrix, theta);
      vec4.transformMat4(position, position, rotMatrix);
   });

   var pause = false;
   var fnAnimate = function() {
      if (!pause)
      {
         //// rotate local matrix of the cube
         //cube.rotateY(0.5*Phoria.RADIANS);
         
         // execute the model view 3D pipeline and render the scene
         scene.modelView();
         renderer.render(scene);
      }
      requestAnimFrame(fnAnimate);
   };

   // key binding
   document.addEventListener('keydown', function(e) {
      switch (e.keyCode){
         case 27: // ESC
            pause = !pause;
            break;
         case 37:
            moveAroundWorld(1,.1);
            break;
         case 39:
            moveAroundWorld(-1,.1);
            break;
      }
   }, false);

   // add GUI controls
   var gui = new dat.GUI();
   var f = gui.addFolder('Perspective');
   f.add(scene.perspective, "fov").min(5).max(175);
   f.add(scene.perspective, "near").min(1).max(100);
   f.add(scene.perspective, "far").min(1).max(1000);
   //f.open();
   f = gui.addFolder('Camera LookAt');
   f.add(scene.camera.lookat, "x").min(-100).max(100);
   f.add(scene.camera.lookat, "y").min(-100).max(100);
   f.add(scene.camera.lookat, "z").min(-100).max(100);
   f.open();
   f = gui.addFolder('Camera Position');
   f.add(scene.camera.position, "x").min(-100).max(100);
   f.add(scene.camera.position, "y").min(-100).max(100);
   f.add(scene.camera.position, "z").min(-100).max(100);
   f.open();
   f = gui.addFolder('Camera Up');
   f.add(scene.camera.up, "x").min(-10).max(10).step(0.1);
   f.add(scene.camera.up, "y").min(-10).max(10).step(0.1);
   f.add(scene.camera.up, "z").min(-10).max(10).step(0.1);
   //f = gui.addFolder('Rendering');
//   f.add(cube.style, "drawmode", ["point", "wireframe", "solid"]);
//   f.add(cube.style, "shademode", ["plain", "lightsource"]);
//   f.add(cube.style, "fillmode", ["fill", "filltwice", "inflate", "fillstroke", "hiddenline"]);
   //f.open();

   // start animation
   requestAnimFrame(fnAnimate);
}

