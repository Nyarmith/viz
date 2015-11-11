var requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
                       window.mozRequestAnimationFrame || window.msRequestAnimationFrame || 
                       function(c) {window.setTimeout(c, 15)};

theta=180;   //bounded by 0,360
active_list=[];     //list of active methods to check each loop
total_states=[0,1];   //should be related to number of loaded data sets
state=[];
state.state=0;
state.set_state=0;

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

function moveTo(entity, from, to, frames) //vec3, vec3, int, type
{
    //get all intermediate positions between from, to, including to
    var myArray = new Array(frames);

        var baseVec = vec3.create();
        var divisor = vec3.fromValues(frames,frames,frames);
        vec3.subtract(baseVec, to, from);
        vec3.divide(baseVec,baseVec,divisor);
        var iteratorVec = vec3.clone(baseVec);
        for (var i=0; i<frames; i++)
        {
            var frameVec = vec3.clone(from);
            vec3.add(iteratorVec, iteratorVec,baseVec);
            vec3.add(frameVec,frameVec,iteratorVec);
            myArray[i]=frameVec;
        }

        return (function(){
            this.frames=myArray;
            entity.identity();
            var curVec = this.frames.shift(-1);
            entity.translate(curVec);
            if (this.frames.length == 0)
            {
                return true;
            }
            else 
            {
                return false;
            }
        });
};

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
   state[0] = new Array(9);
   state[1] = new Array(9);
   var iterator=0;
   for (var i=-4; i<=4; i++){
       cubes[iterator] =  Phoria.Entity.create({points: cube.points, edges: cube.edges, polygons: cube.polygons});
       cubes[iterator].translateX(i);
       cubes[iterator].translateY(bins[iterator]*multiplierY);
       state[0][iterator]=vec3.fromValues(i,bins[iterator]*multiplierY,0);
       state[1][iterator]=vec3.fromValues(i*2,0,0);
       iterator++;
   }

   // get the canvas DOM element and the 2D drawing context
   var canvas = document.getElementById('canvas');

   // create the scene and setup camera, perspective and viewport
   var scene = new Phoria.Scene();
   scene.camera.position = {x:0, y:25.0, z:-60.0};
   scene.camera.lookat = {x:0.0, y:5.0, z:0.0};
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
   // mouse rotation and position tracking
   var lastPicked = null;
   //var lastColor = null;
   var timer = null;
   var mouse = Phoria.View.addMouseEvents(canvas, function() {
       // pick object detection on mouse click
       var cpv = Phoria.View.calculateClickPointAndVector(scene, mouse.clickPositionX, mouse.clickPositionY);
       var intersects = Phoria.View.getIntersectedObjects(scene, cpv.clickPoint, cpv.clickVector);

       //document.getElementById("picked").innerHTML = "Selected: " + (intersects.length !== 0 ? intersects[0].entity.id : "[none]");

   if (lastPicked !== null)
   {
       lastPicked.style.color = lastPicked.oldcolor;
       lastPicked.style.emit = 0;
       Phoria.Entity.debug(lastPicked, {
                          showId: false,
                          showAxis: false,
                          showPosition: false
                       });
   }
   if (intersects.length !== 0)
   {
       var obj = intersects[0].entity;
       obj.oldcolor = obj.style.color;
       obj.style.color = [255,255,255];
       obj.style.emit = 0.5;
       lastPicked = obj;

       Phoria.Entity.debug(obj,{
                          showId: false,
                          showAxis: false,
                          showPosition: true
                       });
       //clearInterval(timer);
       //timer = setTimeout(function() {
       //    if (lastPicked !== null)
       //{
       //    lastPicked.style.color = lastPicked.oldcolor;
       //    lastPicked.style.emit = 0;
       //    lastPicked = null;
       //}
       //},300);
   }
   });

   scene.onCamera(function(position, lookAt, up) {
       var rotMatrix = mat4.create();
       mat4.rotateY(rotMatrix, rotMatrix, theta);
       vec4.transformMat4(position, position, rotMatrix);
   });

   function sceneLogic()
   {
       if (state.set_state != state.state)
       {
           for (var i=0;i<cubes.length;i++)
           {
               active_list.push(moveTo(cubes[i], state[state.set_state][i],state[state.state][i],40));
           }
           state.set_state = state.state;
       }
       if(active_list.length > 0)
       {
           for (var i=0; i < active_list.length; i++)
               if (active_list[i]()){
                   active_list.splice(i,1);
                   i--;
               }
       }
       //Relies on globals: active_list
   }

   var pause = false;
   var fnAnimate = function() {
      if (!pause)
      {
         //// rotate local matrix of the cube
         //cube.rotateY(0.5*Phoria.RADIANS);
         
         // execute the model view 3D pipeline and render the scene
         sceneLogic();

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
         case 37:   //RIGHT
            moveAroundWorld(1,.1);
            break;
         case 39:   //LEFT
            moveAroundWorld(-1,.1);
            break;
      }
   }, false);

   // add GUI controls
   var gui = new dat.GUI();
   //gui.add(state).options(0,1);
   var f = gui.addFolder('Controls');
   f.add(state, "state",total_states);
   //f.open();
   //f = gui.addFolder('Rendering');
//   f.add(cube.style, "drawmode", ["point", "wireframe", "solid"]);
//   f.add(cube.style, "shademode", ["plain", "lightsource"]);
//   f.add(cube.style, "fillmode", ["fill", "filltwice", "inflate", "fillstroke", "hiddenline"]);
   //f.open();

   // start animation
   requestAnimFrame(fnAnimate);
}
