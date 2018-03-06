// Create WebSocket connection.
class WSClient {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.clientId = null
    this.shareId = null
    this.callback = null
    // if (process.env.NODE_ENV === "production") {
    //   this.hostname = 'www.coldfor.com'
    // }
    this.hostname = 'localhost'
    this.SSLPORT = 3000
    this.initSocket()
  }
  initSocket() {
    this.clientId = window.location.pathname.slice(1)
    if(this.clientId.length > 0) {
      this.isConnected = true
      this.socket = new WebSocket('wss://' + this.hostname + ':' + this.SSLPORT + '/' + this.clientId, 'echo-protocol')
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
    AjaxGet('https://' +  this.hostname + ':' + this.SSLPORT + '/shareid?clientid=' + this.clientId, a)
  }
  setupShareURL() {
    sel('#id-copy-input').value = 'https://' +  this.hostname + ':' + this.SSLPORT + '/' + this.shareId
  }
  receiveMsg(event) {
    if(this.callback) {
      this.callback(event.data)
    }
  }
  sendMsg(msg) {
    if(!this.isConnected) {
      return
    }
    this.socket.send(msg)
  }
  sendObj(obj) {
    if(!this.isConnected) {
      return
    }
    this.socket.send(JSON.stringify(obj))
  }
  setupSocketListner() {
    // Connection opened
    var socket = this.socket
    var self = this
    socket.addEventListener('open', function (event) {
      var msg = {
        type: 'message',
        data:'client ' + self.clientId + ' websocket succeed!',
      }
      self.sendObj(msg)
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
    AjaxGet('https://' +  this.hostname + ':' + this.SSLPORT + '/invite', a)
  }
}

