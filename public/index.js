const url = 'http://localhost:3000/'
const socketUrl = 'ws://localhost:3000/'

let registerNewSession = async () => {
  const response = await fetch(`${url}createSession`, {
    method: 'POST',
  })
  const json = await response.json()
  return json.uuid
}

let checkSession = async (sessionID) => {
  try {
    const response = await fetch(`${url}checkSession/${sessionID}`)
    return response.status === 200
  } catch (e) {
    console.error(e)
    return false
  }
}

const switchToSession = (sessionID) => {
  window.history.pushState('', '', `#${sessionID}`)
}

const getOrCreateSessionID = async () => {
  let sessionID
  const potentialSessionID = window.location.hash.substring(1)

  if (potentialSessionID) {
    const sessionExists = await checkSession(potentialSessionID)

    if (sessionExists) {
      sessionID = potentialSessionID
    }
  }

  if (!sessionID) {
    sessionID = await registerNewSession()
  }

  return sessionID
}

const setupSocket = (sessionID) => {
  const ws = new WebSocket(`${socketUrl}sessionManager/${sessionID}`)
  ws.onopen = () => {
    const message = {
      type: 'joinSession',
      sessionID,
    }
    ws.send(JSON.stringify(message))
  }
  return ws
}

let doShit = async () => {
  let sessionID = await getOrCreateSessionID()

  await switchToSession(sessionID)

  await checkSession(sessionID)
  const ws = setupSocket(sessionID)
  ws.onmessage = console.log
}

doShit()
