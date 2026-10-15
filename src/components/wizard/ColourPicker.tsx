import { Check } from 'lucide-react'
import { COLOUR_SWATCHES, buildTheme, isHexColour } from '@/utils/colorTheme'
import { cn } from '@/utils/cn'

/**
 * Picks the "colour of the day" for one ceremony: tap a swatch, or choose any
 * colour. The sample strip shows how the writing will look on that colour.
 */
export function ColourPicker({
  value,
  onChange,
}: {
  value: string | null | undefined
  onChange: (hex: string | null) => void
}) {
  const current = isHexColour(value) ? value.toUpperCase() : null
  const theme = current ? buildTheme(current) : null

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium text-ink-soft">
          Colour of the day <span className="font-normal text-ink-soft/60">(optional)</span>
        </p>
        <p className="mt-1 text-xs text-ink-soft/70">
          Your invitation&rsquo;s bands, countdown and buttons use this colour. Writing on top of it is chosen
          automatically so it is easy to read.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {COLOUR_SWATCHES.map((s) => {
          const selected = current === s.hex.toUpperCase()
          const on = buildTheme(s.hex)
          return (
            <button
              key={s.hex}
              type="button"
              onClick={() => onChange(selected ? null : s.hex)}
              aria-label={s.name}
              aria-pressed={selected}
              title={s.name}
              className={cn(
                'flex size-9 items-center justify-center rounded-full border-2 transition-transform hover:scale-105',
                selected ? 'border-ink' : 'border-white shadow-soft'
              )}
              style={{ backgroundColor: s.hex }}
            >
              {selected && <Check className="size-4" style={{ color: on.onMain }} />}
            </button>
          )
        })}

        <label
          className="relative flex size-9 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-ink/30 text-[10px] text-ink-soft"
          title="Choose any colour"
        >
          <span aria-hidden>+</span>
          <input
            type="color"
            aria-label="Choose any colour"
            value={current ?? '#B08D57'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      </div>

      {theme ? (
        <div className="flex flex-col gap-2">
          <div
            className="flex items-center justify-between rounded-sm px-4 py-3 text-sm"
            style={{ backgroundColor: theme.main, color: theme.onMain }}
          >
            <span className="font-display text-base">Ada &amp; Michael</span>
            <span className="text-xs tracking-[0.2em]">SAVE THE DATE</span>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="w-fit text-xs text-ink-soft underline underline-offset-2 hover:text-ink"
          >
            Use the design&rsquo;s own colour instead
          </button>
        </div>
      ) : (
        <p className="text-xs text-ink-soft/70">No colour chosen, so the design&rsquo;s own colours are used.</p>
      )}
    </div>
  )
}