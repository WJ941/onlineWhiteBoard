// Create WebSocket connection.
class WSClient {
    constructor(url) {
      this.url = url
      this.socket = new WebSocket('ws://localhost:3000/' + this.url, 'echo-protocol')
      this.receiveMsg = null
      this.init()
      this.setupInputs()
    }
    // resetSocket(url) {

    // }
    init() {
      this.receiveMsg = function(event) {
        console.log('Message from server ', event.data)
      }
    }
    
    sendMsg(msg) {
      var msg = JSON.stringify(msg)
      this.socket.send(msg)
    }
    setupInputs() {
      // Connection opened
      var socket = this.socket
      var self = this
      socket.addEventListener('open', function (event) {
        socket.send('client websocket succeed!')
      })

      // Listen for messages
      socket.addEventListener('message', function (event) {
        try {
          self.receiveMsg(event)
            // board.receiveMsg(JSON.parse(event.data))
        } catch(e) {
            console.log("error: " , e)
        }
      })
    }
    
}

