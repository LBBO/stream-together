const serverUrl = 'localhost:3000'
const url = `http://${serverUrl}/`
const socketUrl = `ws://${serverUrl}/`

const createSession = async () => {
  const response = await fetch(`${url}createSession`, {
    method: 'POST',
  })

  try {
    const json = await response.json()
    return { result: json.uuid }
  } catch (e) {
    console.log(e, response)
    throw e
  }
}

const checkSession = async (sessionID: string) => {
  const response = await fetch(`${url}checkSession/${sessionID}`)
  return response.status === 200
}

const setupSocket = (sessionID: string) => new WebSocket(`${socketUrl}sessionManager/${sessionID}`)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handleMessage = async () => {
    console.log('Message received:', message)
    switch (message.query) {
      case 'createSession':
        const sessionIDResult = await createSession()
        sendResponse(sessionIDResult)
        break
      case 'checkSession':
        sendResponse(await checkSession(message.sessionID))
        break
      case 'setupSocket':
        sendResponse(setupSocket(message.search))
        break
      default:
        sendResponse({ error: 'Unknown Query' })
        break
    }
  }

  handleMessage().catch(console.error)

  return true
})
