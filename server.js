#!/usr/bin/env node
var WebSocketServer = require('websocket').server
var WebSocketRouter = require('websocket').router
var http = require('http');
var fs = require('fs');
var path = require('path')
var colGroups = []
const express = require('express')
const app = express()
app.set('port', 3000)
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
// Listen for requests
var server = app.listen(app.get('port'), function() {
    var port = server.address().port
    console.log('You are listening on port ' + port)
})

var clients = []
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
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
          console.log('client amount: ', clients.length)
          // 分发消息到每个邀请的client
          var invitedClients = clientFilter()
          for(var i = 0; i < invitedClients.length; i++) {
            if(connection !== invitedClients[i])
            invitedClients[i].sendUTF(message.utf8Data)
          }
        }
        else if (message.type === 'binary') {
          console.log('Received Binary Message of ' + message.binaryData.length + ' bytes')
          var invitedClients = clientFilter()
          for(var i = 0; i < invitedClients.length; i++) {
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