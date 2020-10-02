import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import express_ws from 'express-ws'
import { sessionManager } from './SessionManager/SessionManager'
import { SessionsObject } from './Session'
import { createSession } from './routes/createSession'
import { checkSession } from './routes/checkSession'

dotenv.config()
const app = express_ws(express()).app
app.use(express.json({
  inflate: false,
}))
app.use(morgan('common'))

app.get('/', (req, res) => {
  res.send({
    success: true,
  })
})

const sessions: SessionsObject = {}

app.post('/createSession', createSession(sessions))

app.get('/checkSession/:sessionID', checkSession(sessions))

app.ws('/sessionManager/:sessionID', sessionManager(sessions))

app.listen(process.env.PORT || 3000, () => console.info(`Server running on port ${process.env.PORT}`))
