import type { ReactNode } from 'react'
import type { WeddingInvitation } from '@/types'
import { formatDate } from '@/utils/format'
import { DoorPlaceholder, HeroInvitationPlaceholder } from '@/components/ui/Placeholder'
import { cn } from '@/utils/cn'

export type CoverTone = 'royal' | 'garden' | 'storybook' | 'modern' | 'heritage' | 'classic'

const toneStyles: Record<CoverTone, { bg: string; text: string; accent: string; useDoor: boolean }> = {
  royal: { bg: 'bg-wine', text: 'text-ivory', accent: 'text-gold', useDoor: true },
  garden: { bg: 'bg-ivory-deep', text: 'text-ink', accent: 'text-sage', useDoor: false },
  storybook: { bg: 'bg-[#F3EDE1]', text: 'text-ink', accent: 'text-gold', useDoor: false },
  modern: { bg: 'bg-ink', text: 'text-ivory', accent: 'text-gold', useDoor: false },
  heritage: { bg: 'bg-[#3B1F0E]', text: 'text-ivory', accent: 'text-[#D9A441]', useDoor: true },
  classic: { bg: 'bg-ivory', text: 'text-ink', accent: 'text-gold', useDoor: false },
}

export function TemplateCover({
  invitation,
  tone,
  eyebrow,
  children,
}: {
  invitation: WeddingInvitation
  tone: CoverTone
  eyebrow: string
  children?: ReactNode
}) {
  const style = toneStyles[tone]

  return (
    <div className={cn('flex flex-col items-center gap-6 px-6 py-20 text-center', style.bg, style.text)}>
      <p className={cn('text-xs tracking-[0.3em]', style.accent)}>{eyebrow}</p>

      {style.useDoor ? (
        <DoorPlaceholder className="w-48" />
      ) : (
        <HeroInvitationPlaceholder className="w-56" />
      )}

      <h1 className="font-display text-4xl sm:text-5xl">
        {invitation.brideName} <span className={style.accent}>&amp;</span> {invitation.groomName}
      </h1>
      <p className="text-sm opacity-80">{formatDate(invitation.weddingDate)}</p>
      {children}
    </div>
  )
}
