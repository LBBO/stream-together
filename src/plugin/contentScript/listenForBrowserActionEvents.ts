export const listenForBrowserActionEvents = (
  createSession: () => Promise<string>,
  joinSession: (sessionID: string) => Promise<unknown>,
) => {
  if (typeof chrome?.runtime?.onMessage?.addListener === 'function') {
    chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
      console.log('Received request', request, request.sessionID)
      switch (request.query) {
        case 'createSession':
          const sessionID = await createSession()
          sendResponse({
            sessionID
          })
          break
        case 'joinSession':
          await joinSession(request.sessionID)
          break
        default:
          sendResponse({
            error: 'Unknown query',
          })
          break
      }
    })
  }
}
