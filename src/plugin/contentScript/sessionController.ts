import {
  joinPreExistingSessionASAP,
  sendCheckSessionMessage,
  sendSetupSocketMessage,
} from '../contentScript'
import { onElementRemoved } from './onElementRemoved'

const emptyFunction = () => {
  // Does nothing
}

const streamingStatus = {
  hasJoinedSession: false,
  currentVideo: null as HTMLVideoElement | null,
  disconnectFromPort: emptyFunction,
  sessionID: null as string | null,
}

export const getPotentialSessionID = (): string | undefined => {
  const hash = window.location.hash.substring(1)
  return hash === '' ? undefined : hash
}

export const addSessionIDToURL = (sessionID: string): void => {
  // Write sessionID to URL hash if no hash is set so far and if user is not on Disney Plus
  // as this seems to break Disney Plus
  if (
    !location.host.includes('disney') &&
    getPotentialSessionID() === undefined
  ) {
    window.history.pushState('', document.title, `#${sessionID}`)
  }
}

export const removeSessionIDFromURL = (): void => {
  if (getPotentialSessionID() === streamingStatus.sessionID) {
    window.history.pushState(
      '',
      document.title,
      window.location.pathname + window.location.search,
    )
  }
}

export const leaveSession = (): void => {
  removeSessionIDFromURL()

  streamingStatus.disconnectFromPort()

  streamingStatus.hasJoinedSession = false
  streamingStatus.currentVideo = null
  streamingStatus.disconnectFromPort = emptyFunction
  streamingStatus.sessionID = null
}

/**
 * Chooses video element, (gets and) checks sessionID, sets up socket and updates internal state
 * @param sessionID - SessionID to connect to
 * @param brieflyIgnoreEventsAtEndOfVideo - (Default: false) After loading the next episode on Netflix (or other
 * services), a user might receive events from users at the old video. Those events should be ignored for a short
 * time as they are not relevant.
 */
export const initializePlugin = async ({
  sessionID,
  brieflyIgnoreEventsAtEndOfVideo = false,
}: {
  sessionID?: string
  brieflyIgnoreEventsAtEndOfVideo?: boolean
}): Promise<string | undefined> => {
  const videoElements = document.querySelectorAll('video')

  if (videoElements.length >= 1) {
    const chosenVideo = videoElements[0]
    const usedSessionID = sessionID ?? (await getPotentialSessionID())

    if (usedSessionID === undefined) {
      throw new Error('No sessionID found!')
    } else if (!(await sendCheckSessionMessage(usedSessionID))) {
      throw new Error(`SessionID ${sessionID} does not exist!`)
    } else {
      await addSessionIDToURL(usedSessionID)

      const disconnectFromPort = await sendSetupSocketMessage({
        sessionID: usedSessionID,
        video: chosenVideo,
        brieflyIgnoreEventsAtEndOfVideo,
      })

      onElementRemoved(chosenVideo, () => {
        console.log(`video removed`)
        disconnectFromPort()
        joinPreExistingSessionASAP({
          sessionID: usedSessionID,
          brieflyIgnoreEventsAtEndOfVideo: true,
        })
      })

      streamingStatus.hasJoinedSession = true
      streamingStatus.currentVideo = chosenVideo
      streamingStatus.disconnectFromPort = disconnectFromPort
      streamingStatus.sessionID = usedSessionID

      return usedSessionID
    }
  }
}

export const getCurrentConnectionStatus = (): {
  isConnected: boolean
  sessionID: string | null
} => ({
  isConnected: streamingStatus.hasJoinedSession,
  sessionID: streamingStatus.sessionID,
})
