import { PROJECTS } from '../data/data'
import { readStored, writeStored, createDemoId } from './demoStorage'

const PORTFOLIO_KEY = 'sami_demo_portfolio_v1'
export const PORTFOLIO_CATEGORIES = [
  'Portraits',
  'Weddings',
  'Events',
  'Landscapes',
  'Product Photography',
  'Other Projects',
]

const defaultProjects = PROJECTS.map((project) => ({
  id: String(project.id),
  title: project.title,
  category: project.cat === 'Products' ? 'Product Photography' : project.cat,
  imageRef: project.k,
  imageUrl: '',
  description: project.desc,
  published: true,
}))

const validProjects = (value) => Array.isArray(value) && value.every((item) => item
  && typeof item.id === 'string' && typeof item.title === 'string'
  && typeof item.category === 'string' && typeof item.imageRef === 'string'
  && typeof item.imageUrl === 'string' && typeof item.description === 'string'
  && typeof item.published === 'boolean')

export function getPortfolioProjects({ publishedOnly = false } = {}) {
  const projects = readStored(PORTFOLIO_KEY, defaultProjects, validProjects)
  return (publishedOnly ? projects.filter((project) => project.published) : projects)
    .slice().sort((a, b) => a.title.localeCompare(b.title))
}

export function savePortfolioProject(project) {
  if (!project || typeof project.title !== 'string' || !project.title.trim()
    || !PORTFOLIO_CATEGORIES.includes(project.category)
    || typeof project.description !== 'string' || !project.description.trim()) {
    throw new Error('Enter a project title, category and short description.')
  }
  const projects = getPortfolioProjects()
  const imageUrl = typeof project.imageUrl === 'string' ? project.imageUrl.trim() : ''
  if (imageUrl) {
    let url
    try {
      url = new URL(imageUrl)
    } catch {
      throw new Error('Enter a valid project image URL.')
    }
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Project image URLs must use HTTP or HTTPS.')
  }
  const normalized = {
    id: project.id || createDemoId('project'),
    title: project.title.trim(),
    category: project.category,
    imageRef: project.imageRef?.trim() || 'studio',
    imageUrl,
    description: project.description.trim(),
    published: Boolean(project.published),
  }
  writeStored(PORTFOLIO_KEY, project.id
    ? projects.map((item) => item.id === project.id ? normalized : item)
    : [...projects, normalized])
  return normalized
}

export function deletePortfolioProject(projectId) {
  const projects = getPortfolioProjects()
  if (!projects.some((project) => project.id === projectId)) throw new Error('This project could not be found.')
  writeStored(PORTFOLIO_KEY, projects.filter((project) => project.id !== projectId))
}
