// imports the worker library so the worker can use the computeRow function
importScripts('workerlib.js');
// all the worker does is set up the onmessage handler. All the worker does is wait for messages from mandel.js to start work
onmessage = function(task) {
    // takes the task data from the mandel.js message and feeds it to the computeRow function
    var workerResult = computeRow(task.data);
    // the result of computeRow is posted back to the main JS file, mandellib.js
    postMessage(workerResult);
}
