import { ExternalLink, MapPin } from 'lucide-react'
import type { WeddingInvitation } from '@/types'
import { InvitationSection } from '@/components/invitation/InvitationSection'

function mapsLink(i: WeddingInvitation): string | null {
  if (i.mapUrl) return i.mapUrl
  const q = [i.venueName, i.venueAddress, i.city, i.state, i.country].filter(Boolean).join(', ')
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null
}

/** SECTION 4: Venue & map. */
export function VenueSection({ invitation }: { invitation: WeddingInvitation }) {
  const place = [invitation.city, invitation.state, invitation.country].filter(Boolean).join(', ')
  const maps = mapsLink(invitation)
  return (
    <InvitationSection id="venue" eyebrow="Getting There" title="Venue & Map">
      <div className="rounded-md bg-[color:var(--iv-paper)] p-6 text-[color:var(--iv-ink)] shadow-[0_8px_24px_-16px_rgba(0,0,0,0.35)]">
        <MapPin className="mx-auto size-7 text-[color:var(--iv-accent)]" />
        <p className="mt-3 font-display text-2xl">{invitation.venueName || 'Venue to be announced'}</p>
        {invitation.venueAddress && <p className="mt-1 text-sm opacity-80">{invitation.venueAddress}</p>}
        {place && <p className="text-sm opacity-80">{place}</p>}
        {maps && (
          <a
            href={maps}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--iv-main)] px-6 py-3 text-sm font-medium text-[color:var(--iv-on-main)] transition-transform active:scale-95"
          >
            Open in Maps <ExternalLink className="size-4" />
          </a>
        )}
      </div>
    </InvitationSection>
  )
}
