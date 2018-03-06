var WebSocketServer = require('websocket').server
var WebSocketRouter = require('websocket').router
const express = require('express')
var https = require('https')
var http = require('http')
var path = require('path')
var fs = require('fs');
var SSLPORT = 3000
var log = console.log.bind(console)
var colGroups = []
var clients = []
const app = express()

//导入HTTPS证书文件  
var keyPath = './cert/214527447900724.key'
var certPath = './cert/214527447900724.pem'
if (process.env.NODE_ENV === "production") {
  keyPath = '/cert/214528638570724.key'
  certPath = '/cert/214528638570724.pem'
  SSLPORT = 3389
}
const privateKey  = fs.readFileSync(path.join(__dirname, keyPath), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, certPath), 'utf8');
const credentials = {key: privateKey, cert: certificate}

var httpsServer = https.createServer(credentials, app)
//创建https服务器  
httpsServer.listen(SSLPORT, function() {  
  console.log('HTTPS Server is running on:', SSLPORT);  
})

app.use(express.static(path.join(__dirname, 'public')))
var randomStr = function(n) {
  return Math.random().toString(16).substr(2, 2 + n)
}
app.get('/invite',  function (req, res) {
  var pair = [randomStr(6), randomStr(6)]
  colGroups.push(pair)
  for(var i = 0; i< pair.length; i++) {
    var r = '/' + pair[i]
    app.get(r, function(req, res) {
      res.sendFile(__dirname + '/public/index.html')
    })
  }
  res.send(pair)
})
app.get('/shareid?', function(req, res) {
  var clientId = req.query.clientid
  var pair = colGroups.find( pair => {
    return pair.includes(clientId)
  })
  if(pair) {
    var shareid = pair.find( str => {
      return str !== clientId
    })
    res.send(shareid)
  }
})

wsServer = new WebSocketServer({
    httpServer: httpsServer,
    maxReceivedFrameSize: 131072,
    maxReceivedMessageSize: 10 * 1024 * 1024,
    autoAcceptConnections: false
})
 
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true
}
 
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject()
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.')
      return
    }
    var id = request.resourceURL.path.slice(1)
    if(!id) {
      request.reject()
      console.log((new Date()) + ' Connection from id ' + request.origin + ' rejected.')
      return
    }
    var connection = request.accept('echo-protocol', request.origin);
    clients.push(connection)
    connection.id = id
    var clientFilter = function() {
      var pair = colGroups.find( p => {
        return p.includes(connection.id)
      })
      console.log('colGroups: ', colGroups)
      console.log(new Date() + ' pair: ', pair, connection.id)
      var sameGroup = clients.filter( c => 
        pair.includes(c.id)
      )
      return sameGroup
    }
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
          try {
            msg = JSON.parse(message.utf8Data.replace(/\n/g,"\\\\n").replace(/\r/g,"\\\\r"))
            // msg = message.utf8Data
            console.log('client amount: ', clients.length)
            // 分发消息到每个邀请的client
            console.log('message type: ', msg.type)
            var invitedClients = clientFilter()
            for(var i = 0; i < invitedClients.length; i++) {
              if(connection !== invitedClients[i])
              invitedClients[i].send(message.utf8Data)
            }
          } catch(e) {
            log('error: ', e)
            log('invalid json data: ', message.utf8Data)
          }
        }
        else if (message.type === 'binary') {
          console.log('Received Binary Message of ' + message.binaryData.length + ' bytes')
          var invitedClients = clientFilter()
          for(var i = 0; i < invitedClients.length; i++) {
            if(connection !== invitedClients[i])
            invitedClients[i].send(message.binaryData)
          }
        }
    })
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.')
        var cIndex = clients.findIndex( client => client.id === connection.id)
        clients.splice(cIndex, 1)
    })
})