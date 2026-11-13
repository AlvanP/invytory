import type { CSSProperties } from 'react'
import type { ToneStyle } from './designs'

/**
 * What a block of colour looks like for each tone. Applied by overriding the two variables that
 * everything inside a cover or a band reads (--iv-main = its background, --iv-on-main = its writing),
 * so every piece inside adapts without knowing about tones.
 */
export function toneVars(tone: ToneStyle): CSSProperties | undefined {
  switch (tone) {
    case 'colour':
      return undefined
    case 'deep':
      return { '--iv-main': 'var(--iv-deep)', '--iv-on-main': 'var(--iv-on-deep)' } as CSSProperties
    case 'ink':
      return { '--iv-main': '#1C1A19', '--iv-on-main': '#F6F1EA' } as CSSProperties
    case 'paper':
      return { '--iv-main': 'var(--iv-paper)', '--iv-on-main': 'var(--iv-ink)' } as CSSProperties
    case 'tint':
      return { '--iv-main': 'var(--iv-soft)', '--iv-on-main': 'var(--iv-ink)' } as CSSProperties
  }
}
