// the onmessage event is assigned an event handler, a function called pingPong
onmessage = pingPong;

// The gist is that if the message received contains the string 'ping', the worker will post a message back, the string 'pong'. Any other message will be ignored.
function pingPong(event) {
    if (event.data == 'ping') {
        postMessage('pong');
    }
}
