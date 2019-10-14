// creates the workers needed to compute the Mandelbrot set
var numberOfWorkers = 8;
var workers = [];

// keeps track of which row is being worked on
var nextRow = 0;
// tracks how many times the image has been zoomed
var generation = 0;

window.onload = init;

function init() {
    // from mandellib.js
    setupGraphics();
    // event listener for a window resize. Just fits the canvas to the new window dimensions and redraws the Mandelbrot set for the new window size
    window.onresize = function() {
        resizeToWindow();
    };
    // this is the event listener for a mouse click, it initiates the zoom we want via handleClick
    canvas.onclick = function(event) {
        handleClick(event.clientX, event.clientY);
    };
    // this loop creates the workers and pushes them to the array
    for (var i = 0; i < numberOfWorkers; i++) {
        var worker = new Worker('worker.js');
        // sets each worker's message handler to call the processWork function
        worker.onmessage = function(event) {
            // processWork function is found below. event.target is the worker that just finished its process, event.data is the results from the worker
            processWork(event.target, event.data);
        }
        // adds an idle property to each worker to help track which workers are busy and which are done
        worker.idle = true;

        workers.push(worker);
    }
    // starts the workers once they have been created and added to the array
    startWorkers();
}

// starts the workers and restarts them if the user zooms in 
function startWorkers() {
    generation++;
    // reinitializes the nextRow variable every time a zoom happens
    nextRow = 0;

    for (var i = 0; i < workers.length; i++) {
        var worker = workers[i];
        // here is where the idle property comes in
        if (worker.idle) {
            // createTask is in mandellib.js
            var task = createTask(nextRow);
            // set the worker to busy
            worker.idle = false;
            // sets the worker to listen for the message from mandellib.js. The message will contain the task info object from createTask
            worker.postMessage(task);
            // increment the row counter so the next idle worker goes the following row
            nextRow++;
        }
    }
}
// worker is the event.target and workerResults is the event.data, both from the init function above
function processWork(worker, workerResults) {
    // // the worker's results are handed to the drawRow function in the main JS file, mandellib.js
    // drawRow(workerResults);
    // // since the worker is now free, it is reassigned using a function, reassignWorker, found below
    // reassignWorker(worker);

    // this if statement needs to be added to ensure the workers are working on the correct rows. If the user clicks before all the rows from the previous generation have been completed, workers have no idea and will return their data from the previous generation first.
    if (workerResults.generation == generation) {
        drawRow(workerResults);
    }
    // reassigns the worker if the worker returns a generation value that does not equal the current generation (i.e. a user clicked before the worker returned it's result).
    reassignWorker(worker);
}
// worker comes from the processWork function, which received the worker from event.target in the init function
function reassignWorker(worker) {
    // the worker needs the next row to work on so it is fed the nextRow variable, then increments nextRow so it works on a new, unassigned row
    var row = nextRow++;
    // if row turns out to be more than the canvas height, all rows are drawn and the worker can be set to idle. Remember that canvas is the global variable from the main JS file, mandellib.js. It is present here because we called setupGraphics.
    if (row >= canvas.height) {
        worker.idle = true;
    // else get to work slacker worker! 
    } else {
        var task = createTask(row);
        worker.idle = false;
        worker.postMessage(task);
    }
}

// handleClick receives the x/y coordinates for the click event
function handleClick(x, y) {
    // this just resized the area being computed, centered on the x/y coords of the click event
    var width = r_max - r_min;
    var height = i_min - i_max;
    var click_r = r_min + width * x / canvas.width;
    var click_i = i_max + height * y / canvas.height;
    // determines how far in each click will zoom
    var zoom = 8;
    // now the global variables are set to create tasks for the workers to draw a new image
    r_min = click_r - width/zoom;
    r_max = click_r + width/zoom;
    i_max = click_i - height/zoom;
    i_min = click_i + height/zoom;
    // now the workers are set to work again
    startWorkers();
}

function resizeToWindow() {
    // sets canvas to match the new window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // also updates the values the worker will use for computation
    var width = ((i_max - i_min) * canvas.width / canvas.height);
    var r_mid = (r_max + r_min) / 2;
    r_min = r_mid - width/2;
    r_max = r_mid + width/2;
    // rowData is a global variable from the canvas builtin ImagaData object. When the canvas is resized, we need to recreate the rowData object so it has the new canvas width
    rowData = ctx.createImageData(canvas.width, 1);

    startWorkers();
}
