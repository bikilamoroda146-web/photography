const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024

export const isUploadedImage = (value) => /^data:image\/webp;base64,/i.test(value)

export async function prepareImageUpload(file, maxDimension = 1200) {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Choose a JPEG, PNG, or WebP image.')
  }
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    throw new Error('Choose an image smaller than 10 MB.')
  }
  if (!globalThis.createImageBitmap) {
    throw new Error('Image uploads are not supported in this browser.')
  }

  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Image processing is unavailable in this browser.')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result)
        else reject(new Error('The selected image could not be processed.'))
      }, 'image/webp', 0.8)
    })
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('The selected image could not be read.'))
      reader.onerror = () => reject(new Error('The selected image could not be read.'))
      reader.readAsDataURL(blob)
    })
  } finally {
    bitmap.close()
  }
}
