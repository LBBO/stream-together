import Port = chrome.runtime.Port
import type { VideoEvent } from '../server/VideoEvent'
import type { MessageType } from './MessageType'
import { listenForBrowserActionEvents } from './contentScript/listenForBrowserActionEvents'
import {
  pause,
  play,
  setNewVideoTimeIfNecessary,
  setupVideoEventHandlers,
  SkipEvents,
  skipEvents,
} from './contentScript/videoController'
import { getPotentialSessionID, initializePlugin } from './contentScript/sessionController'

const asyncSendMessage = (message: MessageType) => {
  return new Promise((resolve, reject) => {
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
  let response: unknown

  try {
    response = await asyncSendMessage({
      query: 'createSession',
    })
  } catch (e) {
    if (e.message.includes('Failed to fetch')) {
      throw new Error('Failed to register new session because background fetch failed. Perhaps ' +
        'the server is offline?')
    } else {
      throw e
    }
  }

  const hasResult = (o: unknown): o is { result: string } => {
    return typeof response === 'object' && response !== null && typeof (
      o as { result: unknown }
    ).result === 'string'
  }

  if (hasResult(response)) {
    return response.result
  } else {
    throw new Error(`Response from registering new session cannot be interpreted: ${JSON.stringify(response)}`)
  }
}

const sendCheckSessionMessage = async (sessionID: string): Promise<boolean> => {
  const response = await asyncSendMessage({
    query: 'checkSession',
    sessionID,
  })
  return typeof response === 'boolean' ? response : false
}

export const getOrCreateSessionID = async () => {
  let sessionID
  const potentialSessionID = getPotentialSessionID() ?? ''

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

const onSync = (
  video: HTMLVideoElement,
  port: Port,
  shouldSkipEvents: SkipEvents,
  wasPreviouslyPlaying: boolean,
  videoTime?: number,
  skipSeek = false,
) => {
  if (!video.paused) {
    skipEvents(shouldSkipEvents, 'pause')
  }

  if (!skipSeek) {
    setNewVideoTimeIfNecessary(video, shouldSkipEvents, videoTime, true)
  }

  pause(video)

  const sendSyncCompleteEvent = () => {
    port.postMessage({
      query: 'videoEvent',
      payload: {
        type: 'syncComplete',
        data: { wasPreviouslyPlaying },
      },
    })
  }

  if (skipSeek) {
    sendSyncCompleteEvent()
  } else {
    video.addEventListener('seeked', sendSyncCompleteEvent, { once: true, passive: true })
  }
}

const triggerSync = (video: HTMLVideoElement, port: Port, shouldSkipEvents: SkipEvents) => {
  const videoTime = video.currentTime
  const wasPreviouslyPlaying = !video.paused
  port.postMessage({
    query: 'videoEvent',
    payload: {
      type: 'sync',
      data: { videoTime, wasPreviouslyPlaying },
    },
  })
  onSync(video, port, shouldSkipEvents, wasPreviouslyPlaying, videoTime, true)
}

const onForeignVideoEvent = (
  video: HTMLVideoElement, shouldSkipEvents: SkipEvents, message: VideoEvent, port: Port) => {
  const videoTime: number | undefined = message?.data?.videoTime

  if (video) {
    switch (message.type) {
      case 'playLikeEvent':
        skipEvents(shouldSkipEvents, 'play')
        setNewVideoTimeIfNecessary(video, shouldSkipEvents, videoTime)
        play(video)
        console.info('play', message)
        break
      case 'sync':
        onSync(video, port, shouldSkipEvents, message.data?.wasPreviouslyPlaying ?? false, videoTime)
        console.info('syncing', message)
        break
      case 'pauseLikeEvent':
        skipEvents(shouldSkipEvents, 'pause')
        setNewVideoTimeIfNecessary(video, shouldSkipEvents, videoTime)
        pause(video)
        console.info('pause', message)
        break
      case 'seekLikeEvent':
        setNewVideoTimeIfNecessary(video, shouldSkipEvents, videoTime)
        console.info('seek', message)
        break
      case 'syncRequest':
        console.log('SyncRequest')
        triggerSync(video, port, shouldSkipEvents)
        break
      default:
        console.info(message)
    }
  } else {
    console.warn('no video found!')
  }
}

export const sendSetupSocketMessage = async (sessionID: string, video: HTMLVideoElement): Promise<() => void> => {
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
    onForeignVideoEvent(video, skipEvents, message, port)
  })

  // Return method to leave session. Said method must disconnect the port (causing the WebSocket to be disconnected)
  // and must then remove the event listeners, as a manual disconnect doesn't fire the onDisconnect handler.
  return () => {
    console.log('Manually disconnecting port and removing event listeners')
    port.disconnect()
    removeEventListeners()
  }
}

/**
 * Observes DOM and looks for first video. As soon as a video element is found, the plugin is initialized.
 */
const joinPreExistingSessionASAP = () => {
  const potentialSessionID = getPotentialSessionID()

  // If session ID is already set, initialize plugin immediately.
  if (potentialSessionID !== undefined) {
    const obsRef: { current?: MutationObserver } = { current: undefined }

    obsRef.current = new MutationObserver(() => {
      const firstVideo = document.querySelector('video')

      if (firstVideo) {
        obsRef.current?.disconnect()
        initializePlugin().catch(console.error)
      }
    })

    obsRef.current?.observe(document.documentElement, {
      attributes: false,
      attributeOldValue: false,
      characterData: false,
      characterDataOldValue: false,
      childList: true,
      subtree: true,
    })
  }
}

joinPreExistingSessionASAP()

listenForBrowserActionEvents(async () => {
  const sessionID = await registerNewSession()
  await initializePlugin(sessionID)
  return sessionID
}, initializePlugin)
