import { WebsocketRequestHandler } from 'express-ws'
import { SessionsObject } from '../Session'

export const sessionManager = (sessions: SessionsObject): WebsocketRequestHandler => (ws) => {
  ws.onmessage = (message) => {
    try {
      if (typeof message.data === 'string') {
        const messageObj = JSON.parse(message.data)

        if (messageObj.type === 'joinSession') {
          const sessionID = messageObj.sessionID
          const session = sessions[sessionID]
          console.log(session)

          ws.send(JSON.stringify(session.data))
        }
      }
    } catch (e) {
      // Message is no JSON
    }
  }
}
