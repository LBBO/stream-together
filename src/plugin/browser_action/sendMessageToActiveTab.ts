export const sendMessageToActiveTab = async (message: object): Promise<object> => {
  return new Promise((resolve, reject) => {
    if (typeof chrome?.tabs?.query === 'function') {
      // Get the current active tab
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0 && typeof tabs[0].id === 'number') {
          chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
            // If no message handler exists (i.e. content-script hasn't been injected before),
            // this callback is called right away with no arguments, so ...
            if (typeof response === 'undefined') {
              reject(`Content script hasn't been injected into active tab yet`)
            } else {
              resolve(response)
            }
          })
        } else {
          reject('No active tab found')
        }
      })
    } else {
      reject('chrome.tabs.query not a function')
    }
  })
}
