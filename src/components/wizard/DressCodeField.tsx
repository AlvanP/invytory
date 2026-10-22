import { Input } from '@/components/ui/Input'
import { ColourPicker } from '@/components/wizard/ColourPicker'
import { COLOUR_SWATCHES, MAX_COLOURS, joinNames, swatchName, swatchesInText } from '@/utils/colorTheme'

export interface DressCodeChange {
  dressCode?: string
  /** All the colours of the day (up to three); the first is the main one. */
  colours?: string[]
}

/** True when the dress code is only colour names ("Red and Gold"), so it can be rewritten safely. */
function isOnlyColourNames(text: string): boolean {
  const words = text.toLowerCase().replace(/[,&]/g, ' ').split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  let rest = ' ' + words.join(' ') + ' '
  for (const s of COLOUR_SWATCHES) rest = rest.split(` ${s.name.toLowerCase()} `).join(' ')
  return rest.replace(/ and /g, ' ').trim() === ''
}

/**
 * The dress code and the colours of the day in one place. Picking colours writes their names
 * into the dress code (if it is empty or only colour names), and naming colours in the dress
 * code ("Red and gold") picks them. The invitation then uses them.
 */
export function DressCodeField({
  dressCode,
  colours,
  onChange,
  sampleName,
}: {
  dressCode: string
  colours: string[]
  onChange: (change: DressCodeChange) => void
  sampleName?: string
}) {
  function onText(text: string) {
    const found = swatchesInText(text)
    onChange(found.length ? { dressCode: text, colours: found.map((s) => s.hex) } : { dressCode: text })
  }

  function onColours(hexes: string[]) {
    const names = hexes.map(swatchName)
    if (names.every((n): n is string => !!n) && isOnlyColourNames(dressCode)) {
      onChange({ colours: hexes, dressCode: joinNames(names) })
    } else {
      onChange({ colours: hexes })
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:col-span-2">
      <Input
        label="Dress code"
        optional
        placeholder="e.g. Red and gold"
        value={dressCode}
        onChange={(e) => onText(e.target.value)}
      />
      <ColourPicker
        values={colours}
        onChange={onColours}
        sampleName={sampleName}
        title={`Colours of the day (up to ${MAX_COLOURS})`}
      />
    </div>
  )
}
