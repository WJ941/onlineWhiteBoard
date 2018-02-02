// board对象和其方法
class Board {
  constructor(canvas, textarea, clearBtn, colorRadios, colorPicker,lineWidthInput, fontSizeInput, isTextInput, socket) {
    //初始化后就保持不变的状态
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    this.widht = this.canvas.width
    this.height = this.canvas.height
    this.textarea = textarea
    this.clearBtn = clearBtn
    this.colorRadios = colorRadios
    this.colorPicker = colorPicker
    this.lineWidthInput = lineWidthInput
    this.fontSizeInput = fontSizeInput
    this.isTextInput = isTextInput
    this.textarea = textarea
    this.socket = socket
    
    //运行中常改变的状态
    this.curColor = null
    this.curLineWidth = null
    this.curFontSize = null
    this.curFontFamily = null
    this.curFont = null

    this.enableDraw = false
    this.isConnected = true
    this.isText = false
  }
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
  startDraw(data) {
    this.enableDraw = true
    this.ctx.beginPath()
    this.ctx.moveTo(data.x, data.y)
  }
  drawLine(data) {
    if(!this.enableDraw) {
      return false
    }
    var ctx = this.ctx
    var {x, y, strokeStyle, lineWidth} = data
    ctx.strokeStyle = strokeStyle
    ctx.lineWidth = lineWidth
    ctx.lineTo(x, y)
    ctx.stroke()
    return true
  }
  endDraw(data) {
    this.enableDraw = false
  }

  // board对象中处理websocket传递的消息
  receiveMsg(msg) {
    var type = msg.type
    var data = msg.data
    this[type](data)
  }
  sendMsg(type, data) {
    if(!this.isConnected) {
      return
    }
    var msg = {
      type: type,
      data: data,
    }
    this.socket.send(JSON.stringify(msg))
  }
  // 注册事件
  drawStartSend(event) {
    var data = {
      x: event.layerX,
      y: event.layerY,
    }
    this.startDraw(data)
    this.sendMsg('startDraw', data)
  }
  drawSend(event) {
    var data = {
      x: event.layerX,
      y: event.layerY,
      strokeStyle: this.curColor,
      lineWidth: this.curLineWidth
    }
    // 以后用替换场景的模式，这样写不合理
    if(this.isText) {
      return    
    }
    if(!this.drawLine(data)) {
      return
    }
    this.sendMsg('draw', data)
  }
  endDrawSend(event) {
    this.endDraw()
    this.sendMsg('endDraw')
  }
  clearBoard(event) {
    this.clear()
  }
  setCurColor(event) {
    var value = event.target.value
    if(value !== this.curColor) {
      this.curColor = value
      log('curColor: ', this.curColor)
    }
  }
  setCurLineWidth(event) {
    var value = event.target.value
    if(value !== this.curLineWidth) {
      this.curLineWidth = value
      log('Current Line Width: ', this.curLineWidth)
    }
  }
  setCurFontSize(event) {
    var value = event.target.value
    if(value !== this.curFontSize) {
      this.curFontSize = value
      log('Current font size: ', this.curFontSize)
    }
  }
  setIsText(event) {
    var isChecked = event.target.checked
    if(isChecked !== this.isText) {
      this.isText = isChecked
      this.canvas.style.cursor = isChecked ? "crosshair" : "default"
    }
  }
  changeTextarea(event) {
    if(!this.isText) {
      return
    }
    var x = event.clientX
    var y = event.clientY
    var textarea = this.textarea
    var width = this.canvas.offsetLeft + this.width - x
    var height = this.canvas.offsetTop + this.height - y
    textarea.style.position = "absolute"
    textarea.style.left = x + "px"
    textarea.style.top = y + "px"
    textarea.style.width = width + "px"
    textarea.style.height = height + "px"
    textarea.focus()
    textarea.canvasX = event.layerX
    textarea.canvasY = event.layerY
    textarea.style.fontSize = this.curFontSize + "px"
  }
  fillText(event) {
    var textarea = this.textarea
    var text = textarea.value
    if(text.length > 0) {
      this.ctx.font = this.curFontSize + "px " + this.curFontFamily
      this.ctx.fillText(text, textarea.canvasX, textarea.canvasY + Number(this.curFontSize))
      textarea.style.left = "1000px"
      textarea.style.top = "1000px"
      textarea.value = ""
      log('font size: ', textarea.style.fontSize)
    }
  }
  registeEvent() {
    this.canvas.addEventListener('mousedown', this.drawStartSend.bind(this))
    this.canvas.addEventListener('mousemove', this.drawSend.bind(this))
    this.canvas.addEventListener('mouseup', this.endDrawSend.bind(this))
    this.canvas.addEventListener('click', this.changeTextarea.bind(this))
    this.clearBtn.addEventListener('click', this.clearBoard.bind(this))

    for(var i = 0; i < this.colorRadios.length; i++) {
      var radio = this.colorRadios[i]
      radio.addEventListener('click', this.setCurColor.bind(this))
    }
    this.colorPicker.addEventListener("change", this.setCurColor.bind(this), false)
    this.lineWidthInput.addEventListener('change', this.setCurLineWidth.bind(this), false)
    this.fontSizeInput.addEventListener('change', this.setCurFontSize.bind(this), false)
    this.isTextInput.addEventListener('click', this.setIsText.bind(this), false)
    this.textarea.addEventListener('click', this.fillText.bind(this), false)
  }
}