import { getOrCreateSessionID, sendSetupSocketMessage } from '../contentScript'

const streamingStatus = {
  hasJoinedSession: false,
  currentVideo: null as HTMLVideoElement | null,
  disconnectFromPort: () => {},
  sessionID: null as string | null,
}

export const getPotentialSessionID = (): string | undefined => {
  const hash = window.location.hash.substring(1)
  return hash === '' ? undefined : hash
}

export const addSessionIDToURL = (sessionID: string) => {
  // Write sessionID to URL hash if no hash is set so far and if user is not on Disney Plus
  // as this seems to break Disney Plus
  if (!location.host.includes('disney.com') && getPotentialSessionID() === undefined) {
    window.history.pushState('', document.title, `#${sessionID}`)
  }
}

export const removeSessionIDFromURL = () => {
  if (getPotentialSessionID() === streamingStatus.sessionID) {
    window.history.pushState('', document.title, window.location.pathname + window.location.search)
  }
}

export const leaveSession = () => {
  removeSessionIDFromURL()

  streamingStatus.disconnectFromPort()

  streamingStatus.hasJoinedSession = false
  streamingStatus.currentVideo = null
  streamingStatus.disconnectFromPort = () => {}
  streamingStatus.sessionID = null
}

export const initializePlugin = async (sessionID?: string) => {
  const videoElements = document.querySelectorAll('video')

  if (videoElements.length >= 1) {
    const chosenVideo = videoElements[0]
    const usedSessionID = sessionID ?? await getOrCreateSessionID()
    await addSessionIDToURL(usedSessionID)

    const disconnectFromPort = await sendSetupSocketMessage(usedSessionID, chosenVideo)

    streamingStatus.hasJoinedSession = true
    streamingStatus.currentVideo = chosenVideo
    streamingStatus.disconnectFromPort = disconnectFromPort
    streamingStatus.sessionID = usedSessionID

    return true
  } else {
  return false
  }
}

export const getCurrentConnectionStatus = (): {
  isConnected: boolean,
  sessionID: string | null,
} => (
  {
    isConnected: streamingStatus.hasJoinedSession,
    sessionID: streamingStatus.sessionID,
  }
)
