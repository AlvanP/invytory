import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { musicService, type MusicTrack } from '@/services/musicService'
import { CATEGORY_MUSIC_KEYS, categoryMusicService, type CategoryMusic } from '@/services/categoryMusicService'

const field = 'w-full rounded-xs border border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none'

/** Admin: pick the song that plays while each category's templates are previewed on the website. */
export function AdminPageMusicTab() {
  const [tracks, setTracks] = useState<MusicTrack[] | null>(null)
  const [current, setCurrent] = useState<Record<string, CategoryMusic>>({})
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const audio = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    musicService.adminList().then(setTracks).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load the music.'))
    categoryMusicService.forget()
    categoryMusicService.all().then(setCurrent)
    return () => audio.current?.pause()
  }, [])

  async function choose(key: string, trackId: string) {
    setSaving(key)
    setError(null)
    try {
      const t = tracks?.find((x) => x.id === trackId)
      await categoryMusicService.save(key, t ? { id: t.id, title: t.title, url: t.url } : null)
      setCurrent((p) => {
        const n = { ...p }
        if (t) n[key] = { key, trackId: t.id, title: t.title, url: t.url }
        else delete n[key]
        return n
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save. Has docs/sql/pack46.sql been run?')
    } finally {
      setSaving(null)
    }
  }

  function toggle(key: string, url: string) {
    if (!audio.current) audio.current = new Audio()
    const a = audio.current
    if (playing === key) {
      a.pause()
      setPlaying(null)
      return
    }
    a.src = url
    void a.play()
    setPlaying(key)
    a.onended = () => setPlaying(null)
  }

  return (
    <div>
      <p className="mb-4 text-sm text-ink-soft">
        The song that plays on the website while a template of that category is being previewed. It stops when the visitor scrolls past, and visitors can mute it.
        Songs come from the Music tab.
      </p>
      {error && <p className="mb-3 rounded-xs bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <ul className="divide-y divide-ink/10 rounded-sm border border-ink/10 bg-white">
        {CATEGORY_MUSIC_KEYS.map(({ key, label }) => {
          const cur = current[key]
          return (
            <li key={key} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="w-44 text-sm font-medium text-ink">{label}</span>
              <select className={field + ' !w-auto min-w-56 flex-1'} disabled={!tracks || saving === key} value={cur?.trackId ?? ''} onChange={(e) => void choose(key, e.target.value)}>
                <option value="">No music</option>
                {(tracks ?? []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                    {t.artistCredit ? ` · ${t.artistCredit}` : ''}
                  </option>
                ))}
              </select>
              {cur?.url && (
                <button type="button" onClick={() => toggle(key, cur.url as string)} aria-label="Preview the song" className="text-gold-deep">
                  {playing === key ? <Pause className="size-5" /> : <Play className="size-5" />}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
