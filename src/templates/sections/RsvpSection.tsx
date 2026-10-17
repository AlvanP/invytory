import type { WeddingInvitation } from '@/types'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { useDesign } from '@/templates/DesignContext'
import { RsvpForm } from '@/components/invitation/RsvpForm'

/** SECTION 9: RSVP. */
export function RsvpSection({ invitation }: { invitation: WeddingInvitation }) {
  const { event } = useDesign()
  return (
    <InvitationSection id="rsvp" eyebrow={event.rsvp.eyebrow} title={event.rsvp.title}>
      <div className="rounded-md bg-[color:var(--iv-paper)] p-6 text-left text-[color:var(--iv-ink)] shadow-lg">
        <RsvpForm invitationId={invitation.id} customMessage={invitation.customRsvpMessage} />
      </div>
    </InvitationSection>
  )
}
