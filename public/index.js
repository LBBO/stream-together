const url = 'http://localhost:3000/'

let registerNewSession = async () => {
  const response = await fetch(`${url}createSession`, {
    method: 'POST',
  })
  const json = await response.json()
  return json.uuid
}

let checkSession = async (sessionID) => {
  try {
    const response = await fetch(`${url}session/${sessionID}`)
    if (response.status === 200) {
      const json = await response.json()
      console.log(json)
    } else {
      console.log('session not found')
    }
  } catch (e) {
    console.error(e)
  }
}

let doShit = async () => {
  const uuid = await registerNewSession()
  console.log(uuid)

  await checkSession(uuid)
  await checkSession('asdf')
}
