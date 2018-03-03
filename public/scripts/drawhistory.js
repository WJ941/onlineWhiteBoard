class DrawHistory {
  constructor(board) {
    this.canvas = board.canvas
    this.ctx = this.canvas.getContext('2d')
    this.undoBtn = sel('#id-undo')
    this.recoverBtn = sel('#id-recover')
    this.doneList = []
    this.recoveryList = []
    this.setupInputs()
  }
  undo() {
    log('undo event')
    if(this.doneList.length < 1) {
      return
    }
    var d = this.doneList.pop()
    log('donelist : ', this.doneList.length)
    this.recoveryList.push(d)
    this.drawCanvas(this.doneList[this.doneList.length - 1])
  }
  setupInputs() {
    //  撤销和恢复按钮
    addListener(this.undoBtn, 'click', event => {
      this.undo()
      // this.updateCurCanvas()
    })
    addListener(this.recoverBtn, 'click', event => {
      if(this.recoveryList.length < 1) {
        return
      }
      var d = this.recoveryList.pop()
      this.doneList.push(d)
      this.drawCanvas(this.doneList[this.doneList.length - 1])
    })
  }
  drawCanvas(dataURL) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    var img = new Image
    img.onload = () => {
      var canvasWidth = Number(this.canvas.style.width.replace('px',''))
      this.ctx.drawImage(img, 0, 0, canvasWidth, canvasWidth)
    }
    img.src = dataURL
  }
  add(dataURL) {
    var list = this.doneList
    if(list.length === 0 || dataURL !== list[list.length - 1]) {
      this.doneList.push(dataURL)
      // this.drawCanvas(dataURL)
    }
  }
}