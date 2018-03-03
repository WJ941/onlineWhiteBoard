// board对象和其方法
class Board {
  constructor() {
    //Dom 对象
    this.canvas = createHiDPICanvas(1000, 1000)
    document.body.appendChild(this.canvas)
    this.clearBtn = sel('#id-clear')
    this.inviteBtn = sel('#id-invite-btn')
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
    this.tools = [
      new Pen(this.canvas, this.colorManager, this.updateCurCanvas.bind(this)),
      new Eraser(this.canvas, this.updateCurCanvas.bind(this)),
      new Textarea(this.canvas, this.colorManager, this.updateCurCanvas.bind(this)),
    ]
    //
    this.chatroom = new ChatRoom(this.wsClient)
    this.drawHistory = new DrawHistory(this)
    var self = this
    this.init()
    this.setupInputs()
  }

  // 不提供data url是自己更新canvas，行为：
  // 1.send 2.push 进history 3.更新localstorage
  // 否则是接受服务器的dataurl，行为：
  // 1.更新canvas 2.push 进history 3.更新localstorage
  updateCurCanvas(dataurl) {
    if(!dataurl) {
      dataurl = this.canvas.toDataURL()
      this.wsClient.sendObj({type: 'canvas', data: dataurl})
    } else {
      this.drawHistory.drawCanvas(dataurl)
    }
    this.drawHistory.add(dataurl)
    localStorage.setItem(this.wsClient.shareId, dataurl)
  }

  handleCanvasData(data) {
    this.updateCurCanvas(data.data)
  }

  setupInputs() {
    // 清空画布
    addListener(this.clearBtn, 'click', event => {
      this.clearBoard()
      this.ctx.clearRect(0, 0, this.width, this.height)
    })
    // 邀请其他人
    addListener(this.inviteBtn, 'click', event => {
      this.wsClient.makeInviteRequest() 
    })
    // 复制邀请地址
    addListener(this.copyLinkBtn, 'click', event => {
      try {
        copyText(this.copyLinkInput)
        this.copyLinkBtn.innerText = "已复制"
      } catch(e) {
        console.log('Oops, unable ')
      }
    })
    // 另存为图片和PDF
    addListener(this.saveImgBtn, 'click', event => {
      downloadFile('download.png', this.canvas.toDataURL())
    })
    addListener(this.savePDFBtn, 'click', event => {
      var imgData = this.canvas.toDataURL("image/png", 1.0)
      var pdf = new jsPDF()
      pdf.addImage(imgData, 'PNG', 0, 0)
      pdf.save("download.pdf")
    })
    //点击导航栏，切换工具
    this.tools.forEach( tool => {
      addListener(tool.elem, 'click', event => {
        // this.changeTool(tool)
        this.tools.forEach( t => {
          t === tool ? t.isSelected = true : t.isSelected = false
        })
      })
    })
    // 控制导航栏下拉菜单的显示
    var dropbtns = selAll('.dropdown .dropbtn')
    dropbtns.forEach( b => {
      addListener(b, 'click', e => {
        dropbtns.forEach(c => {
          c !== b && c.classList.remove('is-selected')
        })
        b.classList.toggle('is-selected')
      })
    })
    // 关闭邀请modal
    addListener(sel('#id-close-modal'), 'click', e => this.inviteBtn.classList.remove('is-selected'))
    // 点击聊天窗口意外区域关闭聊天窗口
    addListener(document, 'click', e => {
      var chatMain = sel('.chat')
      var a = sel('#id-chat-toggle')
      if( e.target === chatMain ||  chatMain.contains(e.target)) {
        return
      }
      a.checked = false
    })
  }

  init() {
    var self = this
    this.wsClient.callback = function(data) {
      if(data instanceof Blob) {
        self.chatroom.handleAudio(data)
        return
      }
      try {
        data = JSON.parse(data)
        switch(data.type) {
          case 'canvas':
            self.handleCanvasData(data)
            break
          case 'chatinfo':
          case 'chatmsg':
            self.handleChatData(data)
            break
          case 'message':
            log('message: ', data)
            break
          case 'audio':
            self.chatroom.handleAudio(data)
            break
          default:
            console.log('Sorry, we are out of ' + data.type + '.')
        }
      } catch(e) {
        log('invalid json data: ', e)
      }
    }
    var canvasDataURL = localStorage.getItem(this.wsClient.clientId)
    if(canvasDataURL) {
      this.drawHistory.add(canvasDataURL)
      this.drawHistory.drawCanvas(canvasDataURL)
    }
  }
  handleChatData(chatmsg) {
    chatmsg.isSelfMsg = false
    this.chatroom.addHistory(chatmsg)
  }
}