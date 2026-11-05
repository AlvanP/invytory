import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useDesign } from '@/templates/DesignContext'
import { variantFor, type SectionVariant } from '@/templates/designs'
import type { SectionId } from '@/templates/sections'
import { MotifDivider, MotifCorner } from '@/components/invitation/Motifs'
import { getKit } from '@/templates/fontKits'
import { toneVars } from '@/templates/tones'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'

const colours: Record<SectionVariant, { bg: string; eyebrow: string; title: string; motif: string }> = {
  plain: {
    bg: 'bg-[color:var(--iv-paper)]',
    eyebrow: 'text-[color:var(--iv-accent)]',
    title: 'text-[color:var(--iv-ink)]',
    motif: 'text-[color:var(--iv-accent)]',
  },
  soft: {
    bg: 'bg-[color:var(--iv-soft)]',
    eyebrow: 'text-[color:var(--iv-accent)]',
    title: 'text-[color:var(--iv-ink)]',
    motif: 'text-[color:var(--iv-accent)]',
  },
  // A block of the couple's colour. Everything on it uses the readable text colour.
  band: {
    bg: 'bg-[color:var(--iv-main)] text-[color:var(--iv-on-main)]',
    eyebrow: 'text-[color:var(--iv-on-main)]',
    title: 'text-[color:var(--iv-on-main)]',
    motif: 'text-[color:var(--iv-on-main)]',
  },
}

/**
 * The frame every section sits in: its background, a motif divider, an eyebrow and a title.
 * Section artwork (`<id>-bg`, `<id>-divider`, `<id>-corner`) replaces the drawn pieces when present.
 */
export function InvitationSection({
  id,
  eyebrow,
  title,
  children,
  className,
}: {
  id: SectionId
  eyebrow?: string
  title?: string
  children: ReactNode
  className?: string
}) {
  const { design, art } = useDesign()
  const variant = variantFor(design, id)
  const c = colours[variant]
  const pieces = art.sections[id] ?? {}
  const corners = variant !== 'band' && (design.motif === 'floral' || design.motif === 'leaf')
  const body = design.body ?? 'centered'
  const divider = (cls: string) =>
    pieces.divider ? (
      <img src={pieces.divider} alt="" aria-hidden className={cn('h-8 w-auto', cls)} />
    ) : (
      <MotifDivider motif={design.motif} className={cn(c.motif, cls)} />
    )
  const kit = getKit(design.kit)
  const caps = kit.title === 'caps'
  const titleFont = cn('font-display', kit.title === 'italic' && 'italic', caps && 'uppercase tracking-[0.16em]')

  const titleEl = title ? (
    <h2 className={cn(caps ? 'text-[1.7rem] sm:text-3xl' : 'text-4xl', 'leading-tight', titleFont, c.title)}>{title}</h2>
  ) : null

  const showDivider = design.head === 'motif'
  const rule = (center: boolean) =>
    design.head === 'hairline' ? <span aria-hidden className={cn('mb-4 block h-px w-10 bg-current opacity-40', center && 'mx-auto')} /> : null
  const eyebrowEl = eyebrow ? <p className={cn('text-[11px] font-medium uppercase tracking-[0.32em]', design.head === 'plain' && 'mb-3', c.eyebrow)}>{eyebrow}</p> : null
  const bandVars = variant === 'band' ? toneVars(design.bandTone) : undefined

  return (
    <section
      id={id}
      data-section={id}
      className={cn('relative w-full overflow-hidden bg-cover bg-center', c.bg, className)}
      style={{ ...bandVars, ...(pieces.bg ? { backgroundImage: `url(${pieces.bg})` } : {}) }}
    >
      {pieces.corner ? (
        <>
          <img src={pieces.corner} alt="" aria-hidden className="pointer-events-none absolute left-0 top-0 w-28" />
          <img src={pieces.corner} alt="" aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-28 rotate-180" />
        </>
      ) : (
        corners && (
          <>
            <MotifCorner motif={design.motif} className={cn('pointer-events-none absolute left-0 top-0 size-20 opacity-40', c.motif)} />
            <MotifCorner motif={design.motif} className={cn('pointer-events-none absolute bottom-0 right-0 size-20 rotate-180 opacity-40', c.motif)} />
          </>
        )
      )}
      {body === 'ledger' ? (
        <div className="relative mx-auto grid max-w-4xl gap-8 px-6 py-20 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] sm:gap-14 sm:py-24">
          <RevealOnScroll>
            <header className="text-left">
              {rule(false)}{eyebrowEl}
              {showDivider && divider('my-4 !mx-0')}
              {titleEl}
            </header>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="text-left">{children}</div>
          </RevealOnScroll>
        </div>
      ) : body === 'editorial' ? (
        <div className="relative mx-auto max-w-2xl px-6 py-20 text-left sm:py-24">
          <RevealOnScroll>
            <header className="border-t pt-5" style={{ borderColor: 'color-mix(in srgb, currentColor 35%, transparent)' }}>
              {eyebrowEl}
              {titleEl && <div className={cn('mt-3', !caps && '[&>h2]:text-5xl [&>h2]:leading-[1.05]')}>{titleEl}</div>}
            </header>
            <div className={cn(title || eyebrow ? 'mt-10' : undefined)}>{children}</div>
          </RevealOnScroll>
        </div>
      ) : body === 'framed' ? (
        <div className="relative mx-auto max-w-xl px-5 py-16 text-center">
          <RevealOnScroll>
            <div className="relative border p-1.5" style={{ borderColor: 'color-mix(in srgb, currentColor 28%, transparent)' }}>
              <div className="border px-5 py-12" style={{ borderColor: 'color-mix(in srgb, currentColor 28%, transparent)' }}>
                {rule(true)}{eyebrowEl}
                {showDivider && divider('my-4 mx-auto')}
                {titleEl}
                <div className={cn(title || eyebrow ? 'mt-8' : undefined)}>{children}</div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      ) : (
        <div className="relative mx-auto max-w-xl px-6 py-20 text-center">
          <RevealOnScroll>
            {rule(true)}{eyebrowEl}
            {showDivider && divider('mx-auto my-4')}
            {titleEl}
            <div className={cn(title || eyebrow ? 'mt-9' : undefined)}>{children}</div>
          </RevealOnScroll>
        </div>
      )}
    </section>
  )
}
