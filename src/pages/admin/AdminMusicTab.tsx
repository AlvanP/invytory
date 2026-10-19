import { useCallback, useEffect, useRef, useState } from 'react'
import { Eye, EyeOff, Loader2, Pause, Pencil, Play, Trash2, Upload } from 'lucide-react'
import { musicService, type MusicTrack } from '@/services/musicService'
import { EVENT_KINDS, eventCopy, type EventKind } from '@/templates/events'
import { COLLECTION_LABELS } from '@/utils/templateCollections'
import { formatDuration } from '@/utils/musicLimits'
import type { TemplateCollection } from '@/types'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const WEDDING_SUBS: TemplateCollection[] = ['white', 'igbo', 'yoruba', 'hausa', 'universal']
const field = 'w-full rounded-xs border border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none'

const kindLabel = (k: EventKind) => eventCopy[k]?.label ?? k

/** Admin: add, hide, edit and delete the songs offered in the create wizard. */
export function AdminMusicTab() {
  const [tracks, setTracks] = useState<MusicTrack[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<EventKind | 'all'>('all')

  // add form
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [mood, setMood] = useState('')
  const [category, setCategory] = useState<EventKind>('wedding')
  const [sub, setSub] = useState<TemplateCollection>('universal')
  const [saving, setSaving] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  // edit + preview
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState({ title: '', artistCredit: '', mood: '', category: 'wedding' as EventKind, collection: 'universal' as TemplateCollection })
  const [playing, setPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const load = useCallback(async () => {
    try {
      setTracks(await musicService.adminList())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the library.')
      setTracks([])
    }
  }, [])
  useEffect(() => {
    void load()
    return () => audioRef.current?.pause()
  }, [load])

  function togglePlay(t: MusicTrack) {
    audioRef.current?.pause()
    if (playing === t.id) {
      setPlaying(null)
      return
    }
    const a = new Audio(t.url)
    audioRef.current = a
    a.onended = () => setPlaying(null)
    a.onerror = () => {
      setPlaying(null)
      setError('That file could not be played.')
    }
    void a.play().then(() => setPlaying(t.id)).catch(() => setPlaying(null))
  }

  async function add() {
    if (!file) return setError('Choose an MP3 or M4A file first.')
    setError(null)
    setSaving(true)
    try {
      await musicService.adminAdd(file, { title, artistCredit: artist, mood, category, collection: sub })
      setFile(null)
      setTitle('')
      setArtist('')
      setMood('')
      if (fileInput.current) fileInput.current.value = ''
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add the track.')
    } finally {
      setSaving(false)
    }
  }

  async function run(fn: () => Promise<void>) {
    setError(null)
    try {
      await fn()
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    }
  }

  const shown = (tracks ?? []).filter((t) => filter === 'all' || t.category === filter)
  const groups = new Map<string, MusicTrack[]>()
  for (const t of shown) {
    const key = t.category === 'wedding' ? `${kindLabel('wedding')} · ${COLLECTION_LABELS[t.collection]}` : kindLabel(t.category)
    groups.set(key, [...(groups.get(key) ?? []), t])
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-sm border border-ink/10 bg-white p-5">
        <h2 className="font-display text-lg">Add a song</h2>
        <p className="mt-1 text-xs text-ink-soft">
          It appears in the Photos &amp; music step for that kind of event. Weddings are split by ceremony, so a Yoruba
          wedding sees Yoruba songs first.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-ink-soft">
            Category
            <select
              className={cn(field, 'mt-1')}
              value={category}
              onChange={(e) => {
                const k = e.target.value as EventKind
                setCategory(k)
                if (k !== 'wedding') setSub('universal')
              }}
            >
              {EVENT_KINDS.map((k) => (
                <option key={k} value={k}>{kindLabel(k)}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-ink-soft">
            Sub-category
            <select className={cn(field, 'mt-1')} value={category === 'wedding' ? sub : 'universal'} disabled={category !== 'wedding'} onChange={(e) => setSub(e.target.value as TemplateCollection)}>
              {(category === 'wedding' ? WEDDING_SUBS : (['universal'] as TemplateCollection[])).map((c) => (
                <option key={c} value={c}>{category === 'wedding' ? COLLECTION_LABELS[c] : 'All ' + kindLabel(category).toLowerCase() + ' invitations'}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-ink-soft">
            Title
            <input className={cn(field, 'mt-1')} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Song name" />
          </label>
          <label className="text-xs text-ink-soft">
            Artist or credit (optional)
            <input className={cn(field, 'mt-1')} value={artist} onChange={(e) => setArtist(e.target.value)} />
          </label>
          <label className="text-xs text-ink-soft sm:col-span-2">
            Mood (optional, e.g. Romantic, Joyful)
            <input className={cn(field, 'mt-1')} value={mood} onChange={(e) => setMood(e.target.value)} />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xs border border-ink/15 px-4 py-2.5 text-sm hover:border-gold">
            <Upload className="size-4 text-gold" />
            {file ? file.name : 'Choose MP3 or M4A'}
            <input
              ref={fileInput}
              type="file"
              className="hidden"
              accept=".mp3,.m4a,.aac,audio/mpeg,audio/mp4,audio/x-m4a,audio/aac"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null
                setFile(f)
                if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim())
              }}
            />
          </label>
          <Button type="button" onClick={() => void add()} disabled={saving || !file}>
            {saving ? 'Uploading…' : 'Add to library'}
          </Button>
        </div>
        <p className="mt-2 text-xs text-ink-soft/70">Up to 20 MB. Use only music you own or have licensed.</p>
      </section>

      {error && <p className="text-sm text-danger">{error}</p>}

      <section>
        <div className="mb-4 flex flex-wrap gap-2">
          {(['all', ...EVENT_KINDS] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={cn('rounded-full border px-3 py-1 text-xs', filter === k ? 'border-wine bg-wine text-ivory' : 'border-ink/15 text-ink-soft hover:text-ink')}
            >
              {k === 'all' ? 'All' : kindLabel(k)}
            </button>
          ))}
        </div>
        {!tracks && <p className="flex items-center gap-2 text-sm text-ink-soft"><Loader2 className="size-4 animate-spin" /> Loading…</p>}
        {tracks && shown.length === 0 && <p className="text-sm text-ink-soft">No songs here yet. Add one above.</p>}
        <div className="flex flex-col gap-6">
          {[...groups.entries()].map(([name, list]) => (
            <div key={name}>
              <h3 className="mb-2 text-sm font-medium text-ink">{name} <span className="text-ink-soft">({list.length})</span></h3>
              <ul className="flex flex-col gap-2">
                {list.map((t) => (
                  <li key={t.id} className={cn('rounded-sm border border-ink/10 bg-white px-3 py-2', !t.isActive && 'opacity-60')}>
                    {editing === t.id ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input className={field} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} aria-label="Title" />
                        <input className={field} value={draft.artistCredit} onChange={(e) => setDraft({ ...draft, artistCredit: e.target.value })} placeholder="Artist" aria-label="Artist" />
                        <input className={field} value={draft.mood} onChange={(e) => setDraft({ ...draft, mood: e.target.value })} placeholder="Mood" aria-label="Mood" />
                        <select className={field} value={draft.category} aria-label="Category" onChange={(e) => { const k = e.target.value as EventKind; setDraft({ ...draft, category: k, collection: k === 'wedding' ? draft.collection : 'universal' }) }}>
                          {EVENT_KINDS.map((k) => <option key={k} value={k}>{kindLabel(k)}</option>)}
                        </select>
                        <select className={field} value={draft.category === 'wedding' ? draft.collection : 'universal'} disabled={draft.category !== 'wedding'} aria-label="Sub-category" onChange={(e) => setDraft({ ...draft, collection: e.target.value as TemplateCollection })}>
                          {WEDDING_SUBS.map((c) => <option key={c} value={c}>{COLLECTION_LABELS[c]}</option>)}
                        </select>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" onClick={() => void run(async () => { await musicService.adminUpdate(t.id, draft); setEditing(null) })}>Save</Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => togglePlay(t)} aria-label={playing === t.id ? `Pause ${t.title}` : `Play ${t.title}`} className="flex size-8 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink-soft hover:border-gold">
                          {playing === t.id ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-ink">{t.title}{!t.isActive && <span className="ml-2 text-xs text-ink-soft">(hidden)</span>}</p>
                          <p className="truncate text-xs text-ink-soft">
                            {[t.mood, t.durationSeconds ? formatDuration(t.durationSeconds) : null, t.artistCredit].filter(Boolean).join(' · ') || ' '}
                          </p>
                        </div>
                        <button type="button" title={t.isActive ? 'Hide from wizard' : 'Show in wizard'} aria-label={t.isActive ? `Hide ${t.title}` : `Show ${t.title}`} className="p-1.5 text-ink-soft hover:text-ink" onClick={() => void run(() => musicService.adminSetActive(t.id, !t.isActive))}>
                          {t.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                        </button>
                        <button type="button" aria-label={`Edit ${t.title}`} className="p-1.5 text-ink-soft hover:text-ink" onClick={() => { setEditing(t.id); setDraft({ title: t.title, artistCredit: t.artistCredit ?? '', mood: t.mood ?? '', category: t.category, collection: t.collection }) }}>
                          <Pencil className="size-4" />
                        </button>
                        <button type="button" aria-label={`Delete ${t.title}`} className="p-1.5 text-ink-soft hover:text-danger" onClick={() => { if (window.confirm(`Delete "${t.title}" permanently?`)) void run(() => musicService.adminDelete(t)) }}>
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
