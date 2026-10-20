import { useEffect, useState } from 'react'
import { DEMO_DATA_CHANGED } from '../services/demoStorage'
import { usePhotoLibrary } from './usePhotoLibrary'
import { getServices } from '../services/serviceService'
import { getAdminSettings } from '../services/adminSettingsService'
import { isUploadedImage } from '../utils/imageUpload'

function usePublicRecords(loader, publishedOnly = false) {
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    function refresh() {
      try {
        setRecords(loader(publishedOnly))
        setError('')
      } catch (loadError) {
        setError(loadError.message || 'Public content could not be loaded.')
      }
    }
    refresh()
    window.addEventListener(DEMO_DATA_CHANGED, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(DEMO_DATA_CHANGED, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [loader, publishedOnly])
  return { records, error }
}

const loadServices = () => getServices({ includeInactive: false })

export function usePublicServices() {
  const { records, error } = usePublicRecords(loadServices)
  return {
    services: records.map((service) => ({
      name: service.name,
      text: service.description,
      k: ['portrait', 'wedding', 'event', 'landscape', 'product', 'studio', 'graphic', 'graphicDesigner', 'worship'].includes(service.imageRef) ? service.imageRef : 'studio',
      img: /^https?:\/\//i.test(service.imageRef) || isUploadedImage(service.imageRef) ? service.imageRef : '',
      id: service.id,
    })),
    error,
  }
}

export function usePublicProjects(publishedOnly = true) {
  const { photos, error, loading } = usePhotoLibrary(publishedOnly)
  return {
    projects: photos.map((project) => ({
      id: project.id,
      title: project.title,
      cat: project.category,
      k: project.imageRef,
      img: project.src,
      desc: project.description,
      published: project.published,
      ratio: 'aspect-[4/3]',
    })),
    error,
    loading,
  }
}

export function usePublicSettings() {
  const [settings, setSettings] = useState({
    businessName: 'SAMI PHOTOGRAPHY & DIGITAL SERVICES',
    description: '',
    contactEmail: '',
    location: '',
    showPortfolio: true,
    showServices: true,
  })
  const [error, setError] = useState('')
  useEffect(() => {
    function refresh() {
      try {
        const stored = getAdminSettings()
        setSettings(stored)
        setError('')
      } catch (loadError) {
        setError(loadError.message || 'Website preferences could not be loaded.')
      }
    }
    refresh()
    window.addEventListener(DEMO_DATA_CHANGED, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(DEMO_DATA_CHANGED, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])
  return { settings, error }
}
