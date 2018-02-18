// Create WebSocket connection.
class WSClient {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.clientId = null
    this.shareId = null
    this.initSocket()
  }
  initSocket() {
    this.clientId = window.location.pathname.slice(1)
    if(this.clientId.length > 0) {
      this.isConnected = true
      this.socket = new WebSocket('ws://localhost:3000/' + this.clientId, 'echo-protocol')
      log('socket', this.socket)
      this.getShareId()
      this.setupShareURL()
      this.setupSocketListner()
      return
    }
    this.isConnected = false
  }
  getShareId() {
    var self = this
    var a = function(res) {
      self.shareId = res
      self.setupShareURL()
    }
    AjaxGet('http://localhost:3000/shareid?clientid=' +this.clientId, a)
  }
  setupShareURL() {
    sel('#id-copy-input').value = 'http://localhost:3000/' + this.shareId
  }
  receiveMsg(event) {
    if(!IsJsonString(event.data)) {
      log(event.data)
      return
    }
    log(event.data)
    // var data = JSON.parse(event.data)
    // var tool = data.tool
    // switch(tool) {
    //   case 'pen':
    //     pen.receiveWsData(data)
    //     break
    //   case 'erase':
    //     eraser.receiveWsData(data)
    //     break
    //   default:
    //     log('no tool')
    // }
  }
  sendMsg(msg) {
    log('send msg ', msg)
    log('this.isConnected: ', this.isConnected)
    log('this.socket: ', this.socket)
    if(!this.isConnected) {
      return
    }
    // var msg = JSON.stringify(msg)
    this.socket.send(msg)
  }
  setupSocketListner() {
    // Connection opened
    var socket = this.socket
    var self = this
    socket.addEventListener('open', function (event) {
      socket.send('client' + self.clientId + ' websocket succeed!')
    })
    // Listen for messages
    socket.addEventListener('message', function (event) {
      try {
        self.receiveMsg(event)
          // board.receiveMsg(JSON.parse(event.data))
      } catch(e) {
          console.log(e)
      }
    })
    socket.addEventListener('close', function(event) {
      log('socket is closed', event)
    })
    socket.addEventListener('error', function(event) {
      log('socket error', event)
    })
  }
  makeInviteRequest() {
    log(this.isConnected, this.clientId, this.shareId)
    if(this.isConnected) {
      return
    }
    var self = this
    var a = function(res) {
      res = JSON.parse(res)
      self.clientId = res[0]
      self.shareId = res[1]
      window.history.pushState({}, 'index', self.clientId)
      self.initSocket()
      self.setupShareURL()
    }
    AjaxGet('http://localhost:3000/invite', a)
  }
}

