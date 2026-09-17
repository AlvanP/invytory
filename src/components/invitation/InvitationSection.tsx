import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import type { CoverTone } from '@/templates/TemplateCover'
import { toneStyles } from '@/templates/toneStyles'

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

export function InvitationSection({
  id,
  eyebrow,
  title,
  tone,
  children,
  className,
}: {
  id?: string
  eyebrow?: string
  title?: string
  tone?: CoverTone
  children: ReactNode
  className?: string
}) {
  const style = tone ? toneStyles[tone] : null

  return (
    <section id={id} className={cn('mx-auto max-w-xl px-6 py-14 text-center', className)}>
      <div className={style?.frameClass}>
        {eyebrow && <p className={style?.eyebrowClass ?? 'text-xs tracking-[0.2em] text-gold'}>{eyebrow}</p>}
        {style && <SectionOrnament type={style.ornament} colorClass={style.ornamentColorClass} />}
        {title && <h2 className={cn(style?.titleClass ?? 'font-display text-3xl text-ink', !style && 'mt-2')}>{title}</h2>}
        <div className={cn(title || eyebrow ? 'mt-6' : undefined)}>{children}</div>
      </div>
    </section>
  )
}