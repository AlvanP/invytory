import { useState } from 'react'
import { Check } from 'lucide-react'
import { COLOUR_SWATCHES, MAX_COLOURS, buildTheme } from '@/utils/colorTheme'
import { cn } from '@/utils/cn'

/**
 * Picks the colours of the day for one ceremony: up to three. Tap a swatch to add it, tap a
 * chosen colour (or its chip) to edit it with the colour wheel or a hex code, or add any colour with +. The first colour chosen is
 * the main one: the invitation's colour blocks and buttons use it.
 */
/** "b08d57", "#B08" or "#b08d57" becomes "#B08D57"; anything else is not a colour (null). */
function normaliseHex(value: string): string | null {
  let v = value.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(v)) v = v.split('').map((c) => c + c).join('')
  return /^[0-9a-f]{6}$/i.test(v) ? `#${v.toUpperCase()}` : null
}

export function ColourPicker({
  values,
  onChange,
  title = 'Colours of the day',
  sampleName = 'Your names',
  help = `Pick up to ${MAX_COLOURS}. The first one is your main colour: the invitation’s colour blocks, countdown and buttons use it, and the writing on top is chosen automatically so it is easy to read.`,
}: {
  values: string[]
  onChange: (hexes: string[]) => void
  title?: string
  /** Shown in the sample strip: the name entered on the names step. */
  sampleName?: string
  help?: string
}) {
  const current = values.map((v) => v.toUpperCase())
  const full = current.length >= MAX_COLOURS
  const theme = current[0] ? buildTheme(current[0]) : null

  // Which colour is being edited: its position, 'new' for a colour being added, or none.
  const [editing, setEditing] = useState<number | 'new' | null>(null)
  const [draft, setDraft] = useState('#B08D57')
  const [text, setText] = useState('#B08D57')
  const validDraft = normaliseHex(text)

  function open(target: number | 'new', hex: string) {
    setEditing(target)
    setDraft(hex)
    setText(hex)
  }

  function pick(hex: string) {
    setDraft(hex.toUpperCase())
    setText(hex.toUpperCase())
  }

  function save() {
    const hex = normaliseHex(text)
    if (!hex || editing === null) return
    const without = editing === 'new' ? current : current.filter((_, i) => i !== editing)
    if (without.includes(hex)) {
      // already one of the colours: just close
      setEditing(null)
      return
    }
    if (editing === 'new') onChange([...current, hex].slice(0, MAX_COLOURS))
    else onChange(current.map((c, i) => (i === editing ? hex : c)))
    setEditing(null)
  }

  function remove() {
    if (typeof editing === 'number') onChange(current.filter((_, i) => i !== editing))
    setEditing(null)
  }

  /** A swatch: tap an unused one to add it, tap a chosen one to edit it. */
  function tapSwatch(hex: string) {
    const upper = hex.toUpperCase()
    const at = current.indexOf(upper)
    if (at >= 0) open(at, upper)
    else if (!full) onChange([...current, upper])
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium text-ink-soft">{title}</p>
        <p className="mt-1 text-xs text-ink-soft/70">{help}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {COLOUR_SWATCHES.map((s) => {
          const index = current.indexOf(s.hex.toUpperCase())
          const selected = index >= 0
          const on = buildTheme(s.hex)
          return (
            <button
              key={s.hex}
              type="button"
              onClick={() => tapSwatch(s.hex)}
              disabled={!selected && full}
              aria-label={s.name}
              aria-pressed={selected}
              title={s.name}
              className={cn(
                'relative flex size-9 items-center justify-center rounded-full border-2 text-xs font-semibold transition-transform hover:scale-105 disabled:opacity-35 disabled:hover:scale-100',
                selected ? 'border-ink' : 'border-white shadow-soft'
              )}
              style={{ backgroundColor: s.hex, color: on.onMain }}
            >
              {selected ? index + 1 : null}
            </button>
          )
        })}

        <button
          type="button"
          disabled={full}
          onClick={() => open('new', '#B08D57')}
          aria-label="Add any colour"
          title="Add any colour"
          className={cn('flex size-9 items-center justify-center rounded-full border-2 border-dashed border-ink/30 text-sm text-ink-soft', full && 'opacity-35')}
        >
          +
        </button>
      </div>

      {current.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {current.map((hex, i) => (
            <span key={hex} className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-ink-soft', editing === i ? 'border-ink' : 'border-ink/15')}>
              <button type="button" onClick={() => open(i, hex)} className="inline-flex items-center gap-1.5 hover:text-ink" aria-label={`Edit ${i === 0 ? 'main colour' : `colour ${i + 1}`}`}>
                <span className="size-3.5 rounded-full border border-ink/20" style={{ backgroundColor: hex }} />
                {i === 0 ? 'Main' : `Colour ${i + 1}`} <span className="font-mono text-[10px] opacity-70">{hex}</span>
              </button>
              <button type="button" onClick={() => onChange(current.filter((c) => c !== hex))} className="text-ink-soft/60 hover:text-ink" aria-label={`Remove colour ${i + 1}`}>
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {editing !== null && (
        <div className="flex flex-col gap-3 rounded-sm border border-ink/15 bg-white p-3">
          <p className="text-xs font-medium text-ink-soft">{editing === 'new' ? 'Add a colour' : editing === 0 ? 'Edit your main colour' : `Edit colour ${Number(editing) + 1}`}</p>
          <div className="flex items-center gap-3">
            <input
              type="color"
              aria-label="Pick a colour"
              value={validDraft ?? draft}
              onChange={(e) => pick(e.target.value)}
              className="size-11 shrink-0 cursor-pointer rounded-xs border border-ink/15 bg-transparent p-0.5"
            />
            <label className="flex flex-1 flex-col gap-1 text-xs text-ink-soft">
              Hex code
              <input
                value={text}
                onChange={(e) => {
                  const v = e.target.value
                  setText(v)
                  const n = normaliseHex(v)
                  if (n) setDraft(n)
                }}
                maxLength={7}
                spellCheck={false}
                autoCapitalize="characters"
                placeholder="#B08D57"
                aria-invalid={!validDraft}
                className={cn('w-full rounded-xs border bg-white px-3 py-2 font-mono text-sm uppercase text-ink focus:outline-none', validDraft ? 'border-ink/15 focus:border-gold' : 'border-red-400')}
              />
            </label>
            <span className="size-11 shrink-0 rounded-xs border border-ink/15" style={{ backgroundColor: validDraft ?? draft }} aria-hidden />
          </div>
          {!validDraft && <p className="text-xs text-red-600">Enter a colour like #B08D57 (3 or 6 characters, 0-9 and A-F).</p>}
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={save} disabled={!validDraft} className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-white disabled:opacity-40">
              {editing === 'new' ? 'Add colour' : 'Save colour'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-ink/20 px-4 py-1.5 text-xs text-ink-soft">
              Cancel
            </button>
            {typeof editing === 'number' && (
              <button type="button" onClick={remove} className="ml-auto text-xs text-red-600 underline underline-offset-2">
                Remove
              </button>
            )}
          </div>
        </div>
      )}

      {theme ? (
        <div
          className="flex items-center justify-between rounded-sm px-4 py-3 text-sm"
          style={{ backgroundColor: theme.main, color: theme.onMain }}
        >
          <span className="min-w-0 truncate font-display text-base">{sampleName}</span>
          <span className="flex items-center gap-1 text-xs tracking-[0.2em]">
            <Check className="size-3.5" /> SAVE THE DATE
          </span>
        </div>
      ) : (
        <p className="text-xs text-ink-soft/70">No colour chosen, so the design&rsquo;s own colours are used.</p>
      )}
    </div>
  )
}
