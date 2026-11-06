import type { CSSProperties } from 'react'

/**
 * Lettering for the invitation templates. Every template picks one "kit": a family for headings,
 * one for the couple's names, one for reading text. Fonts are self-hosted (from @fontsource), and
 * only the fonts of the template being viewed are downloaded, so the site stays fast.
 * To change a template's lettering, edit its `kit` in designs.ts or add a kit below.
 */

type Loader = () => Promise<unknown>

interface FontFile {
  family: string
  load: Loader
}

const all = (...imports: Loader[]): Loader => () => Promise.all(imports.map((i) => i()))

const FONTS = {
  cormorant: { family: "'Cormorant Garamond'", load: all(() => import('@fontsource/cormorant-garamond/400.css'), () => import('@fontsource/cormorant-garamond/500.css'), () => import('@fontsource/cormorant-garamond/500-italic.css')) },
  cormorantInfant: { family: "'Cormorant Infant'", load: all(() => import('@fontsource/cormorant-infant/400.css'), () => import('@fontsource/cormorant-infant/500.css'), () => import('@fontsource/cormorant-infant/400-italic.css')) },
  playfair: { family: "'Playfair Display'", load: all(() => import('@fontsource/playfair-display/400.css'), () => import('@fontsource/playfair-display/500.css'), () => import('@fontsource/playfair-display/400-italic.css')) },
  bodoni: { family: "'Bodoni Moda'", load: all(() => import('@fontsource/bodoni-moda/400.css'), () => import('@fontsource/bodoni-moda/500.css'), () => import('@fontsource/bodoni-moda/400-italic.css')) },
  cinzel: { family: "'Cinzel'", load: all(() => import('@fontsource/cinzel/400.css'), () => import('@fontsource/cinzel/500.css')) },
  marcellus: { family: "'Marcellus'", load: all(() => import('@fontsource/marcellus/400.css')) },
  italiana: { family: "'Italiana'", load: all(() => import('@fontsource/italiana/400.css')) },
  gilda: { family: "'Gilda Display'", load: all(() => import('@fontsource/gilda-display/400.css')) },
  caslon: { family: "'Libre Caslon Display'", load: all(() => import('@fontsource/libre-caslon-display/400.css')) },
  dmSerif: { family: "'DM Serif Display'", load: all(() => import('@fontsource/dm-serif-display/400.css'), () => import('@fontsource/dm-serif-display/400-italic.css')) },
  prata: { family: "'Prata'", load: all(() => import('@fontsource/prata/400.css')) },
  forum: { family: "'Forum'", load: all(() => import('@fontsource/forum/400.css')) },
  bellefair: { family: "'Bellefair'", load: all(() => import('@fontsource/bellefair/400.css')) },
  lora: { family: "'Lora'", load: all(() => import('@fontsource/lora/400.css'), () => import('@fontsource/lora/500.css'), () => import('@fontsource/lora/400-italic.css')) },
  ebGaramond: { family: "'EB Garamond'", load: all(() => import('@fontsource/eb-garamond/400.css'), () => import('@fontsource/eb-garamond/500.css'), () => import('@fontsource/eb-garamond/400-italic.css')) },
  instrument: { family: "'Instrument Serif'", load: all(() => import('@fontsource/instrument-serif/400.css'), () => import('@fontsource/instrument-serif/400-italic.css')) },
  newsreader: { family: "'Newsreader'", load: all(() => import('@fontsource/newsreader/400.css'), () => import('@fontsource/newsreader/500.css'), () => import('@fontsource/newsreader/400-italic.css')) },
  abril: { family: "'Abril Fatface'", load: all(() => import('@fontsource/abril-fatface/400.css')) },
  tenor: { family: "'Tenor Sans'", load: all(() => import('@fontsource/tenor-sans/400.css')) },
  josefin: { family: "'Josefin Sans'", load: all(() => import('@fontsource/josefin-sans/400.css'), () => import('@fontsource/josefin-sans/500.css'), () => import('@fontsource/josefin-sans/600.css')) },
  jost: { family: "'Jost'", load: all(() => import('@fontsource/jost/400.css'), () => import('@fontsource/jost/500.css'), () => import('@fontsource/jost/600.css')) },
  // Fraunces is already bundled for the brand (see fonts.css).
  fraunces: { family: "'Fraunces Variable'", load: all() },

  // Scripts
  pinyon: { family: "'Pinyon Script'", load: all(() => import('@fontsource/pinyon-script/400.css')) },
  allura: { family: "'Allura'", load: all(() => import('@fontsource/allura/400.css')) },
  greatVibes: { family: "'Great Vibes'", load: all(() => import('@fontsource/great-vibes/400.css')) },
  italianno: { family: "'Italianno'", load: all(() => import('@fontsource/italianno/400.css')) },
  parisienne: { family: "'Parisienne'", load: all(() => import('@fontsource/parisienne/400.css')) },
  meaCulpa: { family: "'Mea Culpa'", load: all(() => import('@fontsource/mea-culpa/400.css')) },
  sacramento: { family: "'Sacramento'", load: all(() => import('@fontsource/sacramento/400.css')) },
  birthstone: { family: "'Birthstone'", load: all(() => import('@fontsource/birthstone/400.css')) },
  playball: { family: "'Playball'", load: all(() => import('@fontsource/playball/400.css')) },
  alexBrush: { family: "'Alex Brush'", load: all(() => import('@fontsource/alex-brush/400.css')) },

  // Reading text
  manrope: { family: "'Manrope'", load: all(() => import('@fontsource/manrope/400.css'), () => import('@fontsource/manrope/500.css'), () => import('@fontsource/manrope/600.css')) },
  dmSans: { family: "'DM Sans'", load: all(() => import('@fontsource/dm-sans/400.css'), () => import('@fontsource/dm-sans/500.css'), () => import('@fontsource/dm-sans/600.css')) },
  figtree: { family: "'Figtree'", load: all(() => import('@fontsource/figtree/400.css'), () => import('@fontsource/figtree/500.css'), () => import('@fontsource/figtree/600.css')) },
  outfit: { family: "'Outfit'", load: all(() => import('@fontsource/outfit/400.css'), () => import('@fontsource/outfit/500.css'), () => import('@fontsource/outfit/600.css')) },
  workSans: { family: "'Work Sans'", load: all(() => import('@fontsource/work-sans/400.css'), () => import('@fontsource/work-sans/500.css'), () => import('@fontsource/work-sans/600.css')) },
  lato: { family: "'Lato'", load: all(() => import('@fontsource/lato/400.css'), () => import('@fontsource/lato/700.css')) },
  karla: { family: "'Karla'", load: all(() => import('@fontsource/karla/400.css'), () => import('@fontsource/karla/500.css'), () => import('@fontsource/karla/600.css')) },
  hanken: { family: "'Hanken Grotesk'", load: all(() => import('@fontsource/hanken-grotesk/400.css'), () => import('@fontsource/hanken-grotesk/500.css'), () => import('@fontsource/hanken-grotesk/600.css')) },
  inter: { family: "'Inter'", load: all(() => import('@fontsource/inter/400.css'), () => import('@fontsource/inter/500.css'), () => import('@fontsource/inter/600.css')) },
  montserrat: { family: "'Montserrat'", load: all(() => import('@fontsource/montserrat/400.css'), () => import('@fontsource/montserrat/500.css'), () => import('@fontsource/montserrat/600.css')) },
} satisfies Record<string, FontFile>

