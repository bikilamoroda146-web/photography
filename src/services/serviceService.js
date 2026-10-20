import { readStored, writeStored, createDemoId } from './demoStorage'
import { isUploadedImage } from '../utils/imageUpload'

const SERVICES_KEY = 'sami_demo_services_v1'
export const SERVICE_CATEGORIES = [
  'Portrait Photography',
  'Wedding Photography',
  'Event Photography',
  'Landscape Photography',
  'Product Photography',
  'Video Production & Editing',
  'Graphic Design',
  'Other Digital Services',
]

const defaultServices = [
  ['Portrait Photography', 'Portrait sessions for individuals, families and creatives.', 'portrait'],
  ['Wedding Photography', 'Photography to document the moments and people of your wedding day.', 'wedding'],
  ['Event Photography', 'Coverage for events, gatherings and meaningful occasions.', 'event'],
  ['Landscape Photography', 'Landscape and location photography for personal or creative projects.', 'landscape'],
  ['Product Photography', 'Product imagery for brands, makers and businesses.', 'product'],
  ['Video Production & Editing', 'Video production and post-production for stories and projects.', 'studio'],
  ['Graphic Design', 'Visual design for creative and business communication.', 'graphic'],
  ['Other Digital Services', 'Digital creative services tailored to your project.', 'event'],
].map(([name, description, imageKey], index) => ({
  id: `service-${index + 1}`,
  name,
  description,
  imageRef: imageKey,
  active: true,
}))
const defaultGraphicDesignService = defaultServices.find((service) => service.name === 'Graphic Design')

const validServices = (value) => Array.isArray(value) && value.every((item) => item
  && typeof item.id === 'string' && typeof item.name === 'string'
  && typeof item.description === 'string' && typeof item.imageRef === 'string'
  && typeof item.active === 'boolean')

export function getServices({ includeInactive = true } = {}) {
  const services = readStored(SERVICES_KEY, defaultServices, validServices)
  const updatedServices = services.map((service) => (
    service.id === defaultGraphicDesignService.id
      && service.name === defaultGraphicDesignService.name
      && service.description === defaultGraphicDesignService.description
      && service.imageRef === 'product'
      ? { ...service, imageRef: defaultGraphicDesignService.imageRef }
      : service
  ))
  return (includeInactive ? updatedServices : updatedServices.filter((service) => service.active))
    .slice().sort((a, b) => a.name.localeCompare(b.name))
}

export function saveService(service) {
  if (!service || typeof service.name !== 'string' || !service.name.trim()
    || typeof service.description !== 'string' || !service.description.trim()) {
    throw new Error('Enter a service name and description.')
  }
  const services = getServices()
  const imageRef = typeof service.imageRef === 'string' ? service.imageRef.trim() : ''
  if (!isUploadedImage(imageRef) && /^https?:\/\//i.test(imageRef)) {
    let imageUrl
    try {
      imageUrl = new URL(imageRef)
    } catch {
      throw new Error('Enter a valid image URL or image reference.')
    }
    if (!['http:', 'https:'].includes(imageUrl.protocol)) throw new Error('Image URLs must use HTTP or HTTPS.')
  }
  const normalized = {
    id: service.id || createDemoId('service'),
    name: service.name.trim(),
    description: service.description.trim(),
    imageRef: imageRef || 'studio',
    active: Boolean(service.active),
  }
  if (services.some((item) => item.name.toLowerCase() === normalized.name.toLowerCase() && item.id !== normalized.id)) {
    throw new Error('A service with this name already exists.')
  }
  writeStored(SERVICES_KEY, service.id
    ? services.map((item) => item.id === service.id ? normalized : item)
    : [...services, normalized])
  return normalized
}

export function deleteService(serviceId) {
  const services = getServices()
  if (!services.some((service) => service.id === serviceId)) throw new Error('This service could not be found.')
  writeStored(SERVICES_KEY, services.filter((service) => service.id !== serviceId))
}
