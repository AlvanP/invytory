import { Gift } from 'lucide-react'
import type { WeddingInvitation } from '@/types'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { useDesign } from '@/templates/DesignContext'
import { DetailCard } from './DetailCard'

/** SECTION 10: Gifts & notes. */
export function GiftsSection({ invitation }: { invitation: WeddingInvitation }) {
  const { event } = useDesign()
  return (
    <InvitationSection id="gifts" eyebrow={event.gifts.eyebrow} title={event.gifts.title}>
      <div className="flex flex-col gap-4 text-base text-[color:var(--iv-ink)]">
        {invitation.giftInformation && (
          <DetailCard icon={<Gift className="size-5" />} label={event.giftLabel}>
            {invitation.giftInformation}
          </DetailCard>
        )}
        {invitation.additionalMessage && <p className="leading-relaxed">{invitation.additionalMessage}</p>}
      </div>
    </InvitationSection>
  )
}
