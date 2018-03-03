class Eraser {
  constructor(canvas, callback) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.eraseWidth = 10
    this.eraseHeight = 10
    this.enableErase = false
    this.eraserSizeInput = sel('input[name="eraser-size"]')
    this.elem = sel('#id-eraser')
    this.eraserSize =  10
    this.isSelected = false
    this.callback = callback
    this.setupInputs()
  }
  setupInputs() {
    addListener(this.eraserSizeInput, 'input', event => {
      this.eraserSize = event.target.value
      sel('#eraser-size').innerText = event.target.value
    })
    this.addEventL('mousedown', this.beginErase.bind(this))
    this.addEventL('mousemove', this.erase.bind(this))
    this.addEventL('mouseup', this.endErase.bind(this))
  }
  beginErase() {
    this.enableErase = true
  }
  erase(x, y) {
    if(this.enableErase == false) {
      return
    }
    this.ctx.clearRect(x, y, this.eraserSize, this.eraserSize)
  }
  endErase() {
    this.enableErase = false
    this.callback && this.callback()
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
}