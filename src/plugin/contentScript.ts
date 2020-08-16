import Port = chrome.runtime.Port

const asyncSendMessage = (message: any) => {
  return new Promise<any>((res) => {
    chrome.runtime.sendMessage(message, res)
  })
}

const registerNewSession = async (): Promise<string> => {
  const { result: uuid } = await asyncSendMessage({
    query: 'createSession',
  })

  return uuid
}

const sendCheckSessionMessage = async (sessionID: string): Promise<boolean> => {
  return await asyncSendMessage({
    query: 'checkSession',
    sessionID,
  })
}

const switchToSession = (sessionID: string) => {
  window.history.pushState('', '', `#${sessionID}`)
}

const getOrCreateSessionID = async () => {
  let sessionID
  const potentialSessionID = window.location.hash.substring(1)

  if (potentialSessionID) {
    const sessionExists = await sendCheckSessionMessage(potentialSessionID)

    if (sessionExists) {
      sessionID = potentialSessionID
    }
  }

  if (!sessionID) {
    sessionID = await registerNewSession()
  }

  return sessionID
}

const setupVideoEventHandlers = (port: Port, video: HTMLVideoElement) => {
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
        port.postMessage({ type: eventType, data: { videoTime } })
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

const sendSetupSocketMessage = async (sessionID: string, video: HTMLVideoElement) => {
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'websocket') {
      console.log('Connection to background script web socket established')

      const skipEvents = setupVideoEventHandlers(port, video)

      port.onMessage.addListener((message) => {
        const videoTime = message?.data?.videoTime

        if (video) {
          switch (message.type) {
            case 'playLikeEvent':
              skipEvents.seeked = true
              skipEvents.play = true
              video.currentTime = videoTime
              video?.play()
              console.info('play', message)
              break
            case 'pauseLikeEvent':
              skipEvents.seeked = true
              skipEvents.pause = true
              video?.pause()
              video.currentTime = videoTime
              console.info('pause', message)
              break
            case 'seekLikeEvent':
              skipEvents.seeked = true
              video.currentTime = videoTime
              break
            default:
              console.info(message)
          }
        } else {
          console.warn('no video found!')
        }

      })
    }
  })

  const wasSuccessful = await asyncSendMessage({
    query: 'setupSocket',
    sessionID,
  })

  if (wasSuccessful.result) {
    console.log('WS successfully setup!')
  } else {
    console.error(wasSuccessful)
  }

  return wasSuccessful
}

const initializePlugin = async () => {
  const videoElements = document.querySelectorAll('video')

  if (videoElements.length >= 1) {
    console.log('setting up plugin')
    const chosenVideo = videoElements[0]
    const sessionID = await getOrCreateSessionID()
    await switchToSession(sessionID)

    await sendSetupSocketMessage(sessionID, chosenVideo)
  }
}

initializePlugin().catch(console.error)
