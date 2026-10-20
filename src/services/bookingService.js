import { getDemoSession } from './customerService'

const BOOKINGS_KEY = 'sami_demo_bookings_v1'
const BOOKINGS_CHANGED = 'sami:bookings-changed'
const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected']

const demoBookings = [
  {
    id: 'demo-booking-nov-2026',
    reference: 'SAMI-2026-0012',
    customerEmail: 'demo@example.com',
    service: 'Portrait Photography',
    preferredDate: '2026-11-12',
    preferredTime: '',
    location: '',
    message: 'A natural-light portrait session.',
    notes: 'We will follow up to discuss the location.',
    submittedAt: '2026-10-02T10:00:00.000Z',
    status: 'Pending',
  },
  {
    id: 'demo-booking-sep-2026',
    reference: 'SAMI-2026-0008',
    customerEmail: 'demo@example.com',
    service: 'Video Production & Editing',
    preferredDate: '2026-09-03',
    preferredTime: '',
    location: '',
    message: 'Short event recap video.',
    notes: '',
    submittedAt: '2026-08-14T09:30:00.000Z',
    status: 'Completed',
  },
]

function readBookings() {
  let value
  try {
    value = localStorage.getItem(BOOKINGS_KEY)
  } catch (error) {
    console.error('Unable to read bookings from browser storage.', error)
    throw new Error('Browser storage is unavailable. Please check your browser settings.')
  }
  if (value === null) {
    try {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(demoBookings))
    } catch (error) {
      console.error('Unable to initialize demo bookings.', error)
      throw new Error('Demo bookings could not be initialized in this browser.')
    }
    return demoBookings
  }
  try {
    const bookings = JSON.parse(value)
    return Array.isArray(bookings)
      ? bookings.filter((booking) => booking && typeof booking === 'object'
        && typeof booking.id === 'string'
        && typeof booking.customerEmail === 'string'
        && typeof booking.reference === 'string'
        && typeof booking.service === 'string'
        && typeof booking.preferredDate === 'string'
        && typeof booking.submittedAt === 'string'
        && BOOKING_STATUSES.includes(booking.status))
      : []
  } catch (error) {
    console.warn('Ignoring invalid saved booking data.', error)
    return []
  }
}

function writeBookings(bookings) {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
    window.dispatchEvent(new Event(BOOKINGS_CHANGED))
  } catch (error) {
    console.error('Unable to save bookings to browser storage.', error)
    throw new Error('Your booking could not be saved in this browser.')
  }
}

export function getBookings(email) {
  return readBookings()
    .filter((booking) => booking.customerEmail === email)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
}

export function getAllBookings() {
  return readBookings()
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
}

export function getBooking(bookingId, email) {
  return getBookings(email).find((booking) => booking.id === bookingId) || null
}

export function createBooking(fields) {
  const session = getDemoSession()
  if (!session) throw new Error('Your demo session has expired. Please sign in again.')
  const bookings = readBookings()
  let reference
  do {
    reference = `SAMI-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
  } while (bookings.some((booking) => booking.reference === reference))
  const submittedAt = new Date().toISOString()
  const booking = {
    ...fields,
    id: crypto.randomUUID(),
    reference,
    customerEmail: session.email,
    submittedAt,
    status: 'Pending',
    statusHistory: [{ status: 'Pending', changedAt: submittedAt }],
    notes: '',
  }
  writeBookings([booking, ...bookings])
  return booking
}

export function cancelBooking(bookingId, email) {
  const bookings = readBookings()
  const booking = bookings.find((item) => item.id === bookingId && item.customerEmail === email)
  if (!booking) throw new Error('This booking could not be found.')
  if (booking.status !== 'Pending') throw new Error('Only pending requests can be cancelled.')
  const updated = {
    ...booking,
    status: 'Cancelled',
    statusHistory: [
      ...(Array.isArray(booking.statusHistory) ? booking.statusHistory : [{ status: booking.status, changedAt: booking.submittedAt }]),
      { status: 'Cancelled', changedAt: new Date().toISOString() },
    ],
  }
  writeBookings(bookings.map((item) => item.id === bookingId && item.customerEmail === email ? updated : item))
  return updated
}

export function updateBookingStatus(bookingId, status) {
  if (!BOOKING_STATUSES.includes(status)) throw new Error('Choose a valid booking status.')
  const bookings = readBookings()
  const booking = bookings.find((item) => item.id === bookingId)
  if (!booking) throw new Error('This booking could not be found.')

  const transitions = {
    Pending: ['Confirmed', 'Rejected', 'Cancelled'],
    Confirmed: ['Completed', 'Cancelled'],
    Completed: [],
    Cancelled: [],
    Rejected: [],
  }
  if (!transitions[booking.status].includes(status)) {
    throw new Error(`A ${booking.status.toLowerCase()} booking cannot be changed to ${status.toLowerCase()}.`)
  }

  const updated = {
    ...booking,
    status,
    statusHistory: [
      ...(Array.isArray(booking.statusHistory) ? booking.statusHistory : [{ status: booking.status, changedAt: booking.submittedAt }]),
      { status, changedAt: new Date().toISOString() },
    ],
  }
  writeBookings(bookings.map((item) => item.id === bookingId ? updated : item))
  return updated
}

export function updateBookingDetails(bookingId, details) {
  if (!details || typeof details !== 'object') throw new Error('Enter valid booking details.')
  const fields = ['preferredDate', 'preferredTime', 'location', 'notes']
  if (fields.some((field) => details[field] !== undefined && typeof details[field] !== 'string')) {
    throw new Error('Enter valid booking details.')
  }
  const preferredDate = (details.preferredDate || '').trim()
  const preferredTime = (details.preferredTime || '').trim()
  const location = (details.location || '').trim()
  const notes = (details.notes || '').trim()
  const parsedDate = preferredDate && new Date(`${preferredDate}T00:00:00`)
  if (preferredDate && (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)
    || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== preferredDate)) {
    throw new Error('Enter a valid session date.')
  }
  if (preferredTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(preferredTime)) throw new Error('Enter a valid preferred time.')
  if (location.length > 500) throw new Error('Location must be 500 characters or fewer.')
  if (notes.length > 2000) throw new Error('Studio notes must be 2,000 characters or fewer.')

  const bookings = readBookings()
  const booking = bookings.find((item) => item.id === bookingId)
  if (!booking) throw new Error('This booking could not be found.')
  const updatedFields = { preferredDate, preferredTime, location, notes }
  const labels = {
    preferredDate: 'session date',
    preferredTime: 'preferred time',
    location: 'location',
    notes: 'studio notes',
  }
  const changedFields = Object.keys(updatedFields).filter((field) => (booking[field] || '') !== updatedFields[field])
  if (!changedFields.length) return booking

  const updated = {
    ...booking,
    ...updatedFields,
    detailsHistory: [
      ...(Array.isArray(booking.detailsHistory) ? booking.detailsHistory : []),
      {
        changedAt: new Date().toISOString(),
        fields: changedFields.map((field) => labels[field]),
      },
    ],
  }
  writeBookings(bookings.map((item) => item.id === bookingId ? updated : item))
  return updated
}

export const bookingEvents = { changed: BOOKINGS_CHANGED }
