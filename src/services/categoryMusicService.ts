import { getTemplateById } from '@/data/templates'
import { supabase } from './supabaseClient'

/** The places a preview song can be chosen for (Admin > Page music). */
export const CATEGORY_MUSIC_KEYS: { key: string; label: string }[] = [
  { key: 'wedding:white', label: 'White weddings' },
  { key: 'wedding:igbo', label: 'Igbo weddings' },
  { key: 'wedding:yoruba', label: 'Yoruba weddings' },
  { key: 'wedding:hausa', label: 'Hausa weddings' },
  { key: 'child-dedication', label: 'Child dedications' },
  { key: 'birthday', label: 'Birthdays' },
  { key: 'corporate', label: 'Corporate events' },
  { key: 'funeral', label: 'Funerals' },
]

export interface CategoryMusic {
  key: string
  trackId: string | null
  title: string | null
  url: string | null
}

interface Row {
  key: string
  track_id: string | null
  title: string | null
  url: string | null
}

const STORE_KEY = 'invytory:category-music'
let cache: Promise<Record<string, CategoryMusic>> | null = null

const toMusic = (r: Row): CategoryMusic => ({ key: r.key, trackId: r.track_id, title: r.title, url: r.url })

function stored(): Record<string, CategoryMusic> {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}') as Record<string, CategoryMusic>
  } catch {
    return {}
  }
}

/** Which setting a template uses: its wedding family, or its event type. */
export function musicKeyFor(templateId?: string): string | null {
  const t = getTemplateById(templateId)
  if (!t) return null
  if (t.category === 'wedding') return `wedding:${t.collection === 'universal' ? 'white' : t.collection}`
  return t.category
}

export const categoryMusicService = {
  all(): Promise<Record<string, CategoryMusic>> {
    if (!cache) {
      cache = (async () => {
        try {
          const { data, error } = await supabase.from('category_music').select('*')
          if (error) throw error
          const out = Object.fromEntries((data as Row[]).map((r) => [r.key, toMusic(r)]))
          try {
            localStorage.setItem(STORE_KEY, JSON.stringify(out))
          } catch {
            // fine
          }
          return out
        } catch {
          return stored()
        }
      })()
    }
    return cache
  },

  forget() {
    cache = null
  },

  async urlFor(templateId?: string): Promise<string | null> {
    const key = musicKeyFor(templateId)
    if (!key) return null
    return (await this.all())[key]?.url ?? null
  },

  /** Saves the chosen song for a key; null clears it. */
  async save(key: string, track: { id: string; title: string; url: string } | null): Promise<void> {
    const { error } = track
      ? await supabase.from('category_music').upsert({ key, track_id: track.id, title: track.title, url: track.url, updated_at: new Date().toISOString() })
      : await supabase.from('category_music').delete().eq('key', key)
    if (error) throw new Error(error.message)
    cache = null
  },
}
