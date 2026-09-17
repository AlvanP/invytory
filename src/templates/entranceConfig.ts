import type { CoverTone } from './TemplateCover'

/**
 * The four entrance mechanics the Door Engine currently supports.
 * Templates map to one of these; several templates can share a
 * mechanic while looking different (Royal and African Royal both use
 * "doors" but with different colors/patterns), matching how real
 * invitation styles work.
 */
export type EntranceStyle = 'doors' | 'gate' | 'book' | 'envelope'

export interface EntranceAssets {
  /** Full-bleed background image behind the whole entrance scene. */
  background?: string
  /** "doors" / "gate" styles: left and right panel artwork. */
  leftPanel?: string
  rightPanel?: string
  /** "book" style: the cover artwork. */
  cover?: string
  /** "envelope" style: the envelope + seal artwork. */
  envelope?: string
  seal?: string
}

export interface EntranceConfig {
  style: EntranceStyle
  /** Text on the interaction button/prompt. */
  hint: string
  /** Real artwork slots. Leave undefined to use the CSS placeholder —
   * see src/assets/entrances/README.md for exact dimensions to design
   * against. Populate any of these later and DoorEntrance automatically
   * swaps the placeholder for the real image, no other code changes. */
  assets?: EntranceAssets
}

export const entranceConfig: Record<CoverTone, EntranceConfig> = {
  royal: { style: 'doors', hint: 'Tap to Open the Doors' },
  garden: { style: 'gate', hint: 'Tap to Open the Gate' },
  storybook: { style: 'book', hint: 'Tap to Open the Book' },
  modern: { style: 'envelope', hint: 'Tap to Open' },
  heritage: { style: 'doors', hint: 'Tap to Open the Doors' },
  classic: { style: 'envelope', hint: 'Tap to Open the Invitation' },
}