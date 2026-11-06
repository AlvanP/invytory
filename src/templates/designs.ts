import type { SectionId } from './sections'
import type { KitId } from './fontKits'

/**
 * One entry per template: its colour, cover, lettering, motif and the rhythm of its
 * sections. Everything else (what the sections show, their order) is shared, so all
 * templates stay arranged the same way. To restyle a template, edit its entry here.
 */
export type SectionVariant = 'plain' | 'soft' | 'band'

/**
 * arch = photo in an arch; full = full-width photo with dark overlay; stacked = photo on top, names on a colour block;
 * print = a framed photograph with a white mat, names beneath; medallion = round photo with a double ring;
 * split = photo beside the names (stacked on a phone); poster = full-bleed photo, names set low and left.
 * The last four need a hero photo; without one they fall back to stacked.
 */
export type CoverStyle =
  | 'arch' | 'full' | 'stacked' | 'print' | 'medallion' | 'split' | 'poster'
  | 'monogram' | 'frame' | 'magazine' | 'window' | 'veil'

/**
 * The colour of the cover itself.
 * colour = the couple's colour; paper = light paper with dark writing (clean, like fine stationery);
 * deep = a very dark shade of the couple's colour; ink = near-black; tint = a pale wash of the colour.
 */
export type ToneStyle = 'colour' | 'paper' | 'deep' | 'ink' | 'tint'

/** How a section opens: motif = eyebrow, drawing and title; hairline = a short rule, eyebrow and title; plain = eyebrow and title only. */
export type HeadStyle = 'motif' | 'hairline' | 'plain'

/** script = flowing wedding script; serif = elegant serif; caps = spaced capitals. */
export type NameStyle = 'script' | 'serif' | 'caps'

/** The drawing used for dividers (and corners, for floral and leaf). */
export type Motif = 'floral' | 'leaf' | 'uli' | 'adire' | 'arabesque' | 'minimal' | 'dove' | 'star' | 'confetti' | 'lines' | 'lily'

/**
 * How the body sections (everything after the cover) are laid out.
 * centered = the classic centred stack of cards; framed = each section inside a fine double frame;
 * editorial = left-aligned like a magazine page, flat rows with hairlines, a drop cap in the story;
 * ledger = the title sits in a left column and the content in a wider right column (stacked on a phone).
 */
export type BodyStyle = 'centered' | 'framed' | 'editorial' | 'ledger'

export interface TemplateDesign {
  /** Layout of the body sections. Defaults to centered. */
  body?: BodyStyle
  /** The design's own colour of the day, used until the couple picks one. */
  colour: string
  /** The page colour behind everything (a warm or cool white). */
  paper: string
  /** The lettering: one family for titles, one for names, one for reading text. */
  kit: KitId
  /** Colour of the cover. */
  coverTone: ToneStyle
  /** Colour of the blocks of colour further down the page (bands). */
  bandTone: Exclude<ToneStyle, 'paper'>
  /** How each section opens. */
  head: HeadStyle
  cover: CoverStyle
  names: NameStyle
  motif: Motif
  /** The date is hidden under gold to scratch off (the white wedding Classic Elegance design). */
  scratchDate?: boolean
  /** Which sections are blocks of colour (band), a soft tint (soft) or plain paper. */
  rhythm?: Partial<Record<SectionId, SectionVariant>>
}

export const DEFAULT_RHYTHM: Record<SectionId, SectionVariant> = {
  cover: 'band',
  countdown: 'soft',
  details: 'plain',
  venue: 'soft',
  dresscode: 'plain',
  story: 'soft',
  moment: 'plain',
  gallery: 'soft',
  rsvp: 'band',
  wall: 'soft',
  album: 'band',
  gifts: 'plain',
  footer: 'band',
}

