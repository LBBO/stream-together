import type { MessageType } from './MessageType'
import { getOptions } from './options_page/options'

const noServerUrl = () => new Error('No Server URL found! Please configure a server URL in the plugin options!')

const getBackendURL = async () => {
  const url = (
    await getOptions()
  ).backendURL

  if (url === undefined) {
    throw noServerUrl()
  }

  const urlObject = new URL(url)

  return urlObject.host
}

const getHTTP_URL = async () => `http://${await getBackendURL()}/`
const getSocketURL = async () => `ws://${await getBackendURL()}/`

const createSession = async () => {
  try {
    const response = await fetch(`${await getHTTP_URL()}createSession`, {
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
  const response = await fetch(`${await getHTTP_URL()}checkSession/${sessionID}`)
  return response.status === 200
}

chrome.runtime.onMessage.addListener((message: MessageType, sender, sendResponse) => {
  const handleMessage = async () => {
    console.log('Message received:', message)
    switch (message.query) {
      case 'createSession':
        sendResponse(await createSession())
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

    const setupSocket = async (sessionID: string) => {
      if (socketRef.current) {
        socketRef.current.close()
      }

      const ws = new WebSocket(`${await getSocketURL()}sessionManager/${sessionID}`)
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
