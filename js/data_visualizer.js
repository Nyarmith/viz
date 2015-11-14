//**NOTE** Once a basic version of each component is working, we 'ought to split 'em into files

//defining the objects that make up the visualizer
/**
 * algo_handler root namespace.
 *
 * @nameSpace algo_handler
 */
if (typeof algo_handler == "undefined" || !algo_handler) {
    var algo_handler = {};
}
algo_handler;//object that receives a bunch of javascript functions

/**
 * data_handler root namespace.
 *
 * @nameSpace data_handler
 */
if (typeof data_handler == "undefined" || !data_handler) {
    var data_handler = {};
}
data_handler;//object that receives generic data, with format specified, and parses

/**
 * visualizer root namespace.
 *
 * @nameSpace visualizer
 */

if (typeof visualizer == "undefined" || !visualizer) {
    var visualizer = {};
    visualizer.algo_handler = algo_handler; //implements visTools interface
    visualizer.data_handler = data_handler;
}

function doAllPlease(inDat,axes)
{
    //Getting the browser-appropriate function
    var requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame || window.msRequestAnimationFrame || 
    function(c) {window.setTimeout(c, 15)};

    visualizer.algo_handler.setAnimHandler(requestAnimFrame);    //passes handler to algo_handler for its implementation
    visualizer.data_handler.setData(inDat, axes);   //function accepts data and keys

    visualizer.start();     //starts graphic rendering and all taht

}
