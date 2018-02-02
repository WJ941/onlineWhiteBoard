#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var WebSocketRouter = require('websocket').router;
var http = require('http');
var fs = require('fs');
var uuidv4 = require('uuid/v4')
var path = require('path')

const express = require('express')
const app = express()
app.set('port', 3000)
app.use(express.static(path.join(__dirname, 'public')))
// Listen for requests
var server = app.listen(app.get('port'), function() {
    var port = server.address().port;
    console.log('You are listening on port ' + port)
})

var clients = []
var clientIndex = 0
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}
 
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject()
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.')
      return
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    connection.id = uuidv4()
    clients.push(connection)
    var cIndex = clients.findIndex( client => client.id === connection.id)
    console.log('client id : ', connection.id)
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data + ' from client ' + cIndex);
            // connection.sendUTF(message.utf8Data);
            // 分发消息到每个client
            for(var i = 0; i < clients.length; i++) {
                if(i !== cIndex) {
                    clients[i].sendUTF(message.utf8Data)
                }
            }
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            // connection.sendBytes(message.binaryData);
        }
    })
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        clients.splice(cIndex, 1)
    });
})