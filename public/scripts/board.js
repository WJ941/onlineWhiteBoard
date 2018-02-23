// board对象和其方法
class Board {
  constructor() {
    //Dom 对象
    this.canvas = createHiDPICanvas(1000, 1000)
    document.body.appendChild(this.canvas)
    this.clearBtn = sel('#id-clear')
    this.inviteBtn = sel('#id-invite-btn')
    //
    this.undoBtn = sel('#id-undo')
    this.recoverBtn = sel('#id-recover')
    //
    this.savePDFBtn = sel('#id-save-pdf')
    this.saveImgBtn = sel('#id-save-img')
    //
    this.copyLinkBtn = sel('#id-copy-link')
    this.copyLinkInput = sel('#id-copy-input')
    this.colorManager = ColorManager.instance()
    this.ctx = this.canvas.getContext('2d')
    this.width = this.canvas.width
    this.height = this.canvas.height
    this.tool = null
    this.wsClient = new WSClient()
    //运行中常改变的状态
    this.color = this.colorManager.curColor
    this.tools = [
      new Pen(this),
      new Eraser(this),
      new Textarea(this),
    ]
    // 
    this.drawHistory = new DrawHistory(this.canvas)
    this.init()
    this.setupInputs()
  }
  
  setupInputs() {
    addListener(this.canvas, 'mousedown', event => {
      this.tool && this.tool.handleMousedown && this.tool.handleMousedown(event)
    })
    addListener(this.canvas, 'mousemove', event => {
      this.tool && this.tool.handleMousemove && this.tool.handleMousemove(event)
    })
    addListener(this.canvas, 'mouseup', event => {
      this.tool && this.tool.handleMouseup && this.tool.handleMouseup(event)
      var canvasDataURL = this.canvas.toDataURL()
      this.drawHistory.add(canvasDataURL)
      this.wsClient.sendMsg(canvasDataURL)
      //localstorage
      localStorage.setItem(this.wsClient.shareId, canvasDataURL)
    })
    addListener(this.canvas, 'click', event => {
      this.tool && this.tool.handleClick && this.tool.handleClick(event)
    })
    addListener(this.clearBtn, 'click', event => {
      this.clearBoard()
    })
    //点击工具栏，切换工具
    this.tools.forEach( tool => {
      addListener(tool.elem, 'click', event => {
        event.target.checked === true ? this.changeTool(tool) : null
      })
    })
    // 导航栏上的邀请按钮点击事件
    addListener(this.inviteBtn, 'click', event => {
      this.wsClient.makeInviteRequest() 
    })
    //  撤销和恢复按钮
    addListener(this.undoBtn, 'click', event => {
      this.drawHistory.undo()
    })
    addListener(this.recoverBtn, 'click', event => {
      this.drawHistory.recover()
    })

    //保存按钮
    addListener(this.saveImgBtn, 'click', event => {
      downloadFile('download.png', this.canvas.toDataURL())
    })
    addListener(this.savePDFBtn, 'click', event => {
      // log('begin: ', Date.now())
      var imgData = this.canvas.toDataURL("image/png", 1.0)
      // log('finish todataurl: ', Date.now())
      var pdf = new jsPDF()
      pdf.addImage(imgData, 'PNG', 0, 0)
      // log('finish addImage: ', Date.now())
      pdf.save("download.pdf")
      // log('save: ', Date.now())
    })
    //复制链接按钮
    addListener(this.copyLinkBtn, 'click', event => {
      try {
        copyText(this.copyLinkInput)
        this.copyLinkBtn.innerText = "已复制"
      } catch(e) {
        console.log('Oops, unable ')
      }
    })
  }
  init() {
    this.colorManager.addSubscriber( color => {
      this.color = color
    })
    var self = this
    this.wsClient.callback = function(data) {
      if(data.includes('base64')) {
        self.drawHistory.add(data)
        self.drawHistory.drawLastOfDoneList()
      }
    }
    log('this.wsClient.clientId : ', this.wsClient.clientId)
    var canvasDataURL = localStorage.getItem(this.wsClient.clientId)
    if(canvasDataURL) {
      this.drawHistory.add(canvasDataURL)
      this.drawHistory.drawLastOfDoneList()
    }
  }
  changeTool(newTool) {
    this.tool = newTool
  }
  clearBoard() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
}