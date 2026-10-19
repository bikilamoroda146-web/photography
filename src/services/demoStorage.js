export const DEMO_DATA_CHANGED = 'sami:demo-data-changed'

export function readStored(key, fallback, validate = () => true) {
  let raw
  try {
    raw = localStorage.getItem(key)
  } catch (error) {
    console.error(`Unable to read ${key} from browser storage.`, error)
    throw new Error('Browser storage is unavailable. Please check your browser settings.')
  }
  if (raw === null) return fallback
  try {
    const value = JSON.parse(raw)
    if (validate(value)) return value
    console.warn(`Ignoring invalid saved data for ${key}.`)
    return fallback
  } catch (error) {
    console.warn(`Ignoring invalid saved data for ${key}.`, error)
    return fallback
  }
}

export function writeStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new Event(DEMO_DATA_CHANGED))
  } catch (error) {
    console.error(`Unable to save ${key} to browser storage.`, error)
    throw new Error('Your changes could not be saved in this browser.')
  }
}

export function createDemoId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
