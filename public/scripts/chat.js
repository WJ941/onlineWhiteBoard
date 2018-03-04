class ChatRoom {
  constructor(wsclient) {
    this.wsclient = wsclient
    this.chatroom = sel('.chat')
    this.input = sel('.chat-input')
    this.submit = sel('#id-submit')
    this.history = sel('.chat-history')
    this.chatHeader = sel('.chat-header')
    this.check = this.chatHeader.querySelector('.fa-check')
    this.edit = this.chatHeader.querySelector('.fa-edit')
    this.userNameInput = this.chatHeader.querySelector('.chat-username')
    this.chatVoiceBtn = this.chatHeader.querySelector('#id-chat-voice')
    this.chatVoiceCloseBtn = this.chatroom.querySelector('#chat-voice-close')
    this.userName = "默认用户名"
    this.userNameInput.value = this.userName
    this.historys = []
    this.options = {
      maxHistory: 100,
    }
    this.setupInputs()
    this.voiceChat()
  }
  show() {
    this.chatroom.classList.remove('hide')
  }
  sendInfoMsg(msg) {
    var obj = {
      type: 'chatinfo',
      msg: msg,
      time: Date.now(),
    }
    this.wsclient.sendObj(obj)
    this.addHistory(obj)
  }
  sendChatMsg() {
    if(this.input.value.length < 1) {
      return false
    }
    var obj = {
      type: 'chatmsg',
      msg: escapeHTML(this.input.value),
      time: Date.now(),
      userName: this.userName,
      isSelfMsg: true,
    }
    this.input.value = ''
    this.wsclient.sendObj(obj)
    this.addHistory(obj)
  }
  registerEnter(element, callback) {
    addListener(element, 'keyup', e => {
      if(e.code === "Enter" || e.keyCode === 13) {
        callback && callback(e)
      }
    })
  }
  setupInputs() {
    // 发送对话事件函数
    addListener(this.submit, 'click', event => {
      this.sendChatMsg()
    })
    this.registerEnter(this.input, this.sendChatMsg.bind(this))
    // 修改用户名时间函数
    var handleChangeName = function(){
      this.userNameInput.readOnly = true
      this.chatHeader.classList.toggle('is-editing')
      if(this.userNameInput.value && this.userNameInput.value !== this.userName) {
        var oldName = this.userName
        var newName = escapeHTML(this.userNameInput.value)
        this.userName = newName
        this.sendInfoMsg(`${oldName} change name to ${newName}`)
      } else {
        this.userNameInput.value = this.userName
      }
    }
    addListener(this.check, 'click', e => {
      handleChangeName.apply(this)
    })
    this.registerEnter(this.userNameInput, handleChangeName.bind(this))
    addListener(this.edit, 'click', e => {
      this.userNameInput.readOnly = false
      this.userNameInput.focus()
      this.chatHeader.classList.toggle('is-editing')
    })
    // 开启/关闭语音聊天
    addListener(this.chatVoiceBtn, 'click', e => {
      this.chatroom.classList.toggle('is-voicing')
    })
    addListener(this.chatVoiceCloseBtn, 'click', e => {
      this.chatroom.classList.toggle('is-voicing')
    })
  }
  addHistory(chatmsgData) {
    this.historys.push(chatmsgData)
    this.historys = this.historys.slice(-this.options.maxHistory)
    this.generateView(chatmsgData)
  }
  generateView(data) {
    var template = ''
    //根据信息类型选择模版
    switch(data.type) {
      case 'chatmsg':
        template = data.isSelfMsg === true ? sel('#self-msg-template').text : sel('#other-msg-template').text
        break;
      case 'chatinfo':
        template = sel('#change-name-template').text
        break;
      default:
        console.log('invalid chat msg')
    }
    // generate view
    data.time = this.timestampConverter(data.time)
    var res = templateReplace(template, data)
    this.history.innerHTML += res
    this.history.scrollTop = this.history.scrollHeight - this.history.clientHeight
  }
  timestampConverter(milliSeconds) {
    var oneday = 1000 * 60 * 60 * 24
    var d = new Date()
    d.setMilliseconds(0)
    d.setSeconds(0)
    d.setMinutes(0)
    d.setHours(0)
    var today = Date.parse(d)
    var tomorrow = today + oneday
    var yesterday = today - oneday
    var options1 = {
      hour12: false,
      hour: '2-digit',
      minute:'2-digit',
    }
    var options2 = {
      hour12: false,
      hour: '2-digit',
      minute:'2-digit',
      month: 'short',
      year: 'numeric',
      day: '2-digit',
    }
    var date = new Date(milliSeconds)
    if(milliSeconds >= today && milliSeconds <= tomorrow) {
      // today
      return date.toLocaleString('en-US', options1)
    } else if(milliSeconds >= yesterday && milliSeconds <= today) {
      // yesterday
      return 'yesterday ' + date.toLocaleString('en-US', options1)
    } else if(milliSeconds <= yesterday || milliSeconds >= tomorrow) {
       // before yesterday or after tomorrow
      return date.toLocaleString('en-US', options2)
    } else {
      console.log('invalid time')
    }
  }
  handleAudio(data) {
    log(data)
    var audio = new Audio(URL.createObjectURL(data));
    audio.load();
    audio.play();
  }
  voiceChat() {
    var call = this.chatVoiceBtn
    var close = this.chatVoiceCloseBtn
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

    var gRecorder = null;
    var door = false;
    var ws = this.wsclient
    var timer = null

    call.onclick = function() {
      if(!navigator.getUserMedia) {
        alert('抱歉您的设备无法语音聊天');
        return false;
      }

      SRecorder.get(function (rec) {
        gRecorder = rec;
        recordLoop()
      });
        //一次录音 
      var recordLoop = function() {
        if(!door) {
          gRecorder.start();
          door = true;
        }
        timer = setTimeout(function(){
          if(door) {
            // var obj = {
            //   type: 'audio',
            //   data: gRecorder.getBlob(),
            // }
            // ws.sendObj(obj)
            var _a = gRecorder.getBlob()
            ws.socket.send(_a)
            console.log('send',_a)
            gRecorder.clear();
            gRecorder.stop();
            door = false;
          }
          recordLoop()
        }, 300)
      }
    }
    close.onclick = function() {
        clearTimeout(timer)
    }
    var SRecorder = function(stream) {
        var config = {};
    
        config.sampleBits = config.smapleBits || 8;
        config.sampleRate = config.sampleRate || (44100 / 6);
    
        var context = new AudioContext();
        var audioInput = context.createMediaStreamSource(stream);
        var recorder = context.createScriptProcessor(4096, 1, 1);
    
        var audioData = {
            size: 0          //录音文件长度
            , buffer: []     //录音缓存
            , inputSampleRate: context.sampleRate    //输入采样率
            , inputSampleBits: 16       //输入采样数位 8, 16
            , outputSampleRate: config.sampleRate    //输出采样率
            , oututSampleBits: config.sampleBits       //输出采样数位 8, 16
            , clear: function() {
                this.buffer = [];
                this.size = 0;
            }
            , input: function (data) {
                this.buffer.push(new Float32Array(data));
                this.size += data.length;
            }
            , compress: function () { //合并压缩
                //合并
                var data = new Float32Array(this.size);
                var offset = 0;
                for (var i = 0; i < this.buffer.length; i++) {
                    data.set(this.buffer[i], offset);
                    offset += this.buffer[i].length;
                }
                //压缩
                var compression = parseInt(this.inputSampleRate / this.outputSampleRate);
                var length = data.length / compression;
                var result = new Float32Array(length);
                var index = 0, j = 0;
                while (index < length) {
                    result[index] = data[j];
                    j += compression;
                    index++;
                }
                return result;
            }
            , encodeWAV: function () {
                var sampleRate = Math.min(this.inputSampleRate, this.outputSampleRate);
                var sampleBits = Math.min(this.inputSampleBits, this.oututSampleBits);
                var bytes = this.compress();
                var dataLength = bytes.length * (sampleBits / 8);
                var buffer = new ArrayBuffer(44 + dataLength);
                var data = new DataView(buffer);
    
                var channelCount = 1;//单声道
                var offset = 0;
    
                var writeString = function (str) {
                    for (var i = 0; i < str.length; i++) {
                        data.setUint8(offset + i, str.charCodeAt(i));
                    }
                };
                
                // 资源交换文件标识符 
                writeString('RIFF'); offset += 4;
                // 下个地址开始到文件尾总字节数,即文件大小-8 
                data.setUint32(offset, 36 + dataLength, true); offset += 4;
                // WAV文件标志
                writeString('WAVE'); offset += 4;
                // 波形格式标志 
                writeString('fmt '); offset += 4;
                // 过滤字节,一般为 0x10 = 16 
                data.setUint32(offset, 16, true); offset += 4;
                // 格式类别 (PCM形式采样数据) 
                data.setUint16(offset, 1, true); offset += 2;
                // 通道数 
                data.setUint16(offset, channelCount, true); offset += 2;
                // 采样率,每秒样本数,表示每个通道的播放速度 
                data.setUint32(offset, sampleRate, true); offset += 4;
                // 波形数据传输率 (每秒平均字节数) 单声道×每秒数据位数×每样本数据位/8 
                data.setUint32(offset, channelCount * sampleRate * (sampleBits / 8), true); offset += 4;
                // 快数据调整数 采样一次占用字节数 单声道×每样本的数据位数/8 
                data.setUint16(offset, channelCount * (sampleBits / 8), true); offset += 2;
                // 每样本数据位数 
                data.setUint16(offset, sampleBits, true); offset += 2;
                // 数据标识符
                writeString('data'); offset += 4;
                // 采样数据总数,即数据总大小-44 
                data.setUint32(offset, dataLength, true); offset += 4;
                // console.log(data)
                // fadein fadeout
                // for (var i = 0; i < 100; i++) {
                //     var frameCount = data.buffer.byteLength
                //     data.buffer[i] = data.buffer[i]*i/100;//fade in
                //     data.buffer[frameCount-i-1] = data.buffer[frameCount-i-1]*i/100;//fade out
                // }

                // 写入采样数据 
                if (sampleBits === 8) {
                    for (var i = 0; i < bytes.length; i++, offset++) {
                        var s = Math.max(-1, Math.min(1, bytes[i]));
                        var val = s < 0 ? s * 0x8000 : s * 0x7FFF;
                        val = parseInt(255 / (65535 / (val + 32768)));
                        data.setInt8(offset, val, true);
                    }
                } else {
                    for (var i = 0; i < bytes.length; i++, offset += 2) {
                        var s = Math.max(-1, Math.min(1, bytes[i]));
                        data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                    }
                }
    
                return new Blob([data], { type: 'audio/wav' });
            }
        };
    
        this.start = function () {
            audioInput.connect(recorder);
            recorder.connect(context.destination);
        }
    
        this.stop = function () {
            recorder.disconnect();
        }
    
        this.getBlob = function () {
            return audioData.encodeWAV();
        }
    
        this.clear = function() {
            audioData.clear();
        }
    
        recorder.onaudioprocess = function (e) {
            audioData.input(e.inputBuffer.getChannelData(0));
        }
    };
    
    SRecorder.get = function (callback) {
        if (callback) {
            if (navigator.getUserMedia) {
                navigator.getUserMedia(
                    { audio: true },
                    function (stream) {
                        var rec = new SRecorder(stream);
                        callback(rec);
                    },
                    function(err) {
                      console.log("The following error occurred: " + err.name);
                    })
            }
        }
    }
  }
}