type CheckSessionMessage = {
  query: 'checkSession',
  sessionID: string,
}

type CreateSessionMessage = {
  query: 'createSession'
}

export type MessageType = CheckSessionMessage | CreateSessionMessage
