const serverUrl = 'localhost:3000'
const url = `http://${serverUrl}/`
const socketUrl = `ws://${serverUrl}/`

const createSession = async () => {
  try {
    const response = await fetch(`${url}createSession`, {
      method: 'POST',
    })
    const json = await response.json()
    return { result: json.uuid }
  } catch (e) {
    return {
      error: {
        message: e.message,
        stack: e.stack,
      },
    }
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
    console.log('Connection established', port)

    const socketRef: { current?: WebSocket } = {
      current: undefined,
    }

    const setupSocket = (sessionID: string) => {
      if (socketRef.current) {
        socketRef.current.close()
      }

      const ws = new WebSocket(`${socketUrl}sessionManager/${sessionID}`)
      socketRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket opened')
      }

      ws.onmessage = (message) => {
        console.log('WebSocket message', message)
        const messageObj = JSON.parse(message.data)
        port.postMessage(messageObj)
      }

      ws.onclose = () => {
        console.log('WebSocket closed, closing port')
        port.disconnect()
      }
    }

    port.onMessage.addListener((message) => {
      if (message.query === 'setupSocket') {
        console.log('Setting up WebSocket')
        setupSocket(message.sessionID)
      } else if (message.query === 'videoEvent') {
        const messageJSON = JSON.stringify(message.payload)
        socketRef.current?.send(messageJSON)
      }
    })

    port.onDisconnect.addListener(() => {
      console.log('Port disconnected, closing WebSocket')
      socketRef.current?.close()
    })
  }
})
