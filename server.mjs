import express from 'express'
import dotenv from 'dotenv'
import { v4 as createUuid } from 'uuid'
import morgan from 'morgan'

dotenv.config()
const app = express()
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

const sessions = {}

const createNewSession = () => {
  const uuid = createUuid()

  const session = {
    uuid,
  }
  sessions[uuid] = session

  return session
}

app.post('/createSession', (req, res) => {
  const session = createNewSession()

  res.status(201)
  res.send(session)
})

app.get('/session/:sessionID', (req, res) => {
  const sessionID = req.params.sessionID

  const session = sessions[sessionID]
  if (!session) {
    res.sendStatus(404)
  } else {
    res.send(session)
  }
})

app.listen(process.env.PORT || 3000)
