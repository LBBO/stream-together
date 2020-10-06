import { leaveSession, getCurrentConnectionStatus } from './sessionController'

export type BrowserActionRequest = {
  query: string,
  sessionID?: string,
}

const evaluateMessage = async (
  request: BrowserActionRequest,
  sendResponse: (response: unknown) => void,
  createSession: () => Promise<string>,
  joinSession: ({ sessionID }: { sessionID: string }) => Promise<unknown>,
) => {
  switch (request.query) {
    case 'createSession':
      sendResponse({
        success: true,
        sessionID: await createSession(),
      })
      break
    case 'joinSession':
      if (request.sessionID) {
        await joinSession({ sessionID: request.sessionID })
        sendResponse({
          success: true,
        })
      } else {
        sendResponse({
          success: false,
        })
      }
      break
    case 'leaveSession':
      leaveSession()
      sendResponse({
        success: true,
      })
      break
    case 'getConnectionStatus':
      sendResponse(getCurrentConnectionStatus())
      break
    default:
      // TODO: throw an error if query is unknown and message is not intended for contentScript
      // This will have to wait for issue #15
      console.warn(`Unknown query ${request.query}`)
      break
  }
}

export const listenForBrowserActionEvents = (
  createSession: () => Promise<string>,
  joinSession: ({ sessionID }: { sessionID: string }) => Promise<unknown>,
): void => {
  if (typeof chrome?.runtime?.onMessage?.addListener === 'function') {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      evaluateMessage(request, sendResponse, createSession, joinSession)

      // Return true to signal that sendResponse will be used asynchronously
      return true
    })
  }
}
