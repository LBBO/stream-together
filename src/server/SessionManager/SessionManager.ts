import { WebsocketRequestHandler } from 'express-ws'
import { SessionsObject } from '../Session'
import { broadcastEvent, forwardEvent } from './forwardEvent'

export const sessionManager = (sessions: SessionsObject): WebsocketRequestHandler => (ws, req) => {
  const clientIP = req.connection.remoteAddress
  const sessionID = req.params.sessionID
  const session = sessions[sessionID]

  const intervalID = setInterval(() => {
    // Only send ping if socked hasn't closed in the mean time
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }))
    } else {
      clearInterval(intervalID)
    }
  }, 45000)

  if (session && clientIP) {
    session.ipAddresses.add(clientIP)
    session.webSockets.add(ws)
  } else {
    ws.close(404)
  }
  console.log(`Socket opened from ${clientIP}`)

  // If user joined pre-existing session, synchronize all users
  if (session.webSockets.size > 1) {
    const sockets = session.webSockets.values()

    for (const socket of sockets) {
      // Only send sync request to first different user; they'll trigger the actual sync
      if (socket !== ws) {
        console.log(`Sending seekRequest to first socket`)
        socket.send(JSON.stringify({
          type: 'syncRequest',
        }))
        break
      }
    }
  }

  ws.onclose = () => {
    clearInterval(intervalID)

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
          case 'syncComplete':
            if (!session.syncedSockets) {
              session.syncedSockets = new Set()
            }

            session.syncedSockets.add(ws)

            console.log(`${session.syncedSockets.size} sockets synced`)

            if (session.syncedSockets.size === session.webSockets.size) {
              if (messageObj.data.wasPreviouslyPlaying) {
                broadcastEvent('playLikeEvent', {}, session)
              }

              session.syncedSockets = undefined
            }

            break
          case 'pauseLikeEvent':
          case 'playLikeEvent':
          case 'seekLikeEvent':
          case 'sync':
            console.log(`socket event ${messageObj.type}`)
            forwardEvent(messageObj.type, messageObj.data, ws, session)
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
