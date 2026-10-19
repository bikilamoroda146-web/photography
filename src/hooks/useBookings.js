import { useEffect, useState } from 'react'
import { bookingEvents, getBookings } from '../services/bookingService'

export default function useBookings(email) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    function refresh() {
      try {
        setBookings(getBookings(email))
        setError('')
      } catch (loadError) {
        setError(loadError.message || 'Bookings could not be loaded.')
      } finally {
        setLoading(false)
      }
    }
    refresh()
    window.addEventListener(bookingEvents.changed, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(bookingEvents.changed, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [email])

  return { bookings, loading, error }
}
