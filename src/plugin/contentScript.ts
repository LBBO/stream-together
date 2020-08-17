import Port = chrome.runtime.Port

const asyncSendMessage = (message: any) => {
  return new Promise<any>((resolve, reject) => {
    chrome.runtime.sendMessage(message, (result) => {
      if (result.error) {
        reject(new Error('An error occurred in the background script:\n' + result.error.stack))
      } else {
        resolve(result)
      }
    })
  })
}

const registerNewSession = async (): Promise<string> => {
  try {
    const { result: uuid } = await asyncSendMessage({
      query: 'createSession',
    })

    return uuid
  } catch (e) {
    if (e.message.includes('Failed to fetch')) {
      throw new Error('Failed to register new session because background fetch failed. Perhaps ' +
        'the server is offline?')
    } else {
      throw e
    }
  }
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
    const listener = () => {
      if (!skipEvents[eventName]) {
        const videoTime = video.currentTime
        port.postMessage({
          query: 'videoEvent',
          payload: {
            type: eventType,
            data: { videoTime },
          },
        })
      } else {
        console.info(`Skipping ${eventName} event`)
        skipEvents[eventName] = false
      }
    }
    video?.addEventListener(eventName, listener)

    return () => video?.removeEventListener(eventName, listener)
  }

  const playEventRemovers = playLike.map(eventName =>
    registerEvent('playLikeEvent', eventName),
  )

  const pauseEventRemovers = pauseLike.map(eventName =>
    registerEvent('pauseLikeEvent', eventName),
  )

  const seekEventRemovers = seekLike.map(eventName =>
    registerEvent('seekLikeEvent', eventName),
  )

  const removeEventListeners = () => {
    [...playEventRemovers, ...pauseEventRemovers, ...seekEventRemovers].forEach(remover => remover())
  }

  return { skipEvents, removeEventListeners }
}

const sendSetupSocketMessage = async (sessionID: string, video: HTMLVideoElement) => {
  const port = chrome.runtime.connect({ name: 'stream-together' })

  port.postMessage({
    query: 'setupSocket',
    sessionID,
  })

  const { skipEvents, removeEventListeners } = setupVideoEventHandlers(port, video)

  port.onDisconnect.addListener(() => {
    console.log('Port disconnected; removing event listeners')
    removeEventListeners()
  })

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
