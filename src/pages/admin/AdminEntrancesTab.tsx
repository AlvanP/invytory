import { useCallback, useEffect, useState } from 'react'
import { Loader2, Trash2, Upload, Volume2, VolumeX } from 'lucide-react'
import { templates } from '@/data/templates'
import {
  DEFAULT_SETTING,
  MAX_VIDEO_BYTES,
  entranceService,
  musicDelaySeconds,
  type EntranceSetting,
  type MusicStart,
} from '@/services/entranceService'
import { Button } from '@/components/ui/Button'

const field = 'w-full rounded-xs border border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none'

type Mode = 'tap' | 'after' | 'end' | 'content'
const modeOf = (m: MusicStart): Mode => (m.startsWith('after:') ? 'after' : (m as Mode))

/** Admin: upload, replace or delete each template's entrance video, set when the music starts, mute it. */
export function AdminEntrancesTab() {
  const [settings, setSettings] = useState<Record<string, EntranceSetting> | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    entranceService.forget()
    try {
      setSettings(await entranceService.all())
    } catch {
      setSettings({})
    }
  }, [])
  useEffect(() => {
    void load()
  }, [load])

  if (!settings) return <p className="py-10 text-center text-sm text-ink-soft">Loading…</p>

  return (
    <div>
      <p className="mb-4 text-sm text-ink-soft">
        Every template opens with a built-in entrance. Upload a video to replace it for one template, or delete the video to go back to the built-in one.
        Run <code>docs/sql/entrances.sql</code> in Supabase once if saving fails.
      </p>
      {error && <p className="mb-3 rounded-xs bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <ul className="divide-y divide-ink/10 rounded-sm border border-ink/10 bg-white">
        {templates.map((t) => {
          const s = settings[t.id] ?? DEFAULT_SETTING(t.id)
          return (
            <li key={t.id}>
              <button type="button" onClick={() => setOpen(open === t.id ? null : t.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-ink/[0.03]">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{t.name}</span>
                  <span className="block text-xs text-ink-soft">{t.category} · {t.id}</span>
                </span>
                <span className="text-xs text-ink-soft">{s.videoUrl ? 'Video' : 'Built-in'}{s.muted ? ' · muted' : ''}</span>
              </button>
              {open === t.id && (
                <Editor
                  key={t.id + (s.videoUrl ?? '')}
                  initial={s}
                  onError={setError}
                  onSaved={(next) => setSettings((p) => ({ ...(p ?? {}), [t.id]: next }))}
                />
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Editor({ initial, onSaved, onError }: { initial: EntranceSetting; onSaved: (s: EntranceSetting) => void; onError: (m: string | null) => void }) {
  const [s, setS] = useState(initial)
  const [mode, setMode] = useState<Mode>(modeOf(initial.musicStart))
  const [secs, setSecs] = useState(String(musicDelaySeconds(initial.musicStart) ?? 2))
  const [busy, setBusy] = useState(false)

  const musicStart: MusicStart = mode === 'after' ? `after:${Math.max(0, Number(secs) || 0)}` : mode

  async function run(fn: () => Promise<EntranceSetting | void>) {
    setBusy(true)
    onError(null)
    try {
      const next = await fn()
      if (next) onSaved(next)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const current = (): EntranceSetting => ({ ...s, musicStart })

  return (
    <div className="space-y-4 bg-ink/[0.03] px-4 py-4">
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-ink-soft">Entrance video</p>
        {s.videoUrl ? (
          <div className="flex flex-wrap items-start gap-3">
            <video src={s.videoUrl} controls muted playsInline className="h-40 rounded-xs bg-black" />
            <Button variant="outline" size="sm" disabled={busy} onClick={() => run(async () => { const n = await entranceService.deleteVideo(current()); return n })}>
              <Trash2 className="mr-1 h-4 w-4" /> Delete video (use built-in)
            </Button>
          </div>
        ) : (
          <p className="text-sm text-ink-soft">Using the built-in entrance.</p>
        )}
        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-gold-deep">
          <Upload className="h-4 w-4" /> {s.videoUrl ? 'Replace video' : 'Upload video'} (mp4 or webm, max {MAX_VIDEO_BYTES / 1024 / 1024}MB)
          <input
            type="file"
            accept="video/mp4,video/webm"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              if (f) void run(() => entranceService.uploadVideo(current(), f))
            }}
          />
        </label>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-soft">Invitation music starts</label>
        <div className="flex flex-wrap items-center gap-2">
          <select className={field + ' !w-auto'} value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="tap">When the guest taps to open</option>
            <option value="after">Seconds after the tap…</option>
            <option value="end">After the entrance animation</option>
            <option value="content">When the invitation content appears</option>
          </select>
          {mode === 'after' && (
            <span className="flex items-center gap-1 text-sm">
              <input className={field + ' !w-20'} type="number" min={0} step={0.5} value={secs} onChange={(e) => setSecs(e.target.value)} /> seconds
            </span>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" checked={s.muted} onChange={(e) => setS({ ...s, muted: e.target.checked })} />
        {s.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />} Mute the entrance video's own sound
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-soft">Show couple's names at (seconds, optional)</label>
          <input className={field} type="number" min={0} step={0.01} placeholder="e.g. 3.57" value={s.namesAt ?? ''} onChange={(e) => setS({ ...s, namesAt: e.target.value === '' ? null : Number(e.target.value) })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-soft">Names colour</label>
          <input className={field} placeholder="#E6CF9A" value={s.namesColor ?? ''} onChange={(e) => setS({ ...s, namesColor: e.target.value || null })} />
        </div>
      </div>

      <Button size="sm" disabled={busy} onClick={() => run(async () => { const n = current(); await entranceService.save(n); return n })}>
        {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null} Save settings
      </Button>
    </div>
  )
}
