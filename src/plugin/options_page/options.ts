// TODO: get version number from actual package.json
// import packageJSON from '../../../package.json'
const packageJSON = {
  version: '0.1.3',
}

export type Options = {
  version: string,
  backendURL: string,
}

export const defaultOptions: Options = {
  version: packageJSON.version,
  backendURL: 'localhost:3000',
}

const localStorageKey = 'stream-together-options'

const getOptionsFromAnything = (input: any): Options => {
  const inputOptions: Partial<Options> = {}

  if (typeof input === 'object' && input !== null) {
    if (typeof input.backendURL === 'string') {
      inputOptions.backendURL = input.backendURL
    }
  }

  return {
    ...defaultOptions,
    ...inputOptions,
  }

}

const getOptionsFromLocalStorage = (): Options => {
  const localStorageItem = JSON.parse(localStorage.getItem(localStorageKey) ?? 'null') as any

  return getOptionsFromAnything(localStorageItem)
}

const getOptionsFromChromeStorage = (): Promise<Options> => {
  return new Promise<Options>((resolve, reject) => {
    if (typeof chrome?.storage?.sync?.get === 'function') {
      chrome.storage.sync.get(defaultOptions, (result) => {
        resolve(getOptionsFromAnything(result))
      })
    } else {
      reject()
    }
  })
}

const saveOptionsToLocalStorage = (options: Options): void => {
  localStorage.setItem(localStorageKey, JSON.stringify(options))
}

const saveOptionsToChromeStorage = (options: Options): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (typeof chrome?.storage?.sync?.set === 'function') {
      chrome.storage.sync.set(options, resolve)
    } else {
      reject()
    }
  })
}

/**
 * Try to get options from Chrome storage, otherwise fall back to localStorage
 */
export const getOptions = async (): Promise<Options> => {
  try {
    return await getOptionsFromChromeStorage()
  } catch (e) {
    return getOptionsFromLocalStorage()
  }
}

/**
 * Try to save options to Chrome storage, otherwise fall back to localStorage
 */
export const saveOptions = async (options: Options): Promise<void> => {
  try {
    await saveOptionsToChromeStorage(options)
  } catch (e) {
    saveOptionsToLocalStorage(options)
  }
}
