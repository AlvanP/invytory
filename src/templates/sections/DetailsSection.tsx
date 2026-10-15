import { CalendarDays, Clock, PartyPopper } from 'lucide-react'
import type { WeddingInvitation } from '@/types'
import { formatDate, formatTime } from '@/utils/format'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { useDateGate } from '@/templates/DateGate'
import { DetailCard } from './DetailCard'

/** SECTION 3: Programme & reception. Date, time and reception information in cards. */
export function DetailsSection({ invitation }: { invitation: WeddingInvitation }) {
  const gate = useDateGate()
  return (
    <InvitationSection id="details" eyebrow="Details" title="Join Us">
      <div className="flex flex-col gap-3">
        <DetailCard icon={<CalendarDays className="size-5" />} label="Date">
          {gate.hidden ? 'Revealed when you scratch it off' : formatDate(invitation.weddingDate)}
        </DetailCard>
        <DetailCard icon={<Clock className="size-5" />} label="Time">
          {formatTime(invitation.weddingTime) || 'To be announced'}
        </DetailCard>
        {invitation.receptionInfo && (
          <DetailCard icon={<PartyPopper className="size-5" />} label="Reception">
            {invitation.receptionInfo}
          </DetailCard>
        )}
      </div>
    </InvitationSection>
  )
}
