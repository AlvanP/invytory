import { Gift } from 'lucide-react'
import type { WeddingInvitation } from '@/types'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { DetailCard } from './DetailCard'

/** SECTION 10: Gifts & notes. */
export function GiftsSection({ invitation }: { invitation: WeddingInvitation }) {
  return (
    <InvitationSection id="gifts" eyebrow="A Little More" title="Gifts & Notes">
      <div className="flex flex-col gap-4 text-base text-[color:var(--iv-ink)]">
        {invitation.giftInformation && (
          <DetailCard icon={<Gift className="size-5" />} label="Gifts">
            {invitation.giftInformation}
          </DetailCard>
        )}
        {invitation.additionalMessage && <p className="leading-relaxed">{invitation.additionalMessage}</p>}
      </div>
    </InvitationSection>
  )
}
