import { readStored, writeStored } from './demoStorage'

const SETTINGS_KEY = 'sami_demo_admin_settings_v1'
const defaults = {
  businessName: 'SAMI PHOTOGRAPHY & DIGITAL SERVICES',
  description: '',
  contactEmail: '',
  location: '',
  showPortfolio: true,
  showServices: true,
}
const validSettings = (value) => value && typeof value === 'object' && !Array.isArray(value)

export function getAdminSettings() {
  const saved = readStored(SETTINGS_KEY, {}, validSettings)
  return {
    businessName: typeof saved.businessName === 'string' ? saved.businessName : defaults.businessName,
    description: typeof saved.description === 'string' ? saved.description : defaults.description,
    contactEmail: typeof saved.contactEmail === 'string' ? saved.contactEmail : defaults.contactEmail,
    location: typeof saved.location === 'string' ? saved.location : defaults.location,
    showPortfolio: typeof saved.showPortfolio === 'boolean' ? saved.showPortfolio : defaults.showPortfolio,
    showServices: typeof saved.showServices === 'boolean' ? saved.showServices : defaults.showServices,
  }
}

export function saveAdminSettings(settings) {
  if (typeof settings.businessName !== 'string' || !settings.businessName.trim()) throw new Error('Business display name is required.')
  if (typeof settings.contactEmail === 'string' && settings.contactEmail.trim()
    && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contactEmail.trim())) {
    throw new Error('Enter a valid contact email or leave the placeholder empty.')
  }
  const value = {
    ...defaults,
    ...settings,
    businessName: settings.businessName.trim(),
    description: typeof settings.description === 'string' ? settings.description.trim() : '',
    contactEmail: typeof settings.contactEmail === 'string' ? settings.contactEmail.trim() : '',
    location: typeof settings.location === 'string' ? settings.location.trim() : '',
  }
  writeStored(SETTINGS_KEY, value)
  return value
}
