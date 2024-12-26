import { WebSocketServer, WebSocket } from 'ws'

const webSocketServer = new WebSocketServer({ port: 9090, path: '/publish' })

const clients = new Set<WebSocket>()

const send = (message: unknown) => {
  for (let ws of clients)
      if (ws.readyState === WebSocket.OPEN) 
          ws.send(JSON.stringify(message))
}

const close = (ws: WebSocket) => {
  if (ws.readyState === WebSocket.OPEN) 
    ws.close()
  clients.delete(ws)
}

type Command = { type: string } & Record<string, unknown>

webSocketServer.on('connection', (ws, req) => {
  ws.on('message', message => {
    try {
      const command: Command = JSON.parse(message.toString())
      switch (command.type) {
        case 'subscribe':
          clients.add(ws)
          break
        case 'unsubscribe':
          clients.delete(ws)
          break
        case 'send':
          send(command.message)
          break
        case 'close':
          close(ws)
          break
        default:
          console.error(`Incorrect message: '${message}' from ${req.socket.remoteAddress} (${req.socket.remoteFamily})`)
      }
    } catch (e) {
        console.error(e)
    }
  })
  ws.on('close', () => close(ws))
})

console.log('Pub/Sub server listening on 9090')
