import { v4 as createUuid } from 'uuid'
import * as ws from 'ws'

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
