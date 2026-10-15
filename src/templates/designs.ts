import type { SectionId } from './sections'

/**
 * One entry per template: its colour, cover, lettering, motif and the rhythm of its
 * sections. Everything else (what the sections show, their order) is shared, so all
 * templates stay arranged the same way. To restyle a template, edit its entry here.
 */
export type SectionVariant = 'plain' | 'soft' | 'band'

/** arch = photo in an arch; full = full-width photo with dark overlay; stacked = photo on top, names on a colour block. */
export type CoverStyle = 'arch' | 'full' | 'stacked'

/** script = flowing wedding script; serif = elegant serif; caps = spaced capitals. */
export type NameStyle = 'script' | 'serif' | 'caps'

/** The drawing used for dividers (and corners, for floral and leaf). */
export type Motif = 'floral' | 'leaf' | 'uli' | 'adire' | 'arabesque' | 'minimal'

export interface TemplateDesign {
  /** The design's own colour of the day, used until the couple picks one. */
  colour: string
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
  gifts: 'plain',
  footer: 'band',
}

export const designs: Record<string, TemplateDesign> = {
  // ── White wedding ───────────────────────────────────────────────
  'classic-elegance': { colour: '#9A7B4A', cover: 'arch', names: 'script', motif: 'floral', scratchDate: true },
  'garden-romance': { colour: '#6F8A5F', cover: 'full', names: 'script', motif: 'leaf', rhythm: { countdown: 'plain', details: 'soft', venue: 'plain', dresscode: 'soft' } },
  'modern-luxury': { colour: '#2A2623', cover: 'stacked', names: 'caps', motif: 'minimal', rhythm: { countdown: 'plain', details: 'soft', venue: 'plain', dresscode: 'soft', story: 'plain', moment: 'soft', gallery: 'plain' } },

  // ── Igbo ────────────────────────────────────────────────────────
  'igbo-design-1': { colour: '#C4472D', cover: 'full', names: 'script', motif: 'uli', rhythm: { countdown: 'band' } },
  'igbo-design-2': { colour: '#5A2A1C', cover: 'arch', names: 'serif', motif: 'uli', rhythm: { details: 'soft', venue: 'plain', dresscode: 'soft' } },
  'african-royal': { colour: '#A3201F', cover: 'stacked', names: 'caps', motif: 'uli', rhythm: { countdown: 'band', story: 'plain', moment: 'soft', gallery: 'plain' } },

  // ── Yoruba ──────────────────────────────────────────────────────
  'yoruba-design-1': { colour: '#1F3FA6', cover: 'full', names: 'script', motif: 'adire', rhythm: { countdown: 'band' } },
  'yoruba-design-2': { colour: '#5B2A86', cover: 'arch', names: 'script', motif: 'adire', rhythm: { details: 'soft', venue: 'plain', dresscode: 'soft' } },
  'royal-door': { colour: '#14264F', cover: 'stacked', names: 'serif', motif: 'adire', rhythm: { countdown: 'band', story: 'plain', moment: 'soft', gallery: 'plain' } },

  // ── Hausa ───────────────────────────────────────────────────────
  'hausa-design-1': { colour: '#0B6B4B', cover: 'full', names: 'serif', motif: 'arabesque', rhythm: { countdown: 'band' } },
  'hausa-design-2': { colour: '#8E1B34', cover: 'arch', names: 'script', motif: 'arabesque', rhythm: { details: 'soft', venue: 'plain', dresscode: 'soft' } },
  storybook: { colour: '#12727A', cover: 'stacked', names: 'serif', motif: 'arabesque', rhythm: { story: 'plain', moment: 'soft', gallery: 'plain' } },
}

const FALLBACK: TemplateDesign = designs['classic-elegance']

export function getDesign(templateId: string | undefined): TemplateDesign {
  return (templateId && designs[templateId.toLowerCase()]) || FALLBACK
}

export function variantFor(design: TemplateDesign, id: SectionId): SectionVariant {
  return design.rhythm?.[id] ?? DEFAULT_RHYTHM[id]
}
