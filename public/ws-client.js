// Create WebSocket connection.
const socket = new WebSocket('ws://localhost:3000', 'echo-protocol');

// Connection opened
socket.addEventListener('open', function (event) {
    socket.send('client websocket succeed!');
});

// Listen for messages
socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
    try {
        board.receiveMsg(JSON.parse(event.data))
    } catch(e) {
        console.log("error: " , e)
    }
    // board.endDraw()
});