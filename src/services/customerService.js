const SESSION_KEY = 'sami_demo_session_v1'
const CUSTOMERS_KEY = 'sami_demo_customers_v1'
const ACCOUNTS_KEY = 'sami_customer_accounts_v1'
const PASSWORD_ITERATIONS = 210000
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const CUSTOMER_SESSION_CHANGED = 'sami:customer-session-changed'
export const CUSTOMER_PROFILE_CHANGED = 'sami:customer-profile-changed'

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function readJson(key, fallback) {
  let value
  try {
    value = localStorage.getItem(key)
  } catch (error) {
    console.error(`Unable to read ${key} from browser storage.`, error)
    throw new Error('Browser storage is unavailable. Please check your browser settings.')
  }
  if (value === null) return fallback
  try {
    return JSON.parse(value)
  } catch (error) {
    console.warn(`Ignoring invalid saved data for ${key}.`, error)
    return fallback
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Unable to save ${key} to browser storage.`, error)
    throw new Error('Your changes could not be saved in this browser.')
  }
}

function defaultCustomer(email) {
  const localPart = email.split('@')[0].replace(/[._-]+/g, ' ').trim()
  const name = localPart.replace(/\b\w/g, (character) => character.toUpperCase()) || 'Customer'
  return { name, email, phone: '', image: '' }
}

function normalizeCustomer(value, email) {
  const defaults = defaultCustomer(email)
  if (!isRecord(value)) return defaults
  return {
    name: typeof value.name === 'string' ? value.name : defaults.name,
    email: typeof value.email === 'string' ? value.email : defaults.email,
    phone: typeof value.phone === 'string' ? value.phone : '',
    image: typeof value.image === 'string' ? value.image : '',
    imageId: typeof value.imageId === 'string' ? value.imageId : '',
  }
}

function readAccounts() {
  const value = readJson(ACCOUNTS_KEY, {})
  if (!isRecord(value)) return {}
  return Object.fromEntries(Object.entries(value).filter(([email, account]) => {
    if (!EMAIL_PATTERN.test(email) || !isRecord(account)
      || typeof account.salt !== 'string' || typeof account.passwordHash !== 'string'
      || account.iterations !== PASSWORD_ITERATIONS) return false
    try {
      return base64ToBytes(account.salt).length === 16 && base64ToBytes(account.passwordHash).length === 32
    } catch {
      return false
    }
  }))
}

function bytesToBase64(bytes) {
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
}

async function derivePasswordHash(password, salt) {
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
    throw new Error('Password protection is unavailable in this browser. Use a modern browser over HTTPS or localhost.')
  }
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt,
    iterations: PASSWORD_ITERATIONS,
    hash: 'SHA-256',
  }, key, 256)
  return new Uint8Array(bits)
}

function sameBytes(left, right) {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index]
  return difference === 0
}

function normalizeEmail(email) {
  const normalized = typeof email === 'string' ? email.trim().toLowerCase() : ''
  if (!EMAIL_PATTERN.test(normalized)) throw new Error('Enter a valid email address.')
  return normalized
}

function readCustomers() {
  const value = readJson(CUSTOMERS_KEY, {})
  return isRecord(value) ? value : {}
}

export async function registerCustomer({ name, email, phone = '', password }) {
  const normalizedEmail = normalizeEmail(email)
  if (typeof name !== 'string' || !name.trim()) throw new Error('Enter your full name.')
  if (typeof phone !== 'string') throw new Error('Enter a valid phone number.')
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new Error('Your password must be between 8 and 128 characters.')
  }

  const accounts = readAccounts()
  if (accounts[normalizedEmail]) throw new Error('An account with this email already exists. Sign in instead.')

  if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
    throw new Error('Password protection is unavailable in this browser. Use a modern browser over HTTPS or localhost.')
  }
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16))
  const passwordHash = await derivePasswordHash(password, salt)
  const latestAccounts = readAccounts()
  if (latestAccounts[normalizedEmail]) throw new Error('An account with this email already exists. Sign in instead.')
  const customers = readCustomers()
  const legacyProfile = readJson('sami_user', null)
  const matchingLegacyProfile = isRecord(legacyProfile)
    && typeof legacyProfile.email === 'string'
    && legacyProfile.email.trim().toLowerCase() === normalizedEmail
    ? legacyProfile
    : null
  const existing = customers[normalizedEmail] || matchingLegacyProfile
  const customer = {
    ...normalizeCustomer(existing, normalizedEmail),
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
  }

  writeJson(CUSTOMERS_KEY, { ...customers, [normalizedEmail]: customer })
  try {
    writeJson(ACCOUNTS_KEY, {
      ...latestAccounts,
      [normalizedEmail]: {
        salt: bytesToBase64(salt),
        passwordHash: bytesToBase64(passwordHash),
        iterations: PASSWORD_ITERATIONS,
      },
    })
  } catch (error) {
    try {
      writeJson(CUSTOMERS_KEY, customers)
    } catch (rollbackError) {
      console.error('Unable to roll back the incomplete customer registration.', rollbackError)
    }
    throw error
  }
  return customer
}

export async function signInCustomer(email, password) {
  const normalizedEmail = normalizeEmail(email)
  if (typeof password !== 'string' || !password) throw new Error('Enter your password.')
  const account = readAccounts()[normalizedEmail]
  if (!account) throw new Error('Email or password is incorrect.')

  let expectedHash
  let salt
  try {
    salt = base64ToBytes(account.salt)
    expectedHash = base64ToBytes(account.passwordHash)
  } catch {
    throw new Error('This saved account is invalid. Please register again.')
  }
  const actualHash = await derivePasswordHash(password, salt)
  if (!sameBytes(actualHash, expectedHash)) throw new Error('Email or password is incorrect.')

  const customer = getCustomer(normalizedEmail)
  writeJson(SESSION_KEY, { email: normalizedEmail, role: 'customer' })
  window.dispatchEvent(new Event(CUSTOMER_SESSION_CHANGED))
  return customer
}

export function getDemoSession() {
  const session = readJson(SESSION_KEY, null)
  if (!isRecord(session) || typeof session.email !== 'string'
    || session.role !== 'customer') return null
  const email = session.email.trim().toLowerCase()
  if (!EMAIL_PATTERN.test(email) || !readAccounts()[email]) return null
  return { email, role: 'customer' }
}

export function endDemoSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
    window.dispatchEvent(new Event(CUSTOMER_SESSION_CHANGED))
  } catch (error) {
    console.error('Unable to end the demo session.', error)
    throw new Error('Unable to sign out. Please try again.')
  }
}

export function getCustomer(email) {
  const normalizedEmail = normalizeEmail(email)
  const customers = readCustomers()
  return normalizeCustomer(customers[normalizedEmail], normalizedEmail)
}

export function getStoredCustomers() {
  const storedCustomers = readCustomers()
  const accounts = readAccounts()
  return Object.entries(storedCustomers)
    .filter(([accountEmail]) => accounts[accountEmail])
    .map(([accountEmail, customer]) => ({ ...normalizeCustomer(customer, accountEmail), accountEmail }))
}

export function saveCustomer(email, updates) {
  const normalizedEmail = normalizeEmail(email)
  const customers = readCustomers()
  const allowedUpdates = {
    ...(typeof updates.name === 'string' ? { name: updates.name } : {}),
    ...(typeof updates.email === 'string' ? { email: updates.email } : {}),
    ...(typeof updates.phone === 'string' ? { phone: updates.phone } : {}),
    ...(typeof updates.image === 'string' ? { image: updates.image } : {}),
    ...(typeof updates.imageId === 'string' ? { imageId: updates.imageId } : {}),
  }
  const customer = normalizeCustomer({ ...getCustomer(normalizedEmail), ...allowedUpdates }, normalizedEmail)
  writeJson(CUSTOMERS_KEY, { ...customers, [normalizedEmail]: customer })
  window.dispatchEvent(new Event(CUSTOMER_PROFILE_CHANGED))
  return customer
}

export function getDemoSettings(email) {
  const saved = readJson('sami_demo_settings_v1', {})
  const allSettings = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}
  const preferences = allSettings[email]
  return preferences && typeof preferences === 'object' && !Array.isArray(preferences)
    ? {
      emailNotifications: typeof preferences.emailNotifications === 'boolean' ? preferences.emailNotifications : true,
      smsNotifications: typeof preferences.smsNotifications === 'boolean' ? preferences.smsNotifications : false,
    }
    : { emailNotifications: true, smsNotifications: false }
}

export function saveDemoSettings(email, settings) {
  const saved = readJson('sami_demo_settings_v1', {})
  const allSettings = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}
  writeJson('sami_demo_settings_v1', { ...allSettings, [email]: settings })
}
