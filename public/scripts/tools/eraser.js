class Eraser {
  constructor(board, wsClient) {
    this.board = board
    this.eraseWidth = 10
    this.eraseHeight = 10
    this.enableErase = false
    this.wsClient = wsClient
    this.eraserSizeInput = sel('input[name="eraser-size"]')
    this.elem = sel('#id-eraser')
    this.eraserSize =  10
    this.setupInputs()
  }
  setupInputs() {
    addListener(this.eraserSizeInput, 'change', event => {
      this.eraserSize = event.target.value
    })
  }
  beginErase() {
    this.enableErase = true
  }
  erase(x, y) {
    if(this.enableErase == false) {
      return
    }
    this.board.ctx.clearRect(x, y, this.eraserSize, this.eraserSize)
  }
  endErase() {
    this.enableErase = false
  }
  handleMousedown(event) {
    var x = event.layerX
    var y = event.layerY
    this.beginErase(x, y)
    if(!this.board.isConnected) {
      return
    }
    this.sendWsData('beginErase', x, y)
  }
  handleMousemove(event) {
    var x = event.layerX
    var y = event.layerY
    this.erase(x, y)
    if(!this.board.isConnected) {
      return
    }
    this.sendWsData('erase', x, y)
  }
  handleMouseup(event) {
    this.endErase()
    if(!this.board.isConnected) {
      return
    }
    this.sendWsData('endErase')
  }
  sendWsData(method, x, y) {
    var args = {
      x: x,
      y: y,
      height: this.eraseHeight,
      width: this.eraseWidth,
    }
    var tool = 'erase'
    this.wsClient.sendMsg({
      tool: tool,
      method: method,
      args: args,
    })
  }
  receiveWsData(data) {
    var method = data.method
    var {x, y, height, width} = data.args
    if(height) {
      this.eraseHeight = height
    }
    if(width) {
      this.eraseWidth = width
    }
    if(this[method]) {
      this[method](x, y)
    }
  }
}