import { useEffect, useRef, useState } from 'react'
import { LOCAL_IMAGES } from '../data/data'
import { DEMO_DATA_CHANGED } from '../services/demoStorage'
import { INDEXED_DB_IMAGE_PREFIX } from '../services/portfolioService'
import { getPhotos } from '../services/photoStorageService'

function photoSource(photo, objectUrls) {
  if (photo.imageBlob) {
    const url = URL.createObjectURL(photo.imageBlob)
    objectUrls.push(url)
    return url
  }
  if (photo.imageUrl && !photo.imageUrl.startsWith(INDEXED_DB_IMAGE_PREFIX)) return photo.imageUrl
  return LOCAL_IMAGES[photo.imageRef] || ''
}

export function usePhotoLibrary(publishedOnly = false, refreshKey = 0) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const objectUrls = useRef([])

  useEffect(() => {
    let active = true
    let requestNumber = 0

    async function refresh() {
      const currentRequest = ++requestNumber
      const urls = []
      try {
        const savedPhotos = await getPhotos({ publishedOnly })
        const resolvedPhotos = savedPhotos.map((photo) => ({
          ...photo,
          src: photoSource(photo, urls),
          imageMissing: Boolean(photo.imageUrl?.startsWith(INDEXED_DB_IMAGE_PREFIX) && !photo.imageBlob),
        }))
        if (!active || currentRequest !== requestNumber) {
          urls.forEach((url) => URL.revokeObjectURL(url))
          return
        }
        objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
        objectUrls.current = urls
        setPhotos(resolvedPhotos)
        setError('')
      } catch (loadError) {
        urls.forEach((url) => URL.revokeObjectURL(url))
        if (active && currentRequest === requestNumber) {
          setError(loadError.message || 'The photo library could not be loaded.')
        }
      } finally {
        if (active && currentRequest === requestNumber) setLoading(false)
      }
    }

    refresh()
    window.addEventListener(DEMO_DATA_CHANGED, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      active = false
      window.removeEventListener(DEMO_DATA_CHANGED, refresh)
      window.removeEventListener('storage', refresh)
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
      objectUrls.current = []
    }
  }, [publishedOnly, refreshKey])

  return { photos, loading, error }
}
