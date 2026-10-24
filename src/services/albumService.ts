import { supabase } from './supabaseClient'

const BUCKET = 'guest-album'
/** Largest original we accept. Matches the bucket limit in docs/sql/album.sql. */
export const ALBUM_MAX_BYTES = 30 * 1024 * 1024
const THUMB_EDGE = 560
const KEY_STORAGE = 'invytory:album-key'
const MINE_STORAGE = 'invytory:album-mine'

const memoryKey = crypto.randomUUID() + crypto.randomUUID()

/** A private code that lives only in this guest's browser. It proves "I added this photo". */
function deviceKey(): string {
  try {
    let key = window.localStorage.getItem(KEY_STORAGE)
    if (!key) {
      key = crypto.randomUUID() + crypto.randomUUID()
      window.localStorage.setItem(KEY_STORAGE, key)
    }
    return key
  } catch {
    return memoryKey
  }
}

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

let memoryMine: string[] = []
function readMine(): string[] {
  try {
    const raw = window.localStorage.getItem(MINE_STORAGE)
    const list = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return memoryMine
  }
}
function writeMine(list: string[]) {
  memoryMine = list
  try {
    window.localStorage.setItem(MINE_STORAGE, JSON.stringify(list.slice(-500)))
  } catch {
    // kept in memory for this visit
  }
}

export interface AlbumPhoto {
  id: string
  weddingId: string
  url: string
  thumbUrl: string
  path: string
  thumbPath: string | null
  uploaderName: string | null
  sizeBytes: number | null
  createdAt: string
}

interface AlbumRow {
  id: string
  wedding_id: string
  path: string
  thumb_path: string | null
  uploader_name: string | null
  size_bytes: number | null
  created_at: string
}

function publicUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

function toPhoto(r: AlbumRow): AlbumPhoto {
  const url = publicUrl(r.path)
  return {
    id: r.id,
    weddingId: r.wedding_id,
    url,
    thumbUrl: r.thumb_path ? publicUrl(r.thumb_path) : url,
    path: r.path,
    thumbPath: r.thumb_path,
    uploaderName: r.uploader_name,
    sizeBytes: r.size_bytes,
    createdAt: r.created_at,
  }
}

const TYPES_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
}

function extensionOf(file: File): string {
  const parts = file.name.toLowerCase().split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}

function describeError(err: unknown): string {
  const raw = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : String(err)
  const lower = raw.toLowerCase()
  if (lower.includes('load failed') || lower.includes('failed to fetch') || lower.includes('network') || lower.includes('timed out')) {
    return 'Connection dropped. Check your internet and tap to try again.'
  }
  if (lower.includes('row-level security') || lower.includes('unauthorized') || lower.includes('not authorized')) {
    return 'The album is not open for new photos right now. It opens on the day of the event.'
  }
  if (lower.includes('exceeded') || lower.includes('too large') || lower.includes('payload')) {
    return 'That photo is too large to upload.'
  }
  return raw
}

/** A small preview for the grid. Returns null when the browser cannot read the format. */
async function makeThumb(file: File): Promise<Blob | null> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, THUMB_EDGE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return null
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8))
  } catch {
    return null
  }
}

async function uploadWithRetry(path: string, body: Blob, contentType: string): Promise<void> {
  let lastError: unknown = null
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await supabase.storage.from(BUCKET).upload(path, body, { cacheControl: '31536000', upsert: false, contentType })
    if (!error) return
    lastError = error
    const lower = String(error.message ?? '').toLowerCase()
    // The file may have arrived even though the answer was lost.
    if (lower.includes('already exists') || lower.includes('duplicate')) return
    const network = lower.includes('load failed') || lower.includes('failed to fetch') || lower.includes('network')
    if (!network) break
    await new Promise((r) => window.setTimeout(r, 1000 * (attempt + 1)))
  }
  throw new Error(describeError(lastError))
}

