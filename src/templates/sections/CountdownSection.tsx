import type { WeddingInvitation } from '@/types'
import { formatDate, formatTime } from '@/utils/format'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { CountdownDisplay } from '@/components/invitation/CountdownDisplay'
import { SaveAndShare } from '@/components/invitation/SaveAndShare'
import { ScratchReveal } from '@/components/invitation/ScratchReveal'
import { useDesign } from '@/templates/DesignContext'
import { useDateGate } from '@/templates/DateGate'
import { variantFor } from '@/templates/designs'
import type { CSSProperties } from 'react'

/** SECTION 2: Date & countdown. The date in large type (or scratched off), the countdown, Save the Date. */
export function CountdownSection({ invitation }: { invitation: WeddingInvitation }) {
  const { design, event } = useDesign()
  const gate = useDateGate()
  const onBand = variantFor(design, 'countdown') === 'band'
  const time = formatTime(invitation.weddingTime)

  const dateLine = (
    <>
      <p className="font-display text-3xl leading-tight text-[color:var(--iv-ink)]">{formatDate(invitation.weddingDate)}</p>
      {time && <p className="mt-1 text-sm uppercase tracking-[0.25em] text-[color:var(--iv-ink)] opacity-75">{time}</p>}
    </>
  )

  // On a light section the tiles use the dark ink; on a colour band they use the readable light/dark text.
  const tileColours = onBand ? undefined : ({ '--iv-on-main': 'var(--iv-ink)' } as CSSProperties)

  return (
    <InvitationSection
      id="countdown"
      eyebrow={event.countdown.eyebrow}
      title={design.scratchDate && gate.hidden ? 'Scratch To Reveal' : event.countdown.title}
    >
      <div className="flex flex-col gap-8">
        {design.scratchDate ? (
          <ScratchReveal onRevealed={gate.reveal}>{dateLine}</ScratchReveal>
        ) : (
          <div className={onBand ? 'rounded-md bg-[color:var(--iv-paper)] px-4 py-6' : undefined}>{dateLine}</div>
        )}
        {!gate.hidden && (
          <>
            <div style={tileColours}>
              <CountdownDisplay weddingDate={invitation.weddingDate} />
            </div>
            <SaveAndShare invitation={invitation} onBand={onBand} />
          </>
        )}
      </div>
    </InvitationSection>
  )
}
