class DrawHistory {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    this.doneList = []
    this.recoveryList = []
  }
  drawLastOfDoneList() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    if(this.doneList.length < 1) {
      return
    }
    var lastDataUrl = this.doneList[this.doneList.length - 1]
      var img = new Image
      img.onload = () => {
        var canvasWidth = Number(this.canvas.style.width.replace('px',''))
        this.ctx.drawImage(img, 0, 0, canvasWidth, canvasWidth)
      }
    img.src = lastDataUrl
  }
  add(dataUrl) {
    this.doneList.push(dataUrl)
  }
  undo() {
    if(this.doneList.length < 1) {
      return
    }
    var rec = this.doneList.pop()
    this.recoveryList.push(rec)
    this.drawLastOfDoneList()
  }
  recover() {
    if(this.recoveryList.length < 1) {
      return
    }
    var rec = this.recoveryList.pop()
    this.doneList.push(rec)
    this.drawLastOfDoneList()
  }
}