export const albumService = {
  validate(file: File): string | null {
    const ext = extensionOf(file)
    const okType = file.type.startsWith('image/') || !!TYPES_BY_EXTENSION[ext]
    if (!okType) return 'Only photos can be added.'
    if (file.size === 0) return 'That file looks empty.'
    if (file.size > ALBUM_MAX_BYTES) return `That photo is ${(file.size / 1048576).toFixed(0)} MB. The limit is 30 MB.`
    return null
  },

  /** Newest first. Works for guests (open albums) and for the owner. */
  async list(weddingId: string, limit = 120, offset = 0): Promise<AlbumPhoto[]> {
    const { data, error } = await supabase
      .from('album_photos')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) throw new Error(describeError(error))
    return (data as AlbumRow[]).map(toPhoto)
  },

  async count(weddingId: string): Promise<number> {
    const { count, error } = await supabase
      .from('album_photos')
      .select('id', { count: 'exact', head: true })
      .eq('wedding_id', weddingId)
    if (error) throw new Error(describeError(error))
    return count ?? 0
  },

  /** Uploads the original at full quality plus a small preview, then records it. */
  async upload(weddingId: string, file: File, uploaderName: string): Promise<string> {
    const problem = albumService.validate(file)
    if (problem) throw new Error(problem)

    const ext = TYPES_BY_EXTENSION[extensionOf(file)] ? extensionOf(file) : 'jpg'
    const contentType = TYPES_BY_EXTENSION[ext]
    const id = crypto.randomUUID()
    const path = `${weddingId}/${id}.${ext}`

    let thumbPath: string | null = null
    const thumb = await makeThumb(file)
    if (thumb) {
      const candidate = `${weddingId}/thumb/${id}.jpg`
      try {
        await uploadWithRetry(candidate, thumb, 'image/jpeg')
        thumbPath = candidate
      } catch {
        thumbPath = null
      }
    }

    // Copy into memory first: avoids "Load failed" on phones for photos picked from the cloud.
    let body: Blob = file
    try {
      body = new Blob([await file.arrayBuffer()], { type: contentType })
    } catch {
      body = file
    }
    await uploadWithRetry(path, body, contentType)

    const row: Record<string, unknown> = {
      id,
      wedding_id: weddingId,
      path,
      thumb_path: thumbPath,
      uploader_name: uploaderName.trim().slice(0, 60) || null,
      size_bytes: file.size,
    }
    let uploaderKey: string | null = null
    try {
      uploaderKey = await sha256Hex(deviceKey())
    } catch {
      uploaderKey = null
    }
    let { error } = await supabase.from('album_photos').insert(uploaderKey ? { ...row, uploader_key: uploaderKey } : row)
    // Safety net: if the database has not been updated yet, still save the photo (without self-delete).
    if (error && uploaderKey && String(error.message ?? '').toLowerCase().includes('uploader_key')) {
      uploaderKey = null
      ;({ error } = await supabase.from('album_photos').insert(row))
    }
    if (error) {
      console.error('[album] insert failed:', error)
      throw new Error(describeError(error))
    }
    if (uploaderKey) writeMine([...readMine(), id])
    return id
  },

  /** Photos this guest added from this phone or browser. */
  mine(): Set<string> {
    return new Set(readMine())
  },

  /** A guest removes a photo they added themselves (checked in the database with their private code). */
  async removeOwn(photo: AlbumPhoto): Promise<void> {
    const key = await sha256Hex(deviceKey())
    const { data, error } = await supabase.rpc('album_guest_delete', { photo_id: photo.id, key_hash: key })
    if (error) throw new Error(describeError(error))
    const rows = (data ?? []) as Array<{ path: string; thumb_path: string | null }>
    if (rows.length === 0) throw new Error('Could not remove it. It may already be gone, or it was added from another phone.')
    const paths = rows.flatMap((r) => [r.path, ...(r.thumb_path ? [r.thumb_path] : [])])
    await supabase.storage.from(BUCKET).remove(paths)
    writeMine(readMine().filter((x) => x !== photo.id))
  },

  /** Owner only. */
  async remove(photo: AlbumPhoto): Promise<void> {
    const { data, error } = await supabase.from('album_photos').delete().eq('id', photo.id).select('id')
    if (error) throw new Error(describeError(error))
    if (!data || data.length === 0) throw new Error('Could not delete: not found, or you are not the owner.')
    writeMine(readMine().filter((x) => x !== photo.id))
    const paths = [photo.path, ...(photo.thumbPath ? [photo.thumbPath] : [])]
    await supabase.storage.from(BUCKET).remove(paths)
  },
}
