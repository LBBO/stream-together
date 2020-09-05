import { Session } from '../Session'
import * as ws from 'ws'

export const forwardEvent = (type: string, data: any, ws: ws | null, session: Session) => {
  session.webSockets.forEach((otherWebSocket) => {
    if (otherWebSocket !== ws) {
      otherWebSocket.send(JSON.stringify({
        type,
        data,
      }))
    }
  })
}

export const broadcastEvent = (type: string, data: any, session: Session) => forwardEvent(type, data, null, session)
