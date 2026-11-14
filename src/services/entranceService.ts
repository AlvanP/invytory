import { supabase } from './supabaseClient'

/** When the invitation music starts: on the tap, after the entrance, when the invitation shows, or N seconds after the tap. */
export type MusicStart = 'tap' | 'end' | 'content' | `after:${number}`

export interface EntranceSetting {
  templateId: string
  videoUrl: string | null
  videoPath: string | null
  musicStart: MusicStart
  muted: boolean
  /** Seconds into the video when the couple's names appear. */
  namesAt: number | null
  namesColor: string | null
}

interface Row {
  template_id: string
  video_url: string | null
  video_path: string | null
  music_start: string
  muted: boolean
  names_at: number | null
  names_color: string | null
}

const BUCKET = 'entrance-videos'
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024

export const DEFAULT_SETTING = (templateId: string): EntranceSetting => ({
  templateId,
  videoUrl: null,
  videoPath: null,
  musicStart: 'tap',
  muted: false,
  namesAt: null,
  namesColor: null,
})

function toSetting(r: Row): EntranceSetting {
  return {
    templateId: r.template_id,
    videoUrl: r.video_url,
    videoPath: r.video_path,
    musicStart: (r.music_start as MusicStart) || 'tap',
    muted: r.muted,
    namesAt: r.names_at === null ? null : Number(r.names_at),
    namesColor: r.names_color,
  }
}

/** Parses 'after:3' into 3 (null for the other modes). */
export function musicDelaySeconds(m: MusicStart): number | null {
  return m.startsWith('after:') ? Number(m.slice(6)) || 0 : null
}

let cache: Promise<Record<string, EntranceSetting>> | null = null
const STORE_KEY = 'invytory:entrances'

/** The settings seen on this device's last visit, so a reload needs no waiting at all. */
export function cachedSettings(): Record<string, EntranceSetting> | null {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, EntranceSetting>) : null
  } catch {
    return null
  }
}

/** The first frame of a video is stored beside it as a small picture with the same name. */
export const posterUrl = (videoUrl: string) => videoUrl.replace(/\.(mp4|webm)(\?.*)?$/i, '.jpg')

/** Grabs a still from the video (about a tenth of a second in) as a small JPEG. */
async function makePoster(file: File): Promise<Blob | null> {
  const url = URL.createObjectURL(file)
  try {
    const v = document.createElement('video')
    v.muted = true
    v.playsInline = true
    v.preload = 'auto'
    v.src = url
    await new Promise<void>((res, rej) => {
      v.onloadeddata = () => res()
      v.onerror = () => rej(new Error('video'))
      window.setTimeout(() => rej(new Error('timeout')), 8000)
    })
    v.currentTime = 0.1
    await new Promise<void>((res) => {
      v.onseeked = () => res()
      window.setTimeout(res, 1500)
    })
    const w = Math.min(720, v.videoWidth)
    const h = Math.round((w * v.videoHeight) / v.videoWidth)
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    c.getContext('2d')?.drawImage(v, 0, 0, w, h)
    return await new Promise<Blob | null>((res) => c.toBlob(res, 'image/jpeg', 0.78))
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

function fail(error: { message?: string }): never {
  throw new Error(error.message || 'Something went wrong. Please try again.')
}

export const entranceService = {
  /** Every template's entrance settings, read once per visit. A failure just means "use the built-in entrances". */
  all(): Promise<Record<string, EntranceSetting>> {
    if (!cache) {
      const load = (async () => {
        const { data, error } = await supabase.from('entrance_settings').select('*')
        if (error) throw error
        const out = Object.fromEntries((data as Row[]).map((r) => [r.template_id, toSetting(r)]))
        try {
          localStorage.setItem(STORE_KEY, JSON.stringify(out))
        } catch {
          // storage unavailable: fine
        }
        return out
      })()
      // Never make a guest wait: after 2.5s use what this device last saw (or the built-in entrances).
      const slow = new Promise<Record<string, EntranceSetting>>((res) => window.setTimeout(() => res(cachedSettings() ?? {}), 2500))
      const p: Promise<Record<string, EntranceSetting>> = Promise.race([load, slow]).catch(() => cachedSettings() ?? {})
      cache = p
    }
    return cache
  },

  forget() {
    cache = null
  },

  async save(setting: EntranceSetting): Promise<void> {
    const { error } = await supabase.from('entrance_settings').upsert({
      template_id: setting.templateId,
      video_url: setting.videoUrl,
      video_path: setting.videoPath,
      music_start: setting.musicStart,
      muted: setting.muted,
      names_at: setting.namesAt,
      names_color: setting.namesColor,
      updated_at: new Date().toISOString(),
    })
    if (error) fail(error)
    cache = null
  },

  /** Uploads a video for a template (replacing any earlier one) and returns the updated setting. */
  async uploadVideo(current: EntranceSetting, file: File): Promise<EntranceSetting> {
    if (file.size > MAX_VIDEO_BYTES) throw new Error('That video is over 50 MB. Compress it first.')
    const ext = file.name.toLowerCase().endsWith('.webm') ? 'webm' : 'mp4'
    const path = `${current.templateId}-${Date.now()}.${ext}`
    const up = await supabase.storage.from(BUCKET).upload(path, file, { contentType: ext === 'webm' ? 'video/webm' : 'video/mp4', cacheControl: '31536000' })
    if (up.error) fail(up.error)
    const poster = await makePoster(file)
    if (poster) await supabase.storage.from(BUCKET).upload(path.replace(/\.(mp4|webm)$/, '.jpg'), poster, { contentType: 'image/jpeg', cacheControl: '31536000' })
    const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
    const next = { ...current, videoUrl: url, videoPath: path }
    await this.save(next)
    if (current.videoPath) await supabase.storage.from(BUCKET).remove([current.videoPath, current.videoPath.replace(/\.(mp4|webm)$/, '.jpg')])
    return next
  },

  /** Deletes the video. The template goes back to its built-in entrance. Other settings are kept. */
  async deleteVideo(current: EntranceSetting): Promise<EntranceSetting> {
    if (current.videoPath) await supabase.storage.from(BUCKET).remove([current.videoPath, current.videoPath.replace(/\.(mp4|webm)$/, '.jpg')])
    const next = { ...current, videoUrl: null, videoPath: null }
    await this.save(next)
    return next
  },
}
