import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useDesign } from '@/templates/DesignContext'
import { variantFor, type SectionVariant } from '@/templates/designs'
import type { SectionId } from '@/templates/sections'
import { MotifDivider, MotifCorner } from '@/components/invitation/Motifs'
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
  const nameFont = design.names === 'script' ? 'font-display' : design.names === 'caps' ? 'font-body font-semibold uppercase tracking-[0.12em]' : 'font-display'

  return (
    <section
      id={id}
      data-section={id}
      className={cn('relative w-full overflow-hidden bg-cover bg-center', c.bg, className)}
      style={pieces.bg ? { backgroundImage: `url(${pieces.bg})` } : undefined}
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
      <div className="relative mx-auto max-w-xl px-6 py-20 text-center">
        <RevealOnScroll>
          {eyebrow && <p className={cn('text-[11px] font-medium uppercase tracking-[0.32em]', c.eyebrow)}>{eyebrow}</p>}
          {pieces.divider ? (
            <img src={pieces.divider} alt="" aria-hidden className="mx-auto my-4 h-8 w-auto" />
          ) : (
            <MotifDivider motif={design.motif} className={cn('mx-auto my-4', c.motif)} />
          )}
          {title && <h2 className={cn(design.names === 'caps' ? 'text-3xl' : 'text-4xl', 'leading-tight', nameFont, c.title)}>{title}</h2>}
          <div className={cn(title || eyebrow ? 'mt-9' : undefined)}>{children}</div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
