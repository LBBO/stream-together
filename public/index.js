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

const video = document.querySelector('video')

const setupVideoEventHandlers = (webSocket) => {
  const playLike = ['play']
  const pauseLike = ['pause']

  const registerEvent = (eventType, eventName) => {
    video?.addEventListener(eventName, (event) => {
      console.log(event)
      webSocket.send(JSON.stringify({ type: eventType, data: { event } }))
    })
  }

  playLike.forEach(eventName => {
    registerEvent('playLikeEvent', eventName)
  })

  pauseLike.forEach(eventName => {
    registerEvent('pauseLikeEvent', eventName)
  })
}

const setupSocket = (sessionID) => {
  const ws = new WebSocket(`${socketUrl}sessionManager/${sessionID}`)

  setupVideoEventHandlers(ws)

  ws.onmessage = (message) => {
    const messageObj = JSON.parse(message.data)

    switch (messageObj.type) {
      case 'playLikeEvent':
        video?.play()
        console.log('play', messageObj)
        break
      case 'pauseLikeEvent':
        video?.pause()
        console.log('pause', messageObj)
        break
      default:
        console.log(messageObj)
    }
  }

  return ws
}

let doShit = async () => {
  let sessionID = await getOrCreateSessionID()

  await switchToSession(sessionID)

  await checkSession(sessionID)
  setupSocket(sessionID)
}

doShit()
