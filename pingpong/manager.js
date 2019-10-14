// workers should be created once the page is fully loaded
window.onload = function() {
    var worker = new Worker('worker.js');
    // postMessage is a builtin worker object method
    worker.postMessage('ping');
    // between the parentheses is the message that will be sent to the worker. It can be a string, array, JSON object, etc. It CANNOT be a function or a variable.
    
    //onmessage is another builtin worker method. Here a function is called every time worker sends a message back.
    worker.onmessage = function(event) {
        // data is a property of the message event passed from the worker. It contains the message data worker posted
        var message = 'Worker says ' + event.data;
        document.getElementById('output').innerHTML = message;
    };
}
