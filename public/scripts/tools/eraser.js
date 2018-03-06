class Eraser extends MovableBlock{
  constructor(canvas, callback) {
    super(canvas, false)
    this.enableErase = false
    this.eraserSizeInput = sel('input[name="eraser-size"]')
    this.elem = sel('#id-eraser')
    this.callback = callback
    this.setupInputs()
  }
  setupInputs() {
    // input range type绑定
    this.addRangeEvt(sel('input[name="eraser-size"]'), sel('#eraser-size'))
    // 鼠标事件
    this.addClickEvt('mousedown', this.beginErase.bind(this))
    this.addClickEvt('mousemove', this.erase.bind(this))
    this.addClickEvt('mouseup', this.endErase.bind(this))
    // 触摸事件
    this.addTouchEvt('touchstart', this.beginErase.bind(this))
    this.addTouchEvt('touchmove', this.erase.bind(this))
    this.addTouchEvt('touchend', this.endErase.bind(this))
  }
  beginErase() {
    this.enableErase = true
  }
  erase(x, y) {
    if(this.enableErase == false) {
      return
    }
    this.ctx.clearRect(x, y, this.width, this.width)
  }
  endErase() {
    this.enableErase = false
    this.callback && this.callback()
  }
}