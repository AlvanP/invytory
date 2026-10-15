import type { CSSProperties } from 'react'

/**
 * "Colour of the day". A couple picks one colour for a ceremony; everything else
 * (readable text, soft tints, accents) is worked out from it so the writing is
 * always legible, whichever colour is chosen.
 */

export interface ColourSwatch {
  name: string
  hex: string
}

export const COLOUR_SWATCHES: ColourSwatch[] = [
  { name: 'Red', hex: '#B3202A' },
  { name: 'Burgundy', hex: '#6D1F2F' },
  { name: 'Coral', hex: '#FF7F50' },
  { name: 'Blush', hex: '#E8B4B8' },
  { name: 'Gold', hex: '#B08D57' },
  { name: 'Champagne', hex: '#E3D2B0' },
  { name: 'Sage', hex: '#8FA37E' },
  { name: 'Emerald', hex: '#0B6B4B' },
  { name: 'Teal', hex: '#12727A' },
  { name: 'Royal blue', hex: '#1F3FA6' },
  { name: 'Purple', hex: '#5B2A86' },
  { name: 'Charcoal', hex: '#2A2623' },
]

const INK = '#1F1C19'
const WHITE = '#FFFFFF'
const PAPER = '#FBF7F1'

type Rgb = [number, number, number]

export function isHexColour(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)
}

function toRgb(hex: string): Rgb {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

function toHex([r, g, b]: Rgb): string {
  const part = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')
  return `#${part(r)}${part(g)}${part(b)}`
}

function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio between two colours (1 to 21). 4.5 or more is easy to read. */
export function contrast(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/** White or near-black, whichever reads better on the given background. */
export function readableOn(background: string): string {
  return contrast(background, WHITE) >= contrast(background, INK) ? WHITE : INK
}

function mix(a: string, b: string, amountOfB: number): string {
  const x = toRgb(a)
  const y = toRgb(b)
  return toHex([0, 1, 2].map((i) => x[i] + (y[i] - x[i]) * amountOfB) as Rgb)
}

/** Darkens a colour step by step until it reads well as text on `background`. */
function readableAccent(colour: string, background: string, minimum = 4.5): string {
  let result = colour
  for (let i = 0; i < 20 && contrast(result, background) < minimum; i++) {
    result = mix(result, '#000000', 0.12)
  }
  return result
}

export interface InvitationTheme {
  /** The couple's colour. Used for bands, tiles and buttons. */
  main: string
  /** Readable text on `main` (white or near-black). */
  onMain: string
  /** A pale tint of the colour for light sections. */
  soft: string
  /** Readable text on `soft` and on the page background. */
  ink: string
  /** The colour darkened enough to read as small text or lines on light backgrounds. */
  accent: string
}

/**
 * Mid-tone colours (pure red, grey) can fail with both white and dark text. In that
 * case the colour is nudged a little darker or lighter until the writing is readable.
 */
function nudgeForText(colour: string): string {
  let result = colour
  for (let i = 0; i < 30; i++) {
    const text = readableOn(result)
    if (contrast(text, result) >= 4.5) break
    result = text === WHITE ? mix(result, '#000000', 0.05) : mix(result, '#FFFFFF', 0.05)
  }
  return result
}

export function buildTheme(hex: string): InvitationTheme {
  const main = nudgeForText(isHexColour(hex) ? hex.toUpperCase() : '#B08D57')
  const soft = mix(main, PAPER, 0.88)
  return {
    main,
    onMain: readableOn(main),
    soft,
    ink: INK,
    accent: readableAccent(main, soft),
  }
}

/** The colour used when a couple has not picked one. */
export const DEFAULT_THEME_COLOUR: Record<string, string> = {
  royal: '#5C2435',
  garden: '#7F9570',
  storybook: '#9A7B4A',
  modern: '#2A2623',
  heritage: '#8A3A1E',
  classic: '#9A7B4A',
}

/** CSS variables that the invitation's pieces read, so one wrapper themes them all. */
export function themeStyle(hex: string): CSSProperties {
  const t = buildTheme(hex)
  return {
    '--iv-main': t.main,
    '--iv-on-main': t.onMain,
    '--iv-soft': t.soft,
    '--iv-ink': t.ink,
    '--iv-accent': t.accent,
    '--iv-paper': PAPER,
  } as CSSProperties
}

/** The first swatch colour named in some text, e.g. "Red and gold" -> Red. */
export function swatchInText(text: string): ColourSwatch | null {
  let best: { s: ColourSwatch; at: number } | null = null
  const lower = text.toLowerCase()
  for (const s of COLOUR_SWATCHES) {
    const at = lower.search(new RegExp(`\\b${s.name.toLowerCase()}\\b`))
    if (at >= 0 && (!best || at < best.at)) best = { s, at }
  }
  return best ? best.s : null
}