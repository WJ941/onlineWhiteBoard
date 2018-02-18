class Textarea {
  constructor(board) {
    this.board = board
    this.ctx = this.board.ctx
    this.textarea = sel('#id-textarea')
    this.elem = sel('#id-text')
    this.fontFamilyOptions = selAll('select[name="font-family"] option')
    this.fontFamilySelect = sel('select[name="font-family"]')
    this.fontFamilys = ['sans-serif',
      'serif',
      'monospace',
      'fantasy',
      'cuisive',
      '宋体',
      '微软雅黑',
      '华文细黑',
      '黑体',
    ]
    this.fontNameInput = sel('#id-font-name')
    this.fontUrlInput = sel('#id-font-url')
    this.fontUrlSubmit = sel('#id-font-submit')
    this.fontSize = 10
    this.curFontFamily = null
    this.fontSizeInput = sel('input[name="font-size"]')
    this.fontSizeDisplay = sel('#id-font-size')
    this.layerX = 0
    this.layerY = 0
    this.handleTextsCB = null
    this.init()
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
  setPosition(x, y) {
    var ta = this.textarea
    ta.style.left = x + "px"
    ta.style.top = y + "px"
    ta.focus()
  }
  setFontSize(value) {
    this.fontSize = value
    this.textarea.style.fontSize = this.fontSize + "px"
    this.fontSizeDisplay.innerText = this.fontSize
  }
  setTextCB(func) {
    this.handleTextsCB = func
  }
  moveTo(x, y) {
    this.textarea.style.color = this.board.color
    this.show()
    this.setPosition(x, y)
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
    var x = this.layerX
    var y = this.layerY + Number(this.fontSize)
    this.ctx.font = this.fontSize + "px " + this.curFontFamily
    this.ctx.fillStyle = this.board.color
    this.ctx.fillText(text, x, y)
    this.board.drawHistory.add(this.board.canvas.toDataURL())
  }
  getDefaultFontFamily() {
    return css(this.textarea, 'font-family')
  }
  getSelectedOption() {
    return Array.prototype.find.call(this.fontFamilyOptions, e => e.selected === true) || this.fontFamilyOptions[0] 
  }
  getOtherOptions() {
    return Array.prototype.filter.call(this.fontFamilySelect.children, e => e.selected === false) || this.fontFamilyOptions.slice(1) 
  }
  init() {
    var fontFamily = this.getDefaultFontFamily()
    this.curFontFamily = fontFamily
    var selected = this.getSelectedOption()
    selected.value = fontFamily
    selected.innerText = fontFamily
    //
    var noSelectedOptions = this.getOtherOptions()
    var amount = this.fontFamilys.length - noSelectedOptions.length
    if(amount > 0) {
      for (let i = 0; i < amount; i++) {
        var option = document.createElement('option')
        this.fontFamilySelect.appendChild(option)
      }
    } else if(amount < 0) {
      for (let i = this.fontFamilys.length; i < noSelectedOptions.length; i++) {
        var option = noSelectedOptions[i];
        option.remove()
      }
    }
    noSelectedOptions = this.getOtherOptions()
    for(var i = 0; i< this.fontFamilys.length; i++) {
      var f = this.fontFamilys[i]
      var option = noSelectedOptions[i]
      option.value = f
      option.innerText = f
    }
  }
  setInputs() {
    addListener(this.textarea, 'click', event => {
      this.handletextareaClick(event)
    })

    addListener(this.fontSizeInput, 'input', event => {
      this.setFontSize(event.target.value)
    })

    addListener(this.fontFamilySelect, 'change', event => {
      this.curFontFamily = event.target.value
      this.textarea.style.fontFamily = this.curFontFamily
    })

    //在线字体地址
    addListener(this.fontUrlSubmit, 'click', event => {
      var fontName = this.fontNameInput.value
      var fontUrl = this.fontUrlInput.value
      var newStyle = document.createElement('style');
      newStyle.appendChild(document.createTextNode("\
      @font-face {\
          font-family: " + fontName + ";\
          src: url('" + fontUrl + "');\
      }\
      "))
      document.head.appendChild(newStyle)
      this.curFontFamily = fontName
      this.textarea.style.fontFamily = this.curFontFamily
      log(this.curFontFamily)
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