class Pen {
  // constructor(board) {
  constructor(canvas, colorManager, callback) {
    // this.board = board
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.lineWidthInput = sel('input[name="line-width"]')
    this.elem = sel('#id-brush')
    this.strokeStyle = 'black'
    this.lineWidth = "1"
    this.enableDraw = false
    this.callback = callback
    this.colorManager = colorManager
    this.isSelected = false
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
    this.ctx.strokeStyle = this.colorManager.curColor
    this.ctx.lineWidth = this.lineWidth
    this.ctx.lineTo(x, y)
    this.ctx.stroke()
    return true
  }
  endDraw() {
    this.enableDraw = false
    this.callback && this.callback()
  }
  setStrokeStyle(value) {
    this.strokeStyle = value
  }
  setLineWidth(value) {
    this.lineWidth = value
  }
  addEventL(eventType, f) {
    addListener(this.canvas, eventType, e => {
      if(this.isSelected) {
        var x = event.layerX,
            y = event.layerY
        f(x, y)
      }
    })
  }
  setupInputs() {
    addListener(this.lineWidthInput, 'input', event => {
      var value = event.target.value
      this.setLineWidth(value)
      sel('#line-width').innerText = value
    })
    this.addEventL('mousedown', this.beginDraw.bind(this))
    this.addEventL('mousemove', this.drawLine.bind(this))
    this.addEventL('mouseup', this.endDraw.bind(this))
  }
  
}