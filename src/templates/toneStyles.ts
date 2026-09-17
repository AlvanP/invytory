import type { CoverTone } from './TemplateCover'

export interface ToneStyle {
  eyebrowClass: string
  titleClass: string
  ornament: 'diamond' | 'leaf' | 'pattern' | 'line' | 'rule' | 'quote'
  ornamentColorClass: string
  /** Optional border/frame treatment wrapped around section content —
   * this is what actually differs the "layout", not just color. */
  frameClass?: string
}

export const toneStyles: Record<CoverTone, ToneStyle> = {
  royal: {
    eyebrowClass: 'text-xs tracking-[0.35em] text-gold',
    titleClass: 'font-display italic text-3xl text-ink',
    ornament: 'diamond',
    ornamentColorClass: 'text-gold',
  },
  garden: {
    eyebrowClass: 'text-[11px] font-medium uppercase tracking-[0.3em] text-sage',
    titleClass: 'font-display text-3xl font-normal tracking-wide text-ink',
    ornament: 'leaf',
    ornamentColorClass: 'text-sage',
    frameClass: 'rounded-md border border-sage/25 px-6 py-6',
  },
  storybook: {
    eyebrowClass: 'font-display italic text-lg text-gold',
    titleClass: 'font-display text-3xl text-ink',
    ornament: 'quote',
    ornamentColorClass: 'text-gold',
    frameClass: 'border-2 border-double border-gold/40 px-8 py-6',
  },
  modern: {
    eyebrowClass: 'text-[11px] uppercase tracking-[0.4em] text-ink-soft',
    titleClass: 'font-body text-xl font-semibold uppercase tracking-[0.15em] text-ink',
    ornament: 'line',
    ornamentColorClass: 'text-ink',
  },
  heritage: {
    eyebrowClass: 'text-xs font-semibold uppercase tracking-[0.25em] text-[#B8792E]',
    titleClass: 'font-display text-3xl text-ink',
    ornament: 'pattern',
    ornamentColorClass: 'text-[#B8792E]',
    frameClass: 'border-t-4 border-b-4 border-[#B8792E]/50 py-6',
  },
  classic: {
    eyebrowClass: 'text-xs font-medium uppercase tracking-[0.3em] text-gold',
    titleClass: 'font-[family-name:var(--font-display-alt)] text-3xl font-medium text-ink',
    ornament: 'rule',
    ornamentColorClass: 'text-gold',
    frameClass: 'border-y border-ink/15 py-6',
  },
}