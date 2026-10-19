const SESSION_KEY = 'sami_demo_session_v1'
const CUSTOMERS_KEY = 'sami_demo_customers_v1'

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
  const name = email.toLowerCase() === 'demo@example.com'
    ? 'Demo Customer'
    : localPart.replace(/\b\w/g, (character) => character.toUpperCase()) || 'Customer'
  return { name, email, phone: '', image: '' }
}

function normalizeCustomer(value, email) {
  const defaults = defaultCustomer(email)
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaults
  return {
    name: typeof value.name === 'string' ? value.name : defaults.name,
    email: typeof value.email === 'string' ? value.email : defaults.email,
    phone: typeof value.phone === 'string' ? value.phone : '',
    image: typeof value.image === 'string' ? value.image : '',
  }
}

export function getDemoSession() {
  const session = readJson(SESSION_KEY, null)
  return session && typeof session.email === 'string' && session.email.includes('@') ? session : null
}

export function startDemoSession(email) {
  const normalizedEmail = email.trim().toLowerCase()
  const storedCustomers = readJson(CUSTOMERS_KEY, {})
  const customers = storedCustomers && typeof storedCustomers === 'object' && !Array.isArray(storedCustomers) ? storedCustomers : {}
  const legacyCustomer = readJson('sami_user', null)
  const legacy = legacyCustomer && typeof legacyCustomer === 'object' && !Array.isArray(legacyCustomer)
    && typeof legacyCustomer.email === 'string' && legacyCustomer.email.toLowerCase() === normalizedEmail
    ? legacyCustomer
    : null
  const customer = normalizeCustomer(customers[normalizedEmail] || legacy, normalizedEmail)
  writeJson(CUSTOMERS_KEY, { ...customers, [normalizedEmail]: customer })
  writeJson(SESSION_KEY, { email: normalizedEmail })
  return customer
}

export function endDemoSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch (error) {
    console.error('Unable to end the demo session.', error)
    throw new Error('Unable to sign out. Please try again.')
  }
}

export function getCustomer(email) {
  const storedCustomers = readJson(CUSTOMERS_KEY, {})
  const customers = storedCustomers && typeof storedCustomers === 'object' && !Array.isArray(storedCustomers) ? storedCustomers : {}
  return normalizeCustomer(customers[email], email)
}

export function getStoredCustomers() {
  const storedCustomers = readJson(CUSTOMERS_KEY, {})
  if (!storedCustomers || typeof storedCustomers !== 'object' || Array.isArray(storedCustomers)) return []
  return Object.entries(storedCustomers)
    .filter(([, customer]) => customer && typeof customer.email === 'string')
    .map(([accountEmail, customer]) => ({ ...customer, accountEmail }))
}

export function saveCustomer(email, updates) {
  const storedCustomers = readJson(CUSTOMERS_KEY, {})
  const customers = storedCustomers && typeof storedCustomers === 'object' && !Array.isArray(storedCustomers) ? storedCustomers : {}
  const customer = { ...getCustomer(email), ...updates }
  writeJson(CUSTOMERS_KEY, { ...customers, [email]: customer })
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
