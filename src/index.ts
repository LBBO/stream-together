import express from 'express'
import dotenv from 'dotenv'
import { v4 as createUuid } from 'uuid'
import morgan from 'morgan'
import express_ws from 'express-ws'

dotenv.config()
const app = express_ws(express()).app
app.use(express.json({
  inflate: false,
}))
app.use(express.static('./public'))
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.send({
    success: true,
  })
})

type Session = {
  ipAdresses: Set<string>,
  data: {
    uuid: string,
  }
}

const sessions: {
  [key: string]: Session,
} = {}

const createNewSession = ({ ip }: { ip: string }) => {
  const uuid = createUuid()

  const session: Session = {
    ipAdresses: new Set([ip]),
    data: {
      uuid,
    },
  }
  sessions[uuid] = session

  return session
}

app.post('/createSession', (req, res) => {
  if (Object.values(sessions).length < 50) {
    const session = createNewSession({
      ip: req.ip,
    })

    res.status(201)
    res.send(session.data)
  } else {
    res.sendStatus(500)
  }
})

app.get('/session/:sessionID', (req, res) => {
  const sessionID = req.params.sessionID

  const session = sessions[sessionID]
  if (!session) {
    res.sendStatus(404)
  } else {
    session.ipAdresses.add(req.ip)
    res.send(session.data)
  }
})

app.ws('/join', (ws) => {
  ws.onmessage = (message) => {
    try {
      if (typeof message.data === 'string') {
        const messageObj = JSON.parse(message.data)

        if (messageObj.type === 'joinSession') {
          const sessionID = messageObj.sessionID
          const session = sessions[sessionID]
          console.log(session)

          ws.send(JSON.stringify(session.data))
        }
      }
    } catch (e) {
      // Message is no JSON
    }
  }
})

app.listen(process.env.PORT || 3000)
