import { createDemoId } from './demoStorage'

const DATABASE_NAME = 'sami-customer-profile-images'
const DATABASE_VERSION = 1
const IMAGE_STORE = 'images'

let databasePromise

function openDatabase() {
  if (!globalThis.indexedDB) {
    return Promise.reject(new Error('Profile image storage is unavailable in this browser.'))
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
      reject(new Error('Profile image storage could not be opened.'))
    }
    request.onblocked = () => {
      databasePromise = null
      reject(new Error('Close other Sami Photography tabs to allow profile image storage to update.'))
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
      result = run(transaction.objectStore(IMAGE_STORE))
    } catch (error) {
      reject(error)
      return
    }
    transaction.oncomplete = () => resolve(result)
    transaction.onerror = () => reject(new Error('Profile image storage could not complete the request.'))
    transaction.onabort = () => reject(new Error('Profile image storage could not complete the request.'))
  }))
}

export function saveCustomerImage(blob) {
  if (!(blob instanceof Blob) || !['image/jpeg', 'image/png', 'image/webp'].includes(blob.type)) {
    return Promise.reject(new Error('Choose a valid JPEG, PNG, or WebP profile image.'))
  }
  if (blob.size > 2 * 1024 * 1024) {
    return Promise.reject(new Error('The processed profile image must be smaller than 2 MB.'))
  }
  const id = createDemoId('customer-image')
  return runTransaction('readwrite', (store) => {
    store.put({ id, blob })
    return id
  })
}

export function getCustomerImage(id) {
  if (!id) return Promise.resolve(null)
  return runTransaction('readonly', (store) => new Promise((resolve, reject) => {
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result?.blob || null)
    request.onerror = () => reject(new Error('The saved profile image could not be read.'))
  }))
}

export function deleteCustomerImage(id) {
  if (!id) return Promise.resolve()
  return runTransaction('readwrite', (store) => store.delete(id))
}
