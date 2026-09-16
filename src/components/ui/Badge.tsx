import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type Tone = 'confirmed' | 'declined' | 'pending' | 'premium' | 'neutral' | 'draft'

const toneClasses: Record<Tone, string> = {
  confirmed: 'bg-success/10 text-success',
  declined: 'bg-danger/10 text-danger',
  pending: 'bg-gold/15 text-gold',
  premium: 'bg-wine/10 text-wine',
  neutral: 'bg-ink/8 text-ink-soft',
  draft: 'bg-ink/8 text-ink-soft',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xs px-2.5 py-1 text-xs font-medium',
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  )
}
