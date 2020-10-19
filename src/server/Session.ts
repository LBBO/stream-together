import { v4 as createUuid } from 'uuid'
import * as ws from 'ws'

const EMPTY_SESSION_TIMEOUT_IN_SECONDS = 90

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

export function closeSessionIfNoViewersJoin(session: Session, sessionID: string, sessions: SessionsObject) {
  if (session.webSockets.size === 0){
    console.log(`Created session ${sessionID}. Viewers have ${EMPTY_SESSION_TIMEOUT_IN_SECONDS} seconds to join before the session is labeled empty and deleted.`)
    initializeSessionTermination(session, sessionID, sessions)
  }
}

export function closeSessionIfViewersLeft(session: Session, sessionID: string, sessions: SessionsObject) {
  if (session.webSockets.size === 0){
    console.log(`Empty session ${sessionID} detected. Viewers have ${EMPTY_SESSION_TIMEOUT_IN_SECONDS} seconds to rejoin before the session is labeled empty and deleted.`)
    initializeSessionTermination(session, sessionID, sessions)
  }
}

function initializeSessionTermination(session: Session, sessionID: string, sessions: SessionsObject) {
  setTimeout(() => {
    if (session.webSockets.size === 0) {
      console.log(`Confirmed that session ${sessionID} is empty. Deleting it. (Currently ${Object.values(sessions).length})`)
      delete sessions[sessionID]
      console.log(`Now ${Object.values(sessions).length} sessions`)
    } else {
      console.log(`Session ${sessionID} not empty. Deletion aborted.`)
    }
  }, EMPTY_SESSION_TIMEOUT_IN_SECONDS * 1000)
}