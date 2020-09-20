// This import fails in dev mode but succeeds when options page is built normally
import packageJSON from '../../../package.json'

export type Options = {
  version: string,
  backendURL: string,
}

export const defaultOptions: Options = {
  version: packageJSON.version,
  backendURL: 'http://localhost:3000',
}

const localStorageKey = 'stream-together-options'

// This function explicitly expects any input and parses the options out of it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const localStorageItem = JSON.parse(localStorage.getItem(localStorageKey) ?? 'null') as unknown

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
