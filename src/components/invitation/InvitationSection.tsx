import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export function InvitationSection({
  id,
  eyebrow,
  title,
  children,
  className,
}: {
  id?: string
  eyebrow?: string
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cn('mx-auto max-w-xl px-6 py-14 text-center', className)}>
      {eyebrow && <p className="text-xs tracking-[0.2em] text-gold">{eyebrow}</p>}
      {title && <h2 className="mt-2 font-display text-3xl text-ink">{title}</h2>}
      <div className={cn(title || eyebrow ? 'mt-6' : undefined)}>{children}</div>
    </section>
  )
}
