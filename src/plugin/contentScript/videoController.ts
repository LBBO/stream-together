import Port = chrome.runtime.Port
import { acceptableTimeDifferenceBetweenClientsInSeconds } from '../config'
import { VideoControls } from './playerAdaption'

export type SkipEvents = { [key in keyof HTMLMediaElementEventMap]: boolean }

export type SkippableVideoControls = {
  [key in keyof VideoControls]: (
    shouldSkipEvents: SkipEvents, ...args: Parameters<VideoControls[key]>) => ReturnType<VideoControls[key]>
}

export const setupVideoEventHandlers = (port: Port, video: HTMLVideoElement): {
  removeEventListeners: () => void,
  skipEvents: SkipEvents,
} => {
  const playLike = ['play'] as Array<keyof HTMLMediaElementEventMap>
  const pauseLike = ['pause'] as Array<keyof HTMLMediaElementEventMap>
  const seekLike = ['seeking'] as Array<keyof HTMLMediaElementEventMap>

  const skipEvents = [...playLike, ...pauseLike, ...seekLike].reduce((skipEvents, eventName) => (
    {
      ...skipEvents,
      [eventName]: false,
    }
  ), {} as SkipEvents)

  const registerEvent = (eventType: string, eventName: keyof SkipEvents) => {
    const listener = () => {
      if (!skipEvents[eventName]) {
        console.log(`Sending ${eventName} event`)
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

  const playEventRemovers = playLike.map(eventName => registerEvent('playLikeEvent', eventName))
  const pauseEventRemovers = pauseLike.map(eventName => registerEvent('pauseLikeEvent', eventName))
  const seekEventRemovers = seekLike.map(eventName => registerEvent('seekLikeEvent', eventName))

  const removeEventListeners = () => {
    [...playEventRemovers, ...pauseEventRemovers, ...seekEventRemovers].forEach(remover => remover())
  }

  return { skipEvents, removeEventListeners }
}

export const setNewVideoTimeIfNecessary = (
  video: HTMLVideoElement,
  videoControls: SkippableVideoControls,
  shouldSkipEvents: SkipEvents,
  newVideoTime?: number,
  force = false,
): void => {
  if (
    typeof newVideoTime === 'number' &&
    (
      force || Math.abs(video.currentTime - newVideoTime) > acceptableTimeDifferenceBetweenClientsInSeconds
    )
  ) {
    videoControls.seek(shouldSkipEvents, newVideoTime)
  }
}

export const skipEvents = (skipEvents: SkipEvents, ...eventNames: Array<keyof SkipEvents>): void => {
  const keys = Object.keys(skipEvents) as Array<keyof SkipEvents>
  keys.forEach(key => {
    skipEvents[key] = false
  })

  eventNames.forEach(eventName => {
    skipEvents[eventName] = true
  })
}
