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
      default:
        sendResponse({ error: 'Unknown Query' })
        break
    }
  }

  handleMessage().catch(console.error)

  return true
})

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'stream-together') {
    const socketRef: { current?: WebSocket } = {
      current: undefined,
    }

    const setupSocket = (sessionID: string) => {
      if (socketRef.current) {
        socketRef.current.close()
      }

      const ws = new WebSocket(`${socketUrl}sessionManager/${sessionID}`)
      socketRef.current = ws

      ws.onmessage = (message) => {
        const messageObj = JSON.parse(message.data)
        port.postMessage(messageObj)
      }

      ws.onclose = () => {
        port.disconnect()
      }
    }

    const port = chrome.runtime.connect({ name: 'websocket' })

    port.onMessage.addListener((message) => {
      if (message.query === 'setupSocket') {
        setupSocket(message.sessionID)
      } else if (message.query === 'videoEvent') {
        const messageJSON = JSON.stringify(message.payload)
        socketRef.current?.send(messageJSON)
      }
    })

    port.onDisconnect.addListener(() => {
      socketRef.current?.close()
    })
  }
})
