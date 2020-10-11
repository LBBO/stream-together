import { v4 as createUuid } from 'uuid'
import * as ws from 'ws'

const EMPTY_SESSION_TIMEOUT = 90

export type Session = {
  ipAddresses: Set<string>,
  webSockets: Set<ws>,
  syncedSockets?: Set<ws>,
  data: {
    uuid: string,
  }
}

export type SessionsObject = {
  [key: string]: Session,
}

export const createNewSession = ({ ip }: { ip: string }): Session => {
  const uuid = createUuid()

  return {
    ipAddresses: new Set([ip]),
    webSockets: new Set(),
    data: {
      uuid,
    },
  }
}

export function closeSessionIfEmpty(session: Session, sessionID: string, sessions: SessionsObject) {
  if (session.webSockets.size === 0) {
    console.log(`Session ${sessionID} is now empty. Waiting ${EMPTY_SESSION_TIMEOUT} seconds for potential re-joins before deleting it`)
    setTimeout(() => {
      if (session.webSockets.size === 0) {
        console.log(`Session ${sessionID} is now empty. Deleting session. (Currently ${Object.values(sessions).length})`)
        delete sessions[sessionID]
        console.log(`Now ${Object.values(sessions).length} sessions`)
      } else {
        console.log(`Session ${sessionID} is no longer empty, so it won't be deleted.`)
      }
    }, EMPTY_SESSION_TIMEOUT * 1000)
  }
}