export const designs: Record<string, TemplateDesign> = {
  // ── White wedding ───────────────────────────────────────────────
  'classic-elegance': { colour: '#9A7B4A', paper: '#FBF7EF', kit: 'pinyon-cormorant', coverTone: 'colour', bandTone: 'colour', head: 'motif', body: 'framed', cover: 'arch', names: 'script', motif: 'floral', scratchDate: true },
  'garden-romance': { colour: '#6F8A5F', paper: '#F6F8F1', kit: 'allura-newsreader', coverTone: 'paper', bandTone: 'tint', head: 'plain', body: 'centered', cover: 'veil', names: 'script', motif: 'leaf', rhythm: { countdown: 'plain', details: 'soft', venue: 'plain', dresscode: 'soft' } },
  'modern-luxury': { colour: '#2A2623', paper: '#F4F1EC', kit: 'bodoni-manrope', coverTone: 'paper', bandTone: 'ink', head: 'hairline', body: 'editorial', cover: 'magazine', names: 'caps', motif: 'minimal', rhythm: { countdown: 'plain', details: 'soft', venue: 'plain', dresscode: 'soft', story: 'plain', moment: 'soft', gallery: 'plain' } },

  // ── Igbo ────────────────────────────────────────────────────────
  'igbo-design-1': { colour: '#C4472D', paper: '#FBF3EC', kit: 'greatvibes-playfair', coverTone: 'colour', bandTone: 'colour', head: 'motif', body: 'framed', cover: 'poster', names: 'script', motif: 'uli', rhythm: { countdown: 'band' } },
  'igbo-design-2': { colour: '#5A2A1C', paper: '#F8EFE6', kit: 'ebgaramond-lato', coverTone: 'deep', bandTone: 'deep', head: 'motif', body: 'ledger', cover: 'medallion', names: 'serif', motif: 'uli', rhythm: { details: 'soft', venue: 'plain', dresscode: 'soft' } },
  'african-royal': { colour: '#A3201F', paper: '#FAF2EE', kit: 'cinzel-work', coverTone: 'ink', bandTone: 'ink', head: 'hairline', body: 'editorial', cover: 'window', names: 'caps', motif: 'uli', rhythm: { countdown: 'band', story: 'plain', moment: 'soft', gallery: 'plain' } },

  // ── Yoruba ──────────────────────────────────────────────────────
  'yoruba-design-1': { colour: '#1F3FA6', paper: '#F4F6FB', kit: 'italianno-caslon', coverTone: 'colour', bandTone: 'colour', head: 'motif', body: 'ledger', cover: 'split', names: 'script', motif: 'adire', rhythm: { countdown: 'band' } },
  'yoruba-design-2': { colour: '#5B2A86', paper: '#F8F4FB', kit: 'parisienne-prata', coverTone: 'deep', bandTone: 'tint', head: 'motif', body: 'framed', cover: 'print', names: 'script', motif: 'adire', rhythm: { details: 'soft', venue: 'plain', dresscode: 'soft' } },
  'royal-door': { colour: '#14264F', paper: '#F3F5F9', kit: 'marcellus-karla', coverTone: 'colour', bandTone: 'deep', head: 'hairline', body: 'editorial', cover: 'stacked', names: 'serif', motif: 'adire', rhythm: { countdown: 'band', story: 'plain', moment: 'soft', gallery: 'plain' } },

  // ── Hausa ───────────────────────────────────────────────────────
  'hausa-design-1': { colour: '#0B6B4B', paper: '#F5F4EC', kit: 'cormorant-forum', coverTone: 'colour', bandTone: 'ink', head: 'motif', body: 'framed', cover: 'medallion', names: 'serif', motif: 'arabesque', rhythm: { countdown: 'band' } },
  'hausa-design-2': { colour: '#8E1B34', paper: '#FBF3F2', kit: 'meaculpa-bellefair', coverTone: 'paper', bandTone: 'colour', head: 'plain', body: 'centered', cover: 'frame', names: 'script', motif: 'arabesque', rhythm: { details: 'soft', venue: 'plain', dresscode: 'soft' } },
  storybook: { colour: '#12727A', paper: '#F3F8F7', kit: 'lora-hanken', coverTone: 'paper', bandTone: 'tint', head: 'hairline', body: 'ledger', cover: 'window', names: 'serif', motif: 'arabesque', rhythm: { story: 'plain', moment: 'soft', gallery: 'plain' } },

  // ── Child dedication ────────────────────────────────────────────
  'dedication-heavenly-blue': { colour: '#4F7FA6', paper: '#F4F8FB', kit: 'sacramento-infant', coverTone: 'colour', bandTone: 'tint', head: 'plain', body: 'centered', cover: 'full', names: 'script', motif: 'dove', rhythm: { countdown: 'plain', details: 'soft', venue: 'plain', dresscode: 'soft' } },
  'dedication-blush-blessing': { colour: '#B9788A', paper: '#FCF3F2', kit: 'birthstone-playfair', coverTone: 'tint', bandTone: 'colour', head: 'motif', body: 'framed', cover: 'frame', names: 'script', motif: 'floral', rhythm: { details: 'soft', venue: 'plain', dresscode: 'soft' } },
  'dedication-golden-grace': { colour: '#946F27', paper: '#FAF5EA', kit: 'instrument-inter', coverTone: 'paper', bandTone: 'deep', head: 'hairline', body: 'editorial', cover: 'print', names: 'serif', motif: 'star', rhythm: { countdown: 'plain', details: 'soft', venue: 'plain', story: 'plain', moment: 'soft', gallery: 'plain' } },
  'dedication-little-lamb': { colour: '#6E8F78', paper: '#F5F8F4', kit: 'fraunces-outfit', coverTone: 'tint', bandTone: 'colour', head: 'plain', body: 'centered', cover: 'arch', names: 'serif', motif: 'leaf', rhythm: { countdown: 'band', details: 'soft', venue: 'plain', dresscode: 'soft' } },
  'dedication-royal-heritage': { colour: '#2F3E73', paper: '#F4F5FA', kit: 'tenor-montserrat', coverTone: 'deep', bandTone: 'ink', head: 'hairline', body: 'ledger', cover: 'poster', names: 'caps', motif: 'adire', rhythm: { countdown: 'band', story: 'plain', moment: 'soft', gallery: 'plain' } },

  // ── Birthday ────────────────────────────────────────────────────
  'birthday-confetti-pop': { colour: '#D2452A', paper: '#FFF6EE', kit: 'abril-outfit', coverTone: 'colour', bandTone: 'colour', head: 'plain', body: 'ledger', cover: 'veil', names: 'caps', motif: 'confetti', rhythm: { countdown: 'band', details: 'soft', venue: 'plain' } },
  'birthday-golden-hour': { colour: '#A97C1F', paper: '#FBF6EA', kit: 'playball-dmserif', coverTone: 'paper', bandTone: 'deep', head: 'motif', body: 'framed', cover: 'monogram', names: 'script', motif: 'star', rhythm: { countdown: 'plain', details: 'soft', venue: 'plain', dresscode: 'soft' } },
  'birthday-midnight-party': { colour: '#1D2147', paper: '#F3F3F8', kit: 'alexbrush-jost', coverTone: 'ink', bandTone: 'ink', head: 'hairline', body: 'editorial', cover: 'magazine', names: 'script', motif: 'star', rhythm: { countdown: 'band', story: 'plain', moment: 'soft', gallery: 'plain' } },

  // ── Corporate ───────────────────────────────────────────────────
  'corporate-boardroom': { colour: '#1F2A44', paper: '#F5F6F8', kit: 'josefin-karla', coverTone: 'paper', bandTone: 'ink', head: 'hairline', body: 'editorial', cover: 'frame', names: 'caps', motif: 'lines', rhythm: { countdown: 'plain', details: 'soft', venue: 'plain', dresscode: 'soft', story: 'plain', moment: 'soft', gallery: 'plain' } },
  'corporate-summit': { colour: '#0F5E5A', paper: '#F3F7F7', kit: 'jost-figtree', coverTone: 'deep', bandTone: 'deep', head: 'hairline', body: 'ledger', cover: 'split', names: 'caps', motif: 'lines', rhythm: { countdown: 'band', details: 'soft', venue: 'plain' } },
  'corporate-gala': { colour: '#2B2926', paper: '#F6F3EE', kit: 'gilda-dmsans', coverTone: 'ink', bandTone: 'ink', head: 'motif', body: 'framed', cover: 'monogram', names: 'serif', motif: 'minimal', rhythm: { countdown: 'band', details: 'soft', venue: 'plain', dresscode: 'soft' } },

  // ── Funeral ─────────────────────────────────────────────────────
  'funeral-serene': { colour: '#4A5A6A', paper: '#F4F5F6', kit: 'newsreader-lato', coverTone: 'deep', bandTone: 'tint', head: 'plain', body: 'editorial', cover: 'full', names: 'serif', motif: 'lily', rhythm: { details: 'soft', venue: 'plain', dresscode: 'soft', story: 'plain', moment: 'soft', gallery: 'plain' } },
  'funeral-life-celebrated': { colour: '#5F7561', paper: '#F5F6F2', kit: 'cormorant-dmsans', coverTone: 'tint', bandTone: 'tint', head: 'plain', body: 'centered', cover: 'print', names: 'serif', motif: 'leaf', rhythm: { details: 'soft', venue: 'plain', dresscode: 'soft' } },
  'funeral-white-lily': { colour: '#3E3E46', paper: '#F6F6F7', kit: 'italiana-jost', coverTone: 'paper', bandTone: 'ink', head: 'motif', body: 'framed', cover: 'medallion', names: 'serif', motif: 'dove', rhythm: { details: 'soft', venue: 'plain', dresscode: 'soft', story: 'plain', moment: 'soft', gallery: 'plain' } },
}

const FALLBACK: TemplateDesign = designs['classic-elegance']

export function getDesign(templateId: string | undefined): TemplateDesign {
  return (templateId && designs[templateId.toLowerCase()]) || FALLBACK
}

export function variantFor(design: TemplateDesign, id: SectionId): SectionVariant {
  return design.rhythm?.[id] ?? DEFAULT_RHYTHM[id]
}
