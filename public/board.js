// board对象和其方法
class Board {
  constructor(canvas, textarea, clearBtn, colorRadios, colorPicker,lineWidthInput, fontSizeInput, isTextInput, wsClient) {
    //初始化后就保持不变的状态
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    this.width = this.canvas.width
    this.height = this.canvas.height
    this.textarea = new Textarea(textarea, fontSizeInput)
    this.lineDrawer = new LineDrawer(this, colorRadios, colorPicker, lineWidthInput)
    this.clearBtn = clearBtn
    this.isTextInput = isTextInput
    this.wsClient = wsClient
    
    //运行中常改变的状态
    this.curFontFamily = 'sans-serif'

    this.isConnected = true
    this.isText = false
    this.init()
    this.setupInputs()
  }
  // board对象中处理websocket传递的消息
  // receiveMsg(msg) {
  //   var type = msg.type
  //   var data = msg.data
  //   this[type](data)
  // }
  // sendMsg(type, data) {
  //   if(!this.isConnected) {
  //     return
  //   }
  //   var msg = {
  //     type: type,
  //     data: data,
  //   }
  //   this.socket.send(JSON.stringify(msg))
  // }
  // 注册事件
  // drawStartSend(event) {
  //   var data = {
  //     x: event.layerX,
  //     y: event.layerY,
  //   }
  //   this.startDraw(data)
  //   this.sendMsg('startDraw', data)
  // }
  // drawSend(event) {
  //   var data = {
  //     x: event.layerX,
  //     y: event.layerY,
  //     strokeStyle: this.curColor,
  //     lineWidth: this.curLineWidth
  //   }
  //   // 以后用替换场景的模式，这样写不合理
  //   if(this.isText) {
  //     return    
  //   }
  //   if(!this.drawLine(data)) {
  //     return
  //   }
  //   this.sendMsg('draw', data)
  // }
  // endDrawSend() {
  //   this.endDraw()
  //   this.sendMsg('endDraw')
  // }
  clearBoard() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
  setCurColor(value) {
    if(value !== this.curColor) {
      this.curColor = value
    }
  }
  setCurLineWidth(value) {
    if(value !== this.curLineWidth) {
      this.curLineWidth = value
    }
  }
  setIsText(isChecked) {
    if(this.isText !== isChecked) {
      this.isText = isChecked
      isChecked ? this.canvas.classList.add('crosshair-cursor') : this.canvas.classList.remove('crosshair-cursor')
    }
  }
  moveTextareaTo(x, y) {
    if(!this.isText) {
      return
    }
    var textarea = this.textarea
    var width = this.canvas.offsetLeft + this.width - x
    var height = this.canvas.offsetTop + this.height - y

    textarea.show()
    textarea.setPosition(x, y, width, height)
  }
  fillText(text, fontSize, x, y) {
    this.ctx.font = fontSize + "px " + this.curFontFamily
    this.ctx.fillText(text, x, y)
  }
  handleIsText(event) {
    var isChecked = event.target.checked
    this.setIsText(isChecked)
  }
  handleMousedown(event) {
    var x = event.layerX,
        y = event.layerY
    this.lineDrawer.beginDraw(x, y)
    this.wsClient.sendMsg('mousedown')
  }
  handleMousemove(event) {
    var x = event.layerX,
        y = event.layerY
    this.lineDrawer.drawLine(x, y)
  }
  handleMouseup(event) {
    this.lineDrawer.endDraw()
  }
  handleClick(event) {
    var self = this
    this.moveTextareaTo(event.clientX, event.clientY)
    this.textarea.setTextCB(function(text, fontSize) {
      self.fillText(text, fontSize, event.layerX, event.layerY + Number(fontSize))
    })
  }
  init() {
    this.wsClient.receiveMsg = function(event) {
      log('wsclient: ', event.data)
    }
  }
  setupInputs() {
    addListener(this.canvas, 'mousedown', this.handleMousedown.bind(this))
    addListener(this.canvas, 'mousemove', this.handleMousemove.bind(this))
    addListener(this.canvas, 'mouseup', this.handleMouseup.bind(this))
    addListener(this.canvas, 'click', this.handleClick.bind(this))
    addListener(this.clearBtn, 'click', this.clearBoard.bind(this))
    addListener(this.isTextInput, 'click', this.handleIsText.bind(this))
  }
}