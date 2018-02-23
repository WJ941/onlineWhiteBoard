class Pen {
  constructor(board) {
    this.board = board
    this.ctx = this.board.ctx
    this.lineWidthInput = sel('input[name="line-width"]')
    this.elem = sel('#id-brush')
    this.strokeStyle = 'black'
    this.lineWidth = "1"
    this.enableDraw = false
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
    this.ctx.strokeStyle = this.board.color
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
  }
  handleMousemove(event) {
    var x = event.layerX,
        y = event.layerY
    if(this.drawLine(x, y)) {
    }
  }
  handleMouseup(event) {
    this.endDraw()
  }

}