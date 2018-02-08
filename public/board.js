// board对象和其方法
class Board {
  constructor(canvas, wsClient) {
    //初始化后就保持不变的状态
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    this.width = this.canvas.width
    this.height = this.canvas.height
    this.wsClient = wsClient
    this.tool = null
    //运行中常改变的状态
    this.curFontFamily = 'sans-serif'

    this.isConnected = true
    this.isText = false
    this.init()
    this.setupInputs()
  }
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
  fillText(text, x, y, fontSize) {
    this.ctx.font = fontSize + "px " + this.curFontFamily
    this.ctx.fillText(text, x, y)
  }
  handleIsText(event) {
    var isChecked = event.target.checked
    this.setIsText(isChecked)
  }
  init() {
    this.wsClient.receiveMsg = function(event) {
      log('wsclient: ', event.data)
    }
  }
  setupInputs() {
    addListener(this.canvas, 'mousedown', event => {
      this.tool && this.tool.handleMousedown && this.tool.handleMousedown(event)
    })
    addListener(this.canvas, 'mousemove', event => {
      this.tool && this.tool.handleMousemove && this.tool.handleMousemove(event)
    })
    addListener(this.canvas, 'mouseup', event => {
      this.tool && this.tool.handleMouseup && this.tool.handleMouseup(event)
    })
    addListener(this.canvas, 'click', event => {
      this.tool && this.tool.handleClick && this.tool.handleClick(event)
    })
    
    // addListener(this.canvas, 'click', this.handleClick.bind(this))
    // addListener(this.isTextInput, 'click', this.handleIsText.bind(this))
  }
  changeTool(newTool) {
    this.tool = newTool
  }
}