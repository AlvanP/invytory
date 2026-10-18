import type { TemplateCollection } from '@/types'
import { supabase } from './supabaseClient'
import {
  MUSIC_MAX_BYTES,
  MUSIC_TYPES_BY_EXTENSION,
  formatMusicMegabytes,
} from '@/utils/musicLimits'

const UPLOAD_BUCKET = 'invitation-music'

/** A track in the library you (the owner) provide. */
export interface MusicTrack {
  id: string
  title: string
  artistCredit?: string
  collection: TemplateCollection
  mood?: string
  url: string
  durationSeconds?: number
}

interface MusicTrackRow {
  id: string
  title: string
  artist_credit: string | null
  collection: TemplateCollection
  mood: string | null
  url: string
  duration_seconds: number | null
}

/** What a successful upload gives back. */
export interface UploadedMusic {
  url: string
  /** Defaults to the file name without its extension. */
  title: string
  /** null when the browser could not read the length. */
  durationSeconds: number | null
}

function extensionOf(file: File): string {
  const parts = file.name.toLowerCase().split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}

function titleFromFileName(name: string): string {
  const withoutExtension = name.replace(/\.[^.]+$/, '')
  return withoutExtension.replace(/[_-]+/g, ' ').trim() || 'My music'
}

/** Turns a storage / network error into words a person can act on. */
function describeMusicUploadError(err: unknown): string {
  const raw =
    err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : String(err)
  const lower = raw.toLowerCase()

  if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('load failed') || lower.includes('timed out') || lower.includes('aborted') || lower.includes('connection')) {
    return 'The connection dropped during upload. Stay on this page, check your internet and try again.'
  }
  if (lower.includes('exceeded') || lower.includes('too large') || lower.includes('payload')) {
    return `That file is too large. The limit is ${formatMusicMegabytes(MUSIC_MAX_BYTES)}.`
  }
  if (lower.includes('mime') || lower.includes('not supported')) {
    return 'That file type is not allowed. Please use an MP3 or M4A file.'
  }
  if (lower.includes('row-level security') || lower.includes('unauthorized')) {
    return `Storage refused the upload (permissions). Details: ${raw}`
  }
  if (lower.includes('bucket not found')) {
    return `The music storage area is not set up yet. Details: ${raw}`
  }
  return raw
}

export const musicService = {
  /** Every active library track, in the order you set with sort_order. */
  async listLibrary(): Promise<MusicTrack[]> {
    const { data, error } = await supabase
      .from('music_tracks')
      .select('id, title, artist_credit, collection, mood, url, duration_seconds')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true })
    if (error) {
      console.error('[music] could not load library:', error)
      throw new Error(error.message || 'Could not load the music library.')
    }
    return (data as MusicTrackRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      artistCredit: row.artist_credit ?? undefined,
      collection: row.collection,
      mood: row.mood ?? undefined,
      url: row.url,
      durationSeconds: row.duration_seconds ?? undefined,
    }))
  },

  /** Returns a message if the file can't be used, or null if it is fine. */
  validateFile(file: File): string | null {
    const extension = extensionOf(file)
    if (!MUSIC_TYPES_BY_EXTENSION[extension]) {
      return 'Please choose an MP3 or M4A file.'
    }
    if (file.size > MUSIC_MAX_BYTES) {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1)
      return `That file is ${sizeInMb} MB. The limit is ${formatMusicMegabytes(MUSIC_MAX_BYTES)}.`
    }
    if (file.size === 0) {
      return 'That file looks empty. Please choose another.'
    }
    return null
  },

  /** Reads a file's length in seconds without uploading it. null if unreadable. */
  readDuration(file: File): Promise<number | null> {
    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(file)
      const audio = new Audio()
      let settled = false

      function finish(value: number | null) {
        if (settled) return
        settled = true
        window.clearTimeout(timer)
        audio.removeAttribute('src')
        audio.load()
        URL.revokeObjectURL(objectUrl)
        resolve(value)
      }

      // Some browsers never report metadata for formats they dislike.
      const timer = window.setTimeout(() => finish(null), 5000)
      audio.preload = 'metadata'
      audio.onloadedmetadata = () =>
        finish(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null)
      audio.onerror = () => finish(null)
      audio.src = objectUrl
    })
  },

  /** Checks, then uploads a couple's own music file and returns its public URL. */
  async uploadMusic(file: File): Promise<UploadedMusic> {
    const problem = musicService.validateFile(file)
    if (problem) throw new Error(problem)

    const extension = extensionOf(file)
    const contentType = MUSIC_TYPES_BY_EXTENSION[extension]
    const path = `uploads/${crypto.randomUUID()}.${extension}`

    const durationSeconds = await musicService.readDuration(file)

    // Read the song into memory first. On iPhones a file picked from Files or
    // iCloud can fail mid-upload with "Load failed" if it is streamed straight
    // from the picker; an in-memory copy avoids that.
    let body: Blob = file
    try {
      body = new Blob([await file.arrayBuffer()], { type: contentType })
    } catch {
      body = file
    }

    let error: { message?: string } | null = null
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = await supabase.storage.from(UPLOAD_BUCKET).upload(path, body, {
        cacheControl: '31536000',
        upsert: attempt > 0,
        contentType,
      })
      error = result.error
      if (!error) break
      const lower = String(error.message ?? '').toLowerCase()
      const looksLikeNetwork = lower.includes('load failed') || lower.includes('failed to fetch') || lower.includes('network')
      if (!looksLikeNetwork) break
      await new Promise((r) => window.setTimeout(r, 1000 * (attempt + 1)))
    }
    if (error) {
      console.error('[music] upload failed:', error)
      throw new Error(describeMusicUploadError(error))
    }

    const { data } = supabase.storage.from(UPLOAD_BUCKET).getPublicUrl(path)
    return {
      url: data.publicUrl,
      title: titleFromFileName(file.name),
      durationSeconds,
    }
  },
}
