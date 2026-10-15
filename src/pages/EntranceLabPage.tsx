import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { templates } from '@/data/templates'
import { DoorEntrance } from '@/components/entrance/DoorEntrance'
import type { EntranceStyle } from '@/templates/entranceConfig'

const STYLES: { value: EntranceStyle | ''; label: string }[] = [
  { value: '', label: 'From the artwork files' },
  { value: 'gatefold', label: 'Gatefold doors + bow (placeholder)' },
  { value: 'waxenvelope', label: 'Wax-seal envelope (placeholder)' },
  { value: 'doors', label: 'Doors (basic)' },
  { value: 'gate', label: 'Gate (basic)' },
  { value: 'book', label: 'Book (basic)' },
  { value: 'envelope', label: 'Envelope (basic)' },
]

/**
 * A private test bench for entrances: /entrance-lab
 * Pick a design and replay the opening on your phone with your real artwork
 * files, without publishing an invitation. Nothing here is saved.
 */
export function EntranceLabPage() {
  const [params, setParams] = useSearchParams()
  const templateId = params.get('t') ?? templates[0].id
  const style = (params.get('s') ?? '') as EntranceStyle | ''
  const template = templates.find((t) => t.id === templateId) ?? templates[0]
  const [run, setRun] = useState(0)
  const [opened, setOpened] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)

  function update(next: { t?: string; s?: string }) {
    const p = new URLSearchParams(params)
    if (next.t !== undefined) p.set('t', next.t)
    if (next.s !== undefined) {
      if (next.s) p.set('s', next.s)
      else p.delete('s')
    }
    setParams(p, { replace: true })
    replay()
  }

  function replay() {
    setOpened(false)
    setRun((n) => n + 1)
  }

  return (
    <div className="fixed inset-0 bg-ink">
      <DoorEntrance
        key={`${template.id}-${style}-${run}`}
        tone={template.previewTone}
        templateId={template.id}
        forceStyle={style || undefined}
        brideName="Ada"
        groomName="Michael"
        onOpen={() => setOpened(true)}
      />

      {opened && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-ivory/95 px-6 text-center">
          <p className="font-display text-2xl text-ink">The invitation appears here</p>
          <p className="text-sm text-ink-soft">The entrance has finished opening.</p>
          <button
            type="button"
            onClick={replay}
            className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white px-5 py-2.5 text-sm text-ink"
          >
            <RotateCcw className="size-4" /> Play again
          </button>
        </div>
      )}

      <div className="absolute right-3 top-3 z-40 flex flex-col items-end gap-2 text-left">
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          aria-label="Lab settings"
          className="rounded-full bg-black/55 p-2.5 text-white backdrop-blur"
        >
          <SlidersHorizontal className="size-4" />
        </button>
        {panelOpen && (
          <div className="flex w-64 flex-col gap-3 rounded-md bg-white p-4 text-sm text-ink shadow-lift">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-ink-soft">Design</span>
              <select
                className="rounded-sm border border-ink/20 px-2 py-1.5"
                value={template.id}
                onChange={(e) => update({ t: e.target.value })}
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-ink-soft">Opening style</span>
              <select
                className="rounded-sm border border-ink/20 px-2 py-1.5"
                value={style}
                onChange={(e) => update({ s: e.target.value })}
              >
                {STYLES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                replay()
                setPanelOpen(false)
              }}
              className="rounded-full bg-ink px-4 py-2 text-ivory"
            >
              Replay
            </button>
            <p className="text-xs text-ink-soft/80">
              &ldquo;From the artwork files&rdquo; shows exactly what a guest would see for this design.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}