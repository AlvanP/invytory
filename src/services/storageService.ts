import { supabase } from './supabaseClient'

const BUCKET = 'invitation-photos'

/** Longest edge, in pixels, of an uploaded photo. Plenty for a phone or desktop screen. */
const MAX_EDGE = 1920
const JPEG_QUALITY = 0.85
/** Hard cap on what we will try to upload, after shrinking. */
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

const SHRINKABLE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Shrinks a large photo in the browser before upload. Phone photos are
 * often 5–10 MB, which is slow and unreliable on mobile data. If anything
 * goes wrong (unsupported format, old browser) the original file is
 * returned untouched, so shrinking can never block an upload.
 */
async function shrinkImage(file: File): Promise<Blob> {
  if (!SHRINKABLE_TYPES.includes(file.type)) return file
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    // Already small enough: keep the original bytes.
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) {
      bitmap.close()
      return file
    }
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return file
    }
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
    )
    return blob && blob.size < file.size ? blob : file
  } catch {
    return file
  }
}

/** Turns a Supabase / network error into a message a person can act on. */
function describeUploadError(err: unknown): string {
  const raw =
    err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : String(err)
  const lower = raw.toLowerCase()

  if (lower.includes('failed to fetch') || lower.includes('network')) {
    return 'The connection dropped during upload. Check your internet and try again.'
  }
  if (lower.includes('row-level security') || lower.includes('unauthorized') || lower.includes('not authorized')) {
    return `Storage refused the upload (permissions). Details: ${raw}`
  }
  if (lower.includes('bucket not found')) {
    return `Storage bucket "${BUCKET}" was not found. Details: ${raw}`
  }
  if (lower.includes('exceeded') || lower.includes('too large') || lower.includes('payload')) {
    return `That photo is too large for storage. Try a smaller one. Details: ${raw}`
  }
  if (lower.includes('mime') || lower.includes('not supported')) {
    return `That file type isn't allowed. Please use a JPG or PNG. Details: ${raw}`
  }
  return raw
}

/** Uploads a photo to Supabase Storage and returns its public URL. */
export const storageService = {
  async uploadImage(file: File, folder: 'hero' | 'gallery'): Promise<string> {
    const body = await shrinkImage(file)
    if (body.size > MAX_UPLOAD_BYTES) {
      throw new Error('That photo is larger than 8 MB. Please choose a smaller one.')
    }

    const contentType = body.type || file.type || 'image/jpeg'
    const ext =
      contentType === 'image/png' ? 'png'
      : contentType === 'image/webp' ? 'webp'
      : contentType === 'image/jpeg' ? 'jpg'
      : (file.name.split('.').pop() || 'jpg').toLowerCase()
    const fileName = `${folder}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage.from(BUCKET).upload(fileName, body, {
      cacheControl: '3600',
      upsert: false,
      contentType,
    })
    if (error) {
      // Kept in the browser console so it can be copied when reporting a bug.
      console.error('[storage] upload failed:', error)
      throw new Error(describeUploadError(error))
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
    return data.publicUrl
  },
}