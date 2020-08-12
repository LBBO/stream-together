const url = location.origin + '/'
const socketUrl = `wss://${location.host}/`

let registerNewSession = async () => {
  const response = await fetch(`${url}createSession`, {
    method: 'POST',
  })
  const json = await response.json()
  return json.uuid
}

let checkSession = async (sessionID: string) => {
  try {
    const response = await fetch(`${url}checkSession/${sessionID}`)
    return response.status === 200
  } catch (e) {
    console.error(e)
    return false
  }
}

const switchToSession = (sessionID: string) => {
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

const setupVideoEventHandlers = (webSocket: WebSocket) => {
  const playLike = ['play', 'playing'] as Array<keyof HTMLMediaElementEventMap>
  const pauseLike = ['pause', 'waiting'] as Array<keyof HTMLMediaElementEventMap>
  const seekLike = ['seeked'] as Array<keyof HTMLMediaElementEventMap>

  const skipEvents = [...playLike, ...pauseLike, ...seekLike].reduce((skipEvents, eventName) => (
    {
      ...skipEvents,
      [eventName]: false,
    }
  ), {} as { [key in keyof HTMLMediaElementEventMap]: boolean })

  const registerEvent = (eventType: string, eventName: keyof typeof skipEvents) => {
    video?.addEventListener(eventName, () => {
      if (!skipEvents[eventName]) {
        const videoTime = video.currentTime
        webSocket.send(JSON.stringify({ type: eventType, data: { videoTime } }))
      } else {
        console.info(`Skipping ${eventName} event`)
        skipEvents[eventName] = false
      }
    })
  }

  playLike.forEach(eventName => {
    registerEvent('playLikeEvent', eventName)
  })

  pauseLike.forEach(eventName => {
    registerEvent('pauseLikeEvent', eventName)
  })

  seekLike.forEach(eventName => {
    registerEvent('seekLikeEvent', eventName)
  })

  return skipEvents
}

const setupSocket = (sessionID: string) => {
  const ws = new WebSocket(`${socketUrl}sessionManager/${sessionID}`)

  const skipEvents = setupVideoEventHandlers(ws)

  ws.onmessage = (message) => {
    const messageObj = JSON.parse(message.data)
    const videoTime = messageObj?.data?.videoTime

    if (video) {
      switch (messageObj.type) {
        case 'playLikeEvent':
          skipEvents.seeked = true
          skipEvents.play = true
          video.currentTime = videoTime
          video?.play()
          console.info('play', messageObj)
          break
        case 'pauseLikeEvent':
          skipEvents.seeked = true
          skipEvents.pause = true
          video?.pause()
          video.currentTime = videoTime
          console.info('pause', messageObj)
          break
        case 'seekLikeEvent':
          skipEvents.seeked = true
          video.currentTime = videoTime
          break
        default:
          console.info(messageObj)
      }
    } else {
      console.warn('no video found!')
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
