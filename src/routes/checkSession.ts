import { SessionsObject } from '../Session'
import { RequestHandler } from 'express'

export const checkSession = (sessions: SessionsObject): RequestHandler => (req, res) => {
  const sessionID = req.params.sessionID
  console.log(sessions)

  const session = sessions[sessionID]
  if (!session) {
    res.sendStatus(404)
  } else {
    res.send(session.data)
  }
}
