import { Session } from '../Session'
import * as ws from 'ws'
import type { VideoEvent } from '../VideoEvent'

export const forwardEvent = (
  type: string,
  data: VideoEvent['data'],
  ws: ws | null,
  session: Session,
): void => {
  session.webSockets.forEach((otherWebSocket): void => {
    if (otherWebSocket !== ws) {
      otherWebSocket.send(
        JSON.stringify({
          type,
          data,
        }),
      )
    }
  })
}

export const broadcastEvent = (
  type: string,
  data: VideoEvent['data'],
  session: Session,
): void => forwardEvent(type, data, null, session)
