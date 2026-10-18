import { Calendar, MapPin } from 'lucide-react'
import type { WeddingInvitation } from '@/types'
import { ceremonyDisplayName } from '@/types'
import { formatDate, formatTime } from '@/utils/format'
import { useInvitee } from '@/templates/InviteeContext'

export function CeremonySelector({
  brideName,
  groomName,
  ceremonies,
  onSelect,
}: {
  brideName: string
  groomName: string
  ceremonies: WeddingInvitation[]
  onSelect: (ceremony: WeddingInvitation) => void
}) {
  const invitee = useInvitee()
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div>
        {invitee ? (
          <p className="text-sm text-ink-soft">
            <span className="block font-display text-2xl italic text-ink">{invitee.name}</span>
            is specially invited to celebrate with
          </p>
        ) : (
          <p className="text-xs tracking-[0.2em] text-gold">Celebrate With Us</p>
        )}
        <h1 className="mt-2 font-display text-3xl text-ink">
          {brideName}
          {groomName.trim() && (
            <>
              {' '}
              <span className="text-gold">&amp;</span> {groomName}
            </>
          )}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">Choose a ceremony to view details and RSVP.</p>
      </div>

      <div className="flex w-full flex-col gap-4">
        {ceremonies.map((ceremony) => (
          <button
            key={ceremony.id}
            onClick={() => onSelect(ceremony)}
            className="flex flex-col gap-1 rounded-md border border-ink/10 bg-white p-6 text-left transition-colors hover:border-gold"
          >
            <p className="font-display text-xl text-ink">{ceremonyDisplayName(ceremony)}</p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {formatDate(ceremony.weddingDate)}{ceremony.weddingTime ? ` · ${formatTime(ceremony.weddingTime)}` : ''}
              </span>
              {ceremony.venueName && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {ceremony.venueName}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}