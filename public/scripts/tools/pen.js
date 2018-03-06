class MovableBlock {
  constructor(canvas, isSelected) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.isSelected = isSelected
    this.width = 1
  }
  // 鼠标事件 mousedown mousemove mouseup
  addClickEvt(eventType, f) {
    addListener(this.canvas, eventType, e => {
      if(this.isSelected) {
        var x = event.layerX,
            y = event.layerY
        f(x, y)
      }
    })
  }
  // 触摸事件 touchdown touchmove touchend
  addTouchEvt(eventType, f) {
    var self = this
    addListener(this.canvas, eventType, e => {
      if(!this.isSelected) {
        return false
      }
      e.preventDefault()
      if(eventType === 'touchend') {
        f()
        return true
      }
      var touch = e.touches[0]
      var x = touch.clientX - self.canvas.offsetLeft
      var y = touch.clientY - self.canvas.offsetTop
      f(x, y)
    })
  }
  addRangeEvt(inputElem, outputElem) {
    var self = this
    addListener(inputElem, 'input', e => {
      var value = event.target.value
      self.width = value
      outputElem.innerText = value
    })
  }
}
class Pen extends MovableBlock{
  constructor(canvas, colorManager, callback) {
    super(canvas, false)
    this.elem = sel('#id-brush')
    this.strokeStyle = 'black'
    this.enableDraw = false
    this.callback = callback
    this.colorManager = colorManager
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
    this.ctx.lineWidth = this.width
    this.ctx.lineTo(x, y)
    this.ctx.stroke()
    return true
  }
  endDraw() {
    this.enableDraw = false
    this.callback && this.callback()
  }
  setupInputs() {
    // input range type绑定
    this.addRangeEvt(sel('input[name="line-width"]'), sel('#line-width'))
    // 鼠标事件
    this.addClickEvt('mousedown', this.beginDraw.bind(this))
    this.addClickEvt('mousemove', this.drawLine.bind(this))
    this.addClickEvt('mouseup', this.endDraw.bind(this))
    // 触摸事件
    this.addTouchEvt('touchstart', this.beginDraw.bind(this))
    this.addTouchEvt('touchmove', this.drawLine.bind(this))
    this.addTouchEvt('touchend', this.endDraw.bind(this))
  }
}