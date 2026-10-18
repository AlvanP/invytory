export type SceneKey =
  | 'envelope' | 'gate' | 'doors' | 'curtain' | 'lattice' | 'book'
  | 'sky' | 'bloom' | 'dawn' | 'meadow'
  | 'balloons' | 'gift' | 'spotlight'
  | 'shutter' | 'mountain' | 'linesplit'
  | 'candle' | 'leaves'

export interface SceneColors {
  /** Accent: gold leaf, trim, highlights. */
  a: string
  /** Main background / fabric / door colour (darker end). */
  b1: string
  /** Lighter end of the same. */
  b2: string
  /** Paper or card colour, where the scene has one. */
  p?: string
  /** A second accent (seal wax, ribbon, balloons...). */
  s?: string
}

export interface EntranceDesign {
  scene: SceneKey
  /** Writing colour over the scene. */
  ink: 'light' | 'dark'
  /** center: words in the middle. split: names above, button below. hintonly: just a line above and the button below (names are drawn in the scene). */
  layout: 'center' | 'split' | 'hintonly'
  hint: string
  /** How long the opening takes before the invitation shows (ms). */
  ms: number
  c: SceneColors
  pattern?: 'uli' | 'adire' | 'stripe' | 'star' | 'plain'
  /** Doors with a rounded top. */
  arch?: boolean
  petals?: number
}

export interface SceneProps {
  open: boolean
  go: () => void
  d: EntranceDesign
  initials: string
  names: string
}
