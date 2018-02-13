class Textarea {
  constructor(board) {
    this.board = board
    this.ctx = this.board.ctx
    this.textarea = sel('#id-textarea')
    this.elem = sel('#id-text')
    this.fontSize = 10
    this.curFontFamily = 'sans-serif'
    this.fontSizeInput = sel('input[name="font-size"]')
    this.layerX = 0
    this.layerY = 0
    this.handleTextsCB = null
    this.setInputs()
  }
  show() {
    this.textarea.classList.remove('hide')
  }
  hide() {
    this.textarea.classList.add('hide')
  }
  clear() {
    this.textarea.value = ""
  }
  setPosition(x, y, width, height) {
    var ta = this.textarea
    ta.style.position = "absolute"
    ta.style.left = x + "px"
    ta.style.top = y + "px"
    ta.style.width = width + "px"
    ta.style.height = height + "px"
    ta.focus()
  }
  setFontSize(value) {
    this.fontSize = value
    this.textarea.style.fontSize = this.fontSize + "px"
  }
  setTextCB(func) {
    this.handleTextsCB = func
  }
  moveTo(x, y) {
    var width = this.board.canvas.offsetLeft + this.board.width - x
    var height = this.board.canvas.offsetTop + this.board.height - y
    this.show()
    this.setPosition(x, y, width, height)
  }
  handleClick(event) {
    this.moveTo(event.clientX, event.clientY)
    this.layerX = event.layerX
    this.layerY = event.layerY
  }
  handletextareaClick(event) {
    var text = event.target.value
    if(text.length < 1) {
      return
    }
    this.clear()
    this.hide()
    // this.handleTextsCB(text, this.fontSize)
    var x = this.layerX
    var y = this.layerY + Number(this.fontSize)
    this.ctx.font = this.fontSize + "px " + this.curFontFamily
    this.ctx.fillText(text, x, y)
  }
  setInputs() {
    addListener(this.textarea, 'click', event => {
      this.handletextareaClick(event)
    })

    addListener(this.fontSizeInput, 'change', event => {
      this.setFontSize(event.target.value)
    })
  }

  sendWsData(method, x, y) {
    // var args = {
    //   x: x,
    //   y: y,
    //   color: this.strokeStyle,
    //   width: this.lineWidth,
    // }
    // var tool = 'pen'
    // this.wsClient.sendMsg({
    //   tool: tool,
    //   method: method,
    //   args: args,
    // })
  }
  receiveWsData(data) {
    // var method = data.method
    // var {x, y, color, width} = data.args
    // if(color) {
    //   this.strokeStyle = color
    // }
    // if(width) {
    //   this.lineWidth = width
    // }
    // if(this[method]) {
    //   this[method](x, y)
    // }
  }
}