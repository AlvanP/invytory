import type { WeddingInvitation } from '@/types'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { RsvpForm } from '@/components/invitation/RsvpForm'

/** SECTION 9: RSVP. */
export function RsvpSection({ invitation }: { invitation: WeddingInvitation }) {
  return (
    <InvitationSection id="rsvp" eyebrow="Kindly Respond" title="RSVP">
      <div className="rounded-md bg-[color:var(--iv-paper)] p-6 text-left text-[color:var(--iv-ink)] shadow-lg">
        <RsvpForm invitationId={invitation.id} customMessage={invitation.customRsvpMessage} />
      </div>
    </InvitationSection>
  )
}
