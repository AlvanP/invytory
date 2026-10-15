import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import type { CoverTone } from '@/templates/TemplateCover'
import { toneStyles } from '@/templates/toneStyles'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'

function SectionOrnament({ type, colorClass }: { type: 'diamond' | 'leaf' | 'pattern' | 'line' | 'rule' | 'quote'; colorClass: string }) {
  switch (type) {
    case 'diamond':
      return (
        <svg width="44" height="12" viewBox="0 0 44 12" className={cn('mx-auto my-4', colorClass)} fill="none">
          <line x1="0" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="1" />
          <rect x="19" y="3" width="6" height="6" transform="rotate(45 22 6)" fill="currentColor" />
          <line x1="28" y1="6" x2="44" y2="6" stroke="currentColor" strokeWidth="1" />
        </svg>
      )
    case 'leaf':
      return (
        <svg width="36" height="16" viewBox="0 0 36 16" className={cn('mx-auto my-4', colorClass)} fill="none">
          <path d="M18 2C11 2 4 6 2 8C4 10 11 14 18 14C25 14 32 10 34 8C32 6 25 2 18 2Z" stroke="currentColor" strokeWidth="1" />
          <line x1="2" y1="8" x2="34" y2="8" stroke="currentColor" strokeWidth="0.75" />
        </svg>
      )
    case 'pattern':
      return (
        <svg width="64" height="10" viewBox="0 0 64 10" className={cn('mx-auto my-4', colorClass)} fill="currentColor">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M${i * 11} 10 L${i * 11 + 5.5} 0 L${i * 11 + 11} 10 Z`} opacity={0.85} />
          ))}
        </svg>
      )
    case 'line':
      return <div className={cn('mx-auto my-4 h-px w-10', colorClass.replace('text-', 'bg-'))} />
    case 'quote':
      return <div className={cn('mx-auto my-2 font-display text-2xl leading-none', colorClass)}>&#10087;</div>
    case 'rule':
    default:
      return (
        <svg width="44" height="6" viewBox="0 0 44 6" className={cn('mx-auto my-4', colorClass)} fill="none">
          <line x1="0" y1="1" x2="44" y2="1" stroke="currentColor" strokeWidth="0.5" />
          <line x1="12" y1="5" x2="32" y2="5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
  }
}

/** Keeps a design's fonts and spacing but drops its fixed colours, so the couple's colour rules. */
function withoutTextColour(classes: string): string {
  return classes
    .split(' ')
    .filter((c) => !/^text-(ink|gold|sage|ink-soft|\[#[0-9A-Fa-f]+\])$/.test(c))
    .join(' ')
}

export type SectionVariant = 'plain' | 'soft' | 'band'

const sectionColours: Record<SectionVariant, { bg: string; eyebrow: string; title: string; ornament: string }> = {
  plain: {
    bg: 'bg-[color:var(--iv-paper)]',
    eyebrow: 'text-[color:var(--iv-accent)]',
    title: 'text-[color:var(--iv-ink)]',
    ornament: 'text-[color:var(--iv-accent)]',
  },
  soft: {
    bg: 'bg-[color:var(--iv-soft)]',
    eyebrow: 'text-[color:var(--iv-accent)]',
    title: 'text-[color:var(--iv-ink)]',
    ornament: 'text-[color:var(--iv-accent)]',
  },
  // A block of the couple's colour. Everything on it uses the readable text colour.
  band: {
    bg: 'bg-[color:var(--iv-main)] text-[color:var(--iv-on-main)]',
    eyebrow: 'text-[color:var(--iv-on-main)]',
    title: 'text-[color:var(--iv-on-main)]',
    ornament: 'text-[color:var(--iv-on-main)]',
  },
}

export function InvitationSection({
  id,
  eyebrow,
  title,
  tone,
  variant = 'plain',
  children,
  className,
}: {
  id?: string
  eyebrow?: string
  title?: string
  tone?: CoverTone
  variant?: SectionVariant
  children: ReactNode
  className?: string
}) {
  const style = tone ? toneStyles[tone] : null
  const colours = sectionColours[variant]

  return (
    <section id={id} className={cn('w-full', colours.bg, className)}>
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <RevealOnScroll>
          {eyebrow && (
            <p className={cn(withoutTextColour(style?.eyebrowClass ?? 'text-xs tracking-[0.2em]'), colours.eyebrow)}>
              {eyebrow}
            </p>
          )}
          {style && <SectionOrnament type={style.ornament} colorClass={colours.ornament} />}
          {title && (
            <h2 className={cn(withoutTextColour(style?.titleClass ?? 'font-display text-3xl'), colours.title, !style && 'mt-2')}>
              {title}
            </h2>
          )}
          <div className={cn(title || eyebrow ? 'mt-8' : undefined)}>{children}</div>
        </RevealOnScroll>
      </div>
    </section>
  )
}