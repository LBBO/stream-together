import { createNewSession, SessionsObject } from '../Session'
import { Request, Response } from 'express'

export const createSession = (sessions: SessionsObject) => (req: Request, res: Response): void => {
  if (Object.values(sessions).length < 50) {
    const session = createNewSession({
      ip: req.ip,
    })
    sessions[session.data.uuid] = session

    res.status(201)
    res.send(session.data)
  } else {
    console.log('Too many active session!', Object.values(sessions).length, Object.values(sessions))
    res.sendStatus(500)
  }
}
