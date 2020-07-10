import { v4 as createUuid } from 'uuid'

export type Session = {
  ipAdresses: Set<string>,
  data: {
    uuid: string,
  }
}

export type SessionsObject = {
  [key: string]: Session,
}

export const createNewSession = ({ ip }: { ip: string }) => {
  const uuid = createUuid()

  const session: Session = {
    ipAdresses: new Set([ip]),
    data: {
      uuid,
    },
  }

  return session
}
