class Pen {
  constructor(board, colorRadios, colorPicker, lineWidthInput, wsClient) {
    this.board = board
    this.ctx = this.board.ctx
    this.colorRadios = colorRadios
    this.colorPicker = colorPicker
    this.lineWidthInput = lineWidthInput
    this.strokeStyle = 'black'
    this.lineWidth = "1"
    this.enableDraw = false
    this.wsClient = wsClient
    this.drawData = {
      tool: 'pen',
      state: null,
      args: null,
    }
    this.x = null
    this.y = null
    this.setupInputs()
  }
  beginDraw(x, y) {
    this.enableDraw = true
    this.ctx.beginPath()
    this.ctx.moveTo(x, y)
  }
  drawLine(x, y) {
    if(!this.enableDraw) {
      return false
    }
    this.ctx.strokeStyle = this.strokeStyle
    this.ctx.lineWidth = this.lineWidth
    this.ctx.lineTo(x, y)
    this.ctx.stroke()
    return true
  }
  endDraw() {
    this.enableDraw = false
  }
  setStrokeStyle(value) {
    this.strokeStyle = value
  }
  setLineWidth(value) {
    this.lineWidth = value
  }
  setupInputs() {
    for(var i = 0; i < this.colorRadios.length; i++) {
      var radio = this.colorRadios[i]
      addListener(radio, 'click', event => {
        var value = event.target.value
        this.setStrokeStyle(value)
      })
    }
    addListener(this.colorPicker, 'change', event => {
      var value = event.target.value
      this.setStrokeStyle(value)
    })
  
    addListener(this.lineWidthInput, 'input', event => {
      var value = event.target.value
      this.setLineWidth(value)
      sel('#line-width').innerText = value
    })
  }
  handleMousedown(event) {
    var x = event.layerX,
        y = event.layerY
    this.beginDraw(x, y)
    if(!this.board.isConnected) {
      return
    }
    this.sendWsData('beginDraw', x, y)
  }
  handleMousemove(event) {
    var x = event.layerX,
        y = event.layerY
    if(this.drawLine(x, y) && this.board.isConnected) {
      this.sendWsData('drawLine', x, y)
    }
  }
  handleMouseup(event) {
    this.endDraw()
    if(!this.board.isConnected) {
      return
    }
    this.sendWsData('endDraw')
  }

  sendWsData(method, x, y) {
    var args = {
      x: x,
      y: y,
      color: this.strokeStyle,
      width: this.lineWidth,
    }
    var tool = 'pen'
    this.wsClient.sendMsg({
      tool: tool,
      method: method,
      args: args,
    })
  }
  receiveWsData(data) {
    log('ws data: ', data)
    var method = data.method
    var {x, y, color, width} = data.args
    if(color) {
      this.strokeStyle = color
    }
    if(width) {
      this.lineWidth = width
    }
    if(this[method]) {
      this[method](x, y)
    }
  }
}