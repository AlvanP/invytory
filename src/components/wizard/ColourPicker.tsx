import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { COLOUR_SWATCHES, MAX_COLOURS, buildTheme } from '@/utils/colorTheme'
import { cn } from '@/utils/cn'

/**
 * Picks the colours of the day for one ceremony: up to three. Tap a swatch to add it and
 * tap again to remove it, or add any colour with the + button. The first colour chosen is
 * the main one: the invitation's colour blocks and buttons use it.
 */
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

  // The browser's colour picker reports every movement while you drag. Only the final choice
  // (when you let go and close the picker) is added, so sliding around never adds colours.
  const custom = useRef<HTMLInputElement | null>(null)
  const [pickerKey, setPickerKey] = useState(0)
  const latest = useRef(toggle)
  useEffect(() => {
    latest.current = toggle
  })
  useEffect(() => {
    const node = custom.current
    if (!node) return
    const done = () => {
      latest.current(node.value)
      setPickerKey((k) => k + 1)
    }
    node.addEventListener('change', done)
    return () => node.removeEventListener('change', done)
  }, [pickerKey])

  function toggle(hex: string) {
    const upper = hex.toUpperCase()
    if (current.includes(upper)) onChange(current.filter((c) => c !== upper))
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
              onClick={() => toggle(s.hex)}
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

        <label
          className={cn(
            'relative flex size-9 items-center justify-center rounded-full border-2 border-dashed border-ink/30 text-sm text-ink-soft',
            full ? 'opacity-35' : 'cursor-pointer'
          )}
          title="Add any colour"
        >
          <span aria-hidden>+</span>
          <input
            key={pickerKey}
            ref={custom}
            type="color"
            aria-label="Add any colour"
            disabled={full}
            defaultValue="#B08D57"
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-default"
          />
        </label>
      </div>

      {current.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {current.map((hex, i) => (
            <span key={hex} className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-2.5 py-1 text-xs text-ink-soft">
              <span className="size-3.5 rounded-full border border-ink/20" style={{ backgroundColor: hex }} />
              {i === 0 ? 'Main' : `Colour ${i + 1}`}
              <button type="button" onClick={() => onChange(current.filter((c) => c !== hex))} className="text-ink-soft/60 hover:text-ink" aria-label={`Remove colour ${i + 1}`}>
                &times;
              </button>
            </span>
          ))}
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
