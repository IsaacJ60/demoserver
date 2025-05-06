// server/server.js
const WebSocket = require('ws')

// pick any port you like
const PORT = process.env.PORT || 8080
const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`WS server running on ws://localhost:${PORT}`)
})

let totalClicks = 0

wss.on('connection', (ws) => {
  // send the current total on new connections
  ws.send(JSON.stringify({ type: 'init', count: totalClicks }))

  ws.on('message', (data) => {
    let msg
    try {
      msg = JSON.parse(data)
    } catch (e) {
      console.error('invalid JSON:', data)
      return
    }

    if (msg.type === 'cookieClick') {
      totalClicks = msg.count

      // broadcast updated total to all clients
      for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'update',
            count: totalClicks,
          }))
        }
      }
    }
  })
})
