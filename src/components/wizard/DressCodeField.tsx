import { Input } from '@/components/ui/Input'
import { ColourPicker } from '@/components/wizard/ColourPicker'
import { COLOUR_SWATCHES, swatchInText } from '@/utils/colorTheme'

export interface DressCodeChange {
  dressCode?: string
  themeColor?: string | null
}

const isSwatchName = (t: string) => COLOUR_SWATCHES.some((s) => s.name.toLowerCase() === t.trim().toLowerCase())

/**
 * The dress code and the colour of the day in one place. Picking a colour
 * fills in the dress code (if it is empty), and naming a colour in the dress
 * code ("Red and gold") picks that colour. The whole invitation then uses it.
 */
export function DressCodeField({
  dressCode,
  themeColor,
  onChange,
}: {
  dressCode: string
  themeColor: string | null | undefined
  onChange: (change: DressCodeChange) => void
}) {
  function onText(text: string) {
    const found = swatchInText(text)
    onChange(found ? { dressCode: text, themeColor: found.hex } : { dressCode: text })
  }

  function onColour(hex: string | null) {
    const swatch = COLOUR_SWATCHES.find((s) => s.hex.toLowerCase() === hex?.toLowerCase())
    if (swatch && (!dressCode.trim() || isSwatchName(dressCode))) onChange({ themeColor: hex, dressCode: swatch.name })
    else if (!hex && isSwatchName(dressCode)) onChange({ themeColor: null, dressCode: '' })
    else onChange({ themeColor: hex })
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
        value={themeColor}
        onChange={onColour}
        title="Dress code colour (colour of the day)"
        help="Pick the colour your guests should wear. Your invitation uses it for its colour bands, countdown and buttons, and the writing on it is chosen automatically so it is easy to read."
      />
    </div>
  )
}