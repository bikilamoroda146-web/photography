import {
  deletePortfolioProject, getPortfolioProjects, INDEXED_DB_IMAGE_PREFIX,
  savePortfolioProject, savePortfolioProjects,
} from './portfolioService'
import { createDemoId } from './demoStorage'

const DATABASE_NAME = 'sami-photo-library'
const DATABASE_VERSION = 1
const IMAGE_STORE = 'images'
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

let databasePromise

function openDatabase() {
  if (!globalThis.indexedDB) {
    return Promise.reject(new Error('Image storage is unavailable in this browser.'))
  }
  if (databasePromise) return databasePromise

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(IMAGE_STORE)) {
        request.result.createObjectStore(IMAGE_STORE, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => {
      const database = request.result
      database.onversionchange = () => {
        database.close()
        databasePromise = null
      }
      resolve(database)
    }
    request.onerror = () => {
      databasePromise = null
      reject(new Error('The photo library could not open browser image storage.'))
    }
    request.onblocked = () => {
      databasePromise = null
      reject(new Error('Close other Sami Photography tabs to allow image storage to update.'))
    }
  })
  return databasePromise
}

function runTransaction(mode, run) {
  return openDatabase().then((database) => new Promise((resolve, reject) => {
    let result
    let transaction
    try {
      transaction = database.transaction(IMAGE_STORE, mode)
      result = run(transaction.objectStore(IMAGE_STORE), transaction)
    } catch (error) {
      reject(error)
      return
    }
    transaction.oncomplete = () => resolve(result)
    transaction.onerror = () => reject(new Error('Browser image storage could not complete the request.'))
    transaction.onabort = () => reject(new Error('Browser image storage could not complete the request.'))
  }))
}

function readImage(id) {
  return runTransaction('readonly', (store) => new Promise((resolve, reject) => {
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result?.blob || null)
    request.onerror = () => reject(new Error('A saved photo could not be read from browser storage.'))
  }))
}

function writeImages(images) {
  return runTransaction('readwrite', (store) => {
    images.forEach(({ id, blob }) => store.put({ id, blob }))
  })
}

function removeImages(ids) {
  if (!ids.length) return Promise.resolve()
  return runTransaction('readwrite', (store) => {
    ids.forEach((id) => store.delete(id))
  })
}

async function validateImage(file) {
  if (!(file instanceof Blob) || !SUPPORTED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Choose a JPEG, PNG, or WebP image.')
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Each image must be smaller than 10 MB.')
  }
  if (!globalThis.createImageBitmap) {
    throw new Error('Image validation is not supported in this browser.')
  }
  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('The selected file is not a readable image.')
  } finally {
    bitmap?.close()
  }
}

function imageIdFromUrl(imageUrl) {
  return imageUrl.startsWith(INDEXED_DB_IMAGE_PREFIX)
    ? imageUrl.slice(INDEXED_DB_IMAGE_PREFIX.length)
    : ''
}

function photoRecord(project, imageBlob = null) {
  return {
    ...project,
    featured: typeof project.featured === 'boolean' ? project.featured : ['1', '5'].includes(project.id),
    imageBlob,
  }
}

export async function getPhotos({ publishedOnly = false } = {}) {
  const projects = getPortfolioProjects({ publishedOnly })
  return Promise.all(projects.map(async (project) => {
    const imageId = imageIdFromUrl(project.imageUrl)
    return photoRecord(project, imageId ? await readImage(imageId) : null)
  }))
}

export async function addPhotos(photos) {
  if (!Array.isArray(photos) || !photos.length) throw new Error('Choose at least one photo to add.')
  for (const photo of photos) {
    await validateImage(photo.file)
    if (!photo.title?.trim() || !photo.description?.trim()) {
      throw new Error('Enter a title and description for each photo.')
    }
  }

  const imageIds = photos.map(() => createDemoId('image'))
  await writeImages(photos.map(({ file }, index) => ({ id: imageIds[index], blob: file })))
  try {
    return savePortfolioProjects(photos.map((photo, index) => ({
      title: photo.title,
      description: photo.description,
      category: photo.category,
      published: photo.published,
      featured: photo.featured,
      imageRef: 'studio',
      imageUrl: `${INDEXED_DB_IMAGE_PREFIX}${imageIds[index]}`,
    })))
  } catch (error) {
    await removeImages(imageIds)
    throw error
  }
}

export async function addPhoto(photo) {
  const [saved] = await addPhotos([photo])
  return saved
}

export async function updatePhoto(photo) {
  if (!photo?.id || !photo.title?.trim() || !photo.description?.trim()) {
    throw new Error('Enter a photo title and description.')
  }
  const current = getPortfolioProjects().find((item) => item.id === photo.id)
  if (!current) throw new Error('This photo could not be found.')
  if (photo.file) await validateImage(photo.file)

  const newImageId = photo.file ? createDemoId('image') : ''
  if (photo.file) await writeImages([{ id: newImageId, blob: photo.file }])
  let saved
  try {
    saved = savePortfolioProject({
      ...current,
      ...photo,
      imageUrl: newImageId ? `${INDEXED_DB_IMAGE_PREFIX}${newImageId}` : current.imageUrl,
      imageRef: newImageId ? 'studio' : current.imageRef,
    })
  } catch (error) {
    if (newImageId) await removeImages([newImageId])
    throw error
  }

  const oldImageId = imageIdFromUrl(current.imageUrl)
  if (newImageId && oldImageId) await removeImages([oldImageId])
  return saved
}

export async function deletePhoto(photoId) {
  const project = getPortfolioProjects().find((item) => item.id === photoId)
  if (!project) throw new Error('This photo could not be found.')
  deletePortfolioProject(photoId)
  const imageId = imageIdFromUrl(project.imageUrl)
  if (imageId) await removeImages([imageId])
}
