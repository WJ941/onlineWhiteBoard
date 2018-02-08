class Eraser {
  constructor(board) {
    this.board = board
    this.eraseWidth = 10
    this.eraseHeight = 10
    this.enableErase = false
  }
  handleMousedown(event) {
    var x = event.layerX
    var y = event.layerY
    this.beginErase(x, y)
  }
  handleMousemove(event) {
    var x = event.layerX
    var y = event.layerY
    this.erase(x, y)
  }
  handleMouseup(event) {
    this.endErase()
  }
  beginErase() {
    this.enableErase = true
  }
  erase(x, y) {
    if(this.enableErase == false) {
      return
    }
    this.board.ctx.clearRect(x, y, this.eraseWidth, this.eraseHeight)
  }
  endErase() {
    this.enableErase = false
  }
}