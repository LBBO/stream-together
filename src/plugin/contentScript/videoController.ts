import Port = chrome.runtime.Port
import { acceptableTimeDifferenceBetweenClientsInSeconds } from '../config'

export type SkipEvents = { [key in keyof HTMLMediaElementEventMap]: boolean }

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
const getDisneyPlusPlayPauseElement = () => document.querySelector<HTMLButtonElement>(
  'div > div > div.controls__footer.display-flex > div.controls__footer__wrapper.display-flex >' +
  ' div.controls__center > button.control-icon-btn.play-icon.play-pause-icon',
)
export const play = (video: HTMLVideoElement): void => {
  if (video.paused) {
    console.log('playing')
    const disneyPlusPlayPauseButton = getDisneyPlusPlayPauseElement()
    if (disneyPlusPlayPauseButton) {
      disneyPlusPlayPauseButton.click()
    } else {
      video.play()
    }
  }
}
export const pause = (video: HTMLVideoElement): void => {
  if (!video.paused) {
    console.log('pausing')
    const disneyPlusPlayPauseButton = getDisneyPlusPlayPauseElement()
    if (disneyPlusPlayPauseButton) {
      disneyPlusPlayPauseButton.click()
    } else {
      video.pause()
    }
  }
}
export const setNewVideoTimeIfNecessary = (
  video: HTMLVideoElement,
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
    shouldSkipEvents.seeking = true
    video.currentTime = newVideoTime
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
