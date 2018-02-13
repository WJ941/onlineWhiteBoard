// board对象和其方法
class Board {
  constructor(wsClient) {
    //Dom 对象
    this.canvas = createHiDPICanvas(1000, 1000)
    document.body.appendChild(this.canvas)
    this.clearBtn = sel('#id-clear')
    this.inviteBtn = sel('#id-invite-btn')
    this.undoBtn = sel('#id-undo')
    this.recoverBtn = sel('#id-recover')
    this.inviteModal = sel('#id-modal-invite')
    //
    this.colorManager = ColorManager.instance()
    this.ctx = this.canvas.getContext('2d')
    this.width = this.canvas.width
    this.height = this.canvas.height
    this.tool = null
    this.wsClient = wsClient
    //运行中常改变的状态
    this.color = this.colorManager.curColor
    this.isConnected = false
    this.tools = [
      new Pen(this, this.wsClient),
      new Eraser(this, this.wsClient),
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
      var dataUrl = this.canvas.toDataURL()
      this.drawHistory.add(dataUrl)
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
      event.target.checked === false ? this.makeInviteRequest() : null
    })
    //  撤销和恢复按钮
    addListener(this.undoBtn, 'click', event => {
      this.drawHistory.undo()
    })
    addListener(this.recoverBtn, 'click', event => {
      this.drawHistory.recover()
    })
  }
  init() {
    this.colorManager.addSubscriber( color => {
      this.color = color
    })
  }
  changeTool(newTool) {
    this.tool = newTool
  }
  clearBoard() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
  makeInviteRequest() {
    var httpRequest = null
    var alertContents = function() {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          var res = JSON.parse(httpRequest.responseText)
          var router1 = res[0]
          var router2 = res[1]
          window.history.pushState({}, 'index', router1)
          wsClient = new WSClient(window.location.pathname.slice(1))
          sel('#id-modal-content').innerText = 'http://localhost:3000/' + router2 
          board.isConnected = true
          changeCnctState()
        } else {
          log('There was a problem with the request.');
        }
      }
    }
    httpRequest = new XMLHttpRequest()
    if (!httpRequest) {
      log('Giving up :( Cannot create an XMLHTTP instance');
      return false;
    }
    httpRequest.onreadystatechange = alertContents;
    httpRequest.open('GET', 'http://localhost:3000/invite');
    httpRequest.send();
  }
  changeCnctState() {
    if(!board.isConnected) {
      return
    }
    wsClient.receiveMsg = function(event) {
      var data = JSON.parse(event.data)
      var tool = data.tool
      log('tool : ', tool)
  
      switch(tool) {
        case 'pen':
          pen.receiveWsData(data)
          break
        case 'erase':
          eraser.receiveWsData(data)
          break
        default:
          log('no tool')
      }
    }
  }
}