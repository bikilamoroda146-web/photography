import { PROJECTS } from '../data/data'
import { readStored, writeStored, createDemoId } from './demoStorage'
import { isUploadedImage } from '../utils/imageUpload'

const PORTFOLIO_KEY = 'sami_demo_portfolio_v1'
export const PORTFOLIO_CATEGORIES = [
  'Portraits',
  'Weddings',
  'Events',
  'Commercial',
  'Nature',
  'Landscapes',
  'Product Photography',
  'Graphic Design',
  'Other Projects',
]
export const INDEXED_DB_IMAGE_PREFIX = 'indexeddb-photo:'

const defaultProjects = PROJECTS.map((project) => ({
  id: String(project.id),
  title: project.title,
  category: project.cat === 'Products' ? 'Product Photography' : project.cat,
  imageRef: project.k,
  imageUrl: '',
  description: project.desc,
  published: true,
}))
const previousDefaultProjects = [
  ['1', 'Quiet Light', 'Portraits', 'portrait', 'Natural-light portrait session.'],
  ['2', 'Above the Ridge', 'Landscapes', 'landscape', 'Dawn over the highlands.'],
  ['3', 'City in Motion', 'Events', 'event', 'Street-level storytelling.'],
  ['4', 'Golden Hour', 'Weddings', 'wedding', 'A couple, a trail, last light.'],
  ['5', 'Still Life', 'Product Photography', 'product', 'Product photography in warm tones.'],
  ['6', 'Edge of the Sea', 'Landscapes', 'landscape', 'Coastline at dusk.'],
].map(([id, title, category, imageRef, description]) => ({
  id, title, category, imageRef, imageUrl: '', description, published: true,
}))
const currentDefaultsById = new Map(defaultProjects.map((project) => [project.id, project]))

const validProjects = (value) => Array.isArray(value) && value.every((item) => item
  && typeof item.id === 'string' && typeof item.title === 'string'
  && typeof item.category === 'string' && typeof item.imageRef === 'string'
  && typeof item.imageUrl === 'string' && typeof item.description === 'string'
  && typeof item.published === 'boolean')

const isSameProject = (project, reference) => project
  && project.id === reference.id
  && project.title === reference.title
  && project.category === reference.category
  && project.imageRef === reference.imageRef
  && project.imageUrl === reference.imageUrl
  && project.description === reference.description
  && project.published === reference.published
  && (project.featured === undefined || project.featured === reference.featured)

export function getPortfolioProjects({ publishedOnly = false } = {}) {
  const projects = readStored(PORTFOLIO_KEY, defaultProjects, validProjects)
  const isUnchangedPreviousPortfolio = projects.length === previousDefaultProjects.length
    && projects.every((project) => previousDefaultProjects.some((reference) => isSameProject(project, reference)))
  const isUnchangedInterimPortfolio = (projects.length === 3 || projects.length === 4)
    && projects.every((project) => {
      const reference = currentDefaultsById.get(project.id)
      return reference && isSameProject(project, reference)
    })
  const migratedProjects = isUnchangedPreviousPortfolio || isUnchangedInterimPortfolio
    ? defaultProjects
    : projects.flatMap((project) => {
      const previousDefault = previousDefaultProjects.find((item) => item.id === project.id)
      const isUnchangedDefault = previousDefault && isSameProject(project, previousDefault)
      if (!isUnchangedDefault) return [project]
      const currentDefault = currentDefaultsById.get(project.id)
      return currentDefault ? [currentDefault] : []
    })
  return (publishedOnly ? migratedProjects.filter((project) => project.published) : migratedProjects)
    .slice().sort((a, b) => a.title.localeCompare(b.title))
}

export function savePortfolioProject(project) {
  return savePortfolioProjects([project])[0]
}

export function savePortfolioProjects(updates) {
  if (!Array.isArray(updates) || !updates.length) return []
  const projects = getPortfolioProjects()
  const ids = new Set()
  const normalized = updates.map((project) => {
    if (!project || typeof project.title !== 'string' || !project.title.trim()
      || !PORTFOLIO_CATEGORIES.includes(project.category)
      || typeof project.description !== 'string' || !project.description.trim()) {
      throw new Error('Enter a project title, category and short description.')
    }
    const id = project.id || createDemoId('project')
    if (ids.has(id)) throw new Error('A photo was included more than once.')
    ids.add(id)
    const imageUrl = typeof project.imageUrl === 'string' ? project.imageUrl.trim() : ''
    if (imageUrl && !isUploadedImage(imageUrl) && !imageUrl.startsWith(INDEXED_DB_IMAGE_PREFIX)) {
      let url
      try {
        url = new URL(imageUrl)
      } catch {
        throw new Error('Enter a valid project image URL.')
      }
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Project image URLs must use HTTP or HTTPS.')
    }
    const current = projects.find((item) => item.id === id)
    return {
      id,
      title: project.title.trim(),
      category: project.category,
      imageRef: project.imageRef?.trim() || 'studio',
      imageUrl,
      description: project.description.trim(),
      published: Boolean(project.published),
      featured: typeof project.featured === 'boolean'
        ? project.featured
        : Boolean(current?.featured ?? ['1', '5'].includes(id)),
    }
  })
  const updatedById = new Map(normalized.map((project) => [project.id, project]))
  const existingIds = new Set(projects.map((project) => project.id))
  const result = [
    ...projects.map((project) => updatedById.get(project.id) || project),
    ...normalized.filter((project) => !existingIds.has(project.id)),
  ]
  writeStored(PORTFOLIO_KEY, result)
  return normalized
}

export function deletePortfolioProject(projectId) {
  const projects = getPortfolioProjects()
  if (!projects.some((project) => project.id === projectId)) throw new Error('This project could not be found.')
  writeStored(PORTFOLIO_KEY, projects.filter((project) => project.id !== projectId))
}