type FontId = keyof typeof FONTS

export interface FontKit {
  /** Section titles and numbers. */
  display: FontId
  /** The couple's names on the cover. */
  name: FontId
  /** Reading text. */
  body: FontId
  /** How section titles are set: serif (as drawn), caps (small spaced capitals), italic. */
  title: 'serif' | 'caps' | 'italic'
  /** The name font has no real italic, so the "serif" name style stays upright. */
  upright?: boolean
  /** Letter spacing for names set in capitals (em). Heavier faces want less. */
  capsTracking?: number
}

export const KITS = {
  'pinyon-cormorant': { display: 'cormorant', name: 'pinyon', body: 'jost', title: 'serif' },
  'allura-newsreader': { display: 'newsreader', name: 'allura', body: 'hanken', title: 'italic' },
  'bodoni-manrope': { display: 'bodoni', name: 'bodoni', body: 'manrope', title: 'caps' },
  'greatvibes-playfair': { display: 'playfair', name: 'greatVibes', body: 'figtree', title: 'serif' },
  'ebgaramond-lato': { display: 'ebGaramond', name: 'ebGaramond', body: 'lato', title: 'italic' },
  'cinzel-work': { display: 'cinzel', name: 'cinzel', body: 'workSans', title: 'caps', upright: true },
  'italianno-caslon': { display: 'caslon', name: 'italianno', body: 'dmSans', title: 'serif', upright: true },
  'parisienne-prata': { display: 'prata', name: 'parisienne', body: 'outfit', title: 'serif', upright: true },
  'marcellus-karla': { display: 'marcellus', name: 'marcellus', body: 'karla', title: 'caps', upright: true },
  'cormorant-forum': { display: 'forum', name: 'cormorant', body: 'workSans', title: 'serif' },
  'meaculpa-bellefair': { display: 'bellefair', name: 'meaCulpa', body: 'karla', title: 'serif', upright: true },
  'lora-hanken': { display: 'lora', name: 'lora', body: 'hanken', title: 'serif' },
  'sacramento-infant': { display: 'cormorantInfant', name: 'sacramento', body: 'figtree', title: 'italic' },
  'birthstone-playfair': { display: 'playfair', name: 'birthstone', body: 'dmSans', title: 'serif' },
  'instrument-inter': { display: 'instrument', name: 'instrument', body: 'inter', title: 'italic' },
  'fraunces-outfit': { display: 'fraunces', name: 'fraunces', body: 'outfit', title: 'serif' },
  'tenor-montserrat': { display: 'tenor', name: 'tenor', body: 'montserrat', title: 'caps', upright: true },
  'abril-outfit': { display: 'dmSerif', name: 'abril', body: 'outfit', title: 'serif', upright: true, capsTracking: 0.05 },
  'playball-dmserif': { display: 'dmSerif', name: 'playball', body: 'karla', title: 'italic' },
  'alexbrush-jost': { display: 'playfair', name: 'alexBrush', body: 'jost', title: 'serif' },
  'josefin-karla': { display: 'josefin', name: 'josefin', body: 'karla', title: 'caps', upright: true },
  'jost-figtree': { display: 'jost', name: 'jost', body: 'figtree', title: 'caps', upright: true },
  'gilda-dmsans': { display: 'gilda', name: 'gilda', body: 'dmSans', title: 'serif', upright: true },
  'newsreader-lato': { display: 'newsreader', name: 'newsreader', body: 'lato', title: 'serif' },
  'cormorant-dmsans': { display: 'cormorant', name: 'cormorant', body: 'dmSans', title: 'italic' },
  'italiana-jost': { display: 'italiana', name: 'italiana', body: 'jost', title: 'caps', upright: true },
} as const satisfies Record<string, FontKit>

export type KitId = keyof typeof KITS

export function getKit(id: KitId | undefined): FontKit {
  return (id && KITS[id]) || KITS['pinyon-cormorant']
}

const fam = (id: FontId) => FONTS[id].family

/** CSS variables for one kit. Set on the invitation's wrapper, every section picks them up. */
export function kitStyle(kit: FontKit): CSSProperties {
  return {
    '--font-display': `${fam(kit.display)}, Georgia, serif`,
    '--font-display-alt': `${fam(kit.display)}, Georgia, serif`,
    '--font-body': `${fam(kit.body)}, 'Helvetica Neue', sans-serif`,
    '--iv-name-font': `${fam(kit.name)}, ${fam(kit.display)}, Georgia, serif`,
    fontFamily: `${fam(kit.body)}, 'Helvetica Neue', sans-serif`,
  } as CSSProperties
}

const loaded = new Set<FontId>()

/** Downloads the fonts of a kit (once). Safe to call again and again. */
export function loadKit(kit: FontKit): void {
  for (const id of new Set([kit.display, kit.name, kit.body])) {
    if (loaded.has(id)) continue
    loaded.add(id)
    FONTS[id].load().catch(() => loaded.delete(id))
  }
}
