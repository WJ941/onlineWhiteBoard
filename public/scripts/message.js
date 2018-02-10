// var msg = new Map()
// msg.set('drawLine', {x})
// drawLine: beginDraw (x, y)
//           drawLine  (x, y, color, lineWidth)
//           endDraw   ()
// eraser: erase(x, y, size)

// textarea: textarea(x, y, texts, color, fontSize)

// receiveMsg(msg) = {
//   tool = msg.tool,
//   method = msg.method,
//   args = msg.args,
//   msg: {
//     tool: 'brush',
//     method: 'beginDraw',
//     args: [x,y]
//   },
//   this[tool]method(data)
// }
// sendMsg