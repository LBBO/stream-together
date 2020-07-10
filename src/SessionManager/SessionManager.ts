import { WebsocketRequestHandler } from 'express-ws'
import { SessionsObject } from '../Session'
import { forwardEvent } from './forwardEvent'

export const sessionManager = (sessions: SessionsObject): WebsocketRequestHandler => (ws, req) => {
  const clientIP = req.connection.remoteAddress
  const sessionID = req.params.sessionID
  const session = sessions[sessionID]

  if (session && clientIP) {
    session.ipAddresses.add(clientIP)
    session.webSockets.add(ws)
  } else {
    ws.close(404)
  }
  console.log(`Socket opened from ${clientIP}`)

  ws.onclose = () => {
    if (session && clientIP) {
      session.ipAddresses.delete(clientIP)
      session.webSockets.delete(ws)
      console.log(`Socket from ${clientIP} closed`)

      if (session.webSockets.size === 0) {
        console.log(`Session ${sessionID} is now empty. Deleting session.`)
        delete sessions[sessionID]
      }
    }
  }

  ws.onmessage = (message) => {
    try {
      if (typeof message.data === 'string') {
        const messageObj = JSON.parse(message.data)

        if (messageObj.type === 'joinSession') {
          const sessionID = messageObj.sessionID
          const session = sessions[sessionID]

          ws.send(JSON.stringify(session.data))
        }

        switch (messageObj.type) {
          case 'pauseLikeEvent':
          case 'playLikeEvent':
            forwardEvent(messageObj.data.event, ws, session)
            break
          default:
            ws.send(JSON.stringify({
              type: 'error',
              message: `Unknown message type ${messageObj.type}`,
            }))
        }
      }
    } catch (e) {
      // Message is no JSON
    }
  }
}
