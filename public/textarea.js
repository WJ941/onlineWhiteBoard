class Textarea {
  constructor(textarea, fontSizeInput) {
    this.textarea = textarea
    this.fontSize = 10
    this.fontSizeInput = fontSizeInput
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
  // setLayerPosition(x, y) {
  //   this.layerX = x
  //   this.layerY = y
  // }
  handleClick(event) {
    var text = event.target.value
    if(text.length < 1) {
      return
    }
    this.clear()
    this.hide()
    this.handleTextsCB(text, this.fontSize)
  }
  setInputs() {
    addListener(this.textarea, 'click', event => {
      this.handleClick(event)
      // var x = this.layerX
      // var y = this.layerY + Number(this.fontSize)
      // this.board.fillText(text, x, y, this.fontSize)
    })

    addListener(this.fontSizeInput, 'change', event => {
      this.setFontSize(event.target.value)
    })
  }
}