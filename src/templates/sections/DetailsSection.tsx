import { CalendarDays, Clock, PartyPopper } from 'lucide-react'
import type { WeddingInvitation } from '@/types'
import { formatDate, formatTime } from '@/utils/format'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { useDateGate } from '@/templates/DateGate'
import { useDesign } from '@/templates/DesignContext'
import { DetailCard } from './DetailCard'

export const hasDetailsContent = (i: WeddingInvitation) => !!(formatTime(i.weddingTime) || i.receptionInfo?.trim())

/** SECTION 3: Programme & reception. Date, time and reception information in cards (only what was filled in). */
export function DetailsSection({ invitation }: { invitation: WeddingInvitation }) {
  const gate = useDateGate()
  const { event } = useDesign()
  return (
    <InvitationSection id="details" eyebrow={event.details.eyebrow} title={event.details.title}>
      <div className="flex flex-col gap-3">
        <DetailCard icon={<CalendarDays className="size-5" />} label="Date">
          {gate.hidden ? 'Revealed when you scratch it off' : formatDate(invitation.weddingDate)}
        </DetailCard>
        {formatTime(invitation.weddingTime) && (
          <DetailCard icon={<Clock className="size-5" />} label="Time">
            {formatTime(invitation.weddingTime)}
          </DetailCard>
        )}
        {invitation.receptionInfo && (
          <DetailCard icon={<PartyPopper className="size-5" />} label={event.receptionLabel}>
            {invitation.receptionInfo}
          </DetailCard>
        )}
      </div>
    </InvitationSection>
  )
}
