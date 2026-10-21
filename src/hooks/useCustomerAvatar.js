import { useEffect, useState } from 'react'
import { CUSTOMER_PROFILE_CHANGED, getCustomer } from '../services/customerService'
import { getCustomerImage } from '../services/customerImageService'

export function useCustomerAvatar(email) {
  const [avatar, setAvatar] = useState({ src: '', error: '' })

  useEffect(() => {
    let active = true
    let objectUrl = ''
    let requestId = 0

    async function refresh() {
      const currentRequest = ++requestId
      if (!email) {
        setAvatar({ src: '', error: '' })
        return
      }
      try {
        const customer = getCustomer(email)
        const blob = await getCustomerImage(customer.imageId)
        if (!active || currentRequest !== requestId) return
        if (objectUrl) URL.revokeObjectURL(objectUrl)
        objectUrl = blob ? URL.createObjectURL(blob) : ''
        setAvatar({ src: objectUrl || customer.image || '', error: '' })
      } catch (error) {
        if (active && currentRequest === requestId) {
          setAvatar({ src: '', error: error.message || 'The profile image could not be loaded.' })
        }
      }
    }

    refresh()
    window.addEventListener(CUSTOMER_PROFILE_CHANGED, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      active = false
      requestId += 1
      window.removeEventListener(CUSTOMER_PROFILE_CHANGED, refresh)
      window.removeEventListener('storage', refresh)
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [email])

  return avatar
}
