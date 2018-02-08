class LineDrawer {
  constructor(board, colorRadios, colorPicker, lineWidthInput) {
    this.board = board
    this.ctx = this.board.ctx
    this.colorRadios = colorRadios
    this.colorPicker = colorPicker
    this.lineWidthInput = lineWidthInput
    this.strokeStyle = 'black'
    this.lineWidth = "1"
    this.enableDraw = false
    this.setupInputs()
  }
  beginDraw(x, y) {
    this.enableDraw = true
    this.ctx.beginPath()
    this.ctx.moveTo(x, y)
  }
  drawLine(x, y) {
    if(!this.enableDraw) {
      return
    }
    this.ctx.strokeStyle = this.strokeStyle
    this.ctx.lineWidth = this.lineWidth
    this.ctx.lineTo(x, y)
    this.ctx.stroke()
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
  }
  handleMousemove(event) {
    var x = event.layerX,
        y = event.layerY
    this.drawLine(x, y)
  }
  handleMouseup(event) {
    this.endDraw()
  }
}