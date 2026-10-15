import type { ReactNode } from 'react'
import { CalendarDays, Clock, MapPin, Shirt, PartyPopper, Gift, ExternalLink } from 'lucide-react'
import type { WeddingInvitation } from '@/types'
import type { CoverTone } from './TemplateCover'
import { formatDate, formatTime } from '@/utils/format'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { CountdownDisplay } from '@/components/invitation/CountdownDisplay'
import { RsvpForm } from '@/components/invitation/RsvpForm'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'

function DetailCard({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-4 rounded-md border border-[color:var(--iv-main)]/25 bg-[color:var(--iv-paper)] p-5 text-left shadow-sm">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--iv-main)] text-[color:var(--iv-on-main)]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--iv-accent)]">{label}</p>
        <p className="mt-1 break-words text-base text-[color:var(--iv-ink)]">{children}</p>
      </div>
    </div>
  )
}

function mapsLink(i: WeddingInvitation): string | null {
  if (i.mapUrl) return i.mapUrl
  const q = [i.venueName, i.venueAddress, i.city, i.state, i.country].filter(Boolean).join(', ')
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null
}

/**
 * The inside of every invitation. Bands of the couple's colour alternate
 * with light sections, and every piece of text on a band uses the
 * automatically chosen readable colour (see colorTheme.ts).
 */
export function InvitationBody({ invitation, tone }: { invitation: WeddingInvitation; tone: CoverTone }) {
  const hasStory = invitation.loveStory || invitation.howWeMet || invitation.vows
  const photos = invitation.galleryImages.filter((g) => g.url)
  const place = [invitation.city, invitation.state, invitation.country].filter(Boolean).join(', ')
  const maps = mapsLink(invitation)
  const hasMore = invitation.giftInformation || invitation.additionalMessage

  return (
    <div>
      <InvitationSection variant="band" eyebrow="Counting Down" title="Until We Say I Do" tone={tone}>
        <CountdownDisplay weddingDate={invitation.weddingDate} />
      </InvitationSection>

      <InvitationSection eyebrow="Details" title="Join Us" tone={tone}>
        <div className="flex flex-col gap-3">
          <DetailCard icon={<CalendarDays className="size-5" />} label="Date">
            {formatDate(invitation.weddingDate)}
          </DetailCard>
          <DetailCard icon={<Clock className="size-5" />} label="Time">
            {formatTime(invitation.weddingTime) || 'To be announced'}
          </DetailCard>
          <DetailCard icon={<MapPin className="size-5" />} label="Venue">
            {invitation.venueName || 'To be announced'}
            {place && <span className="block text-sm opacity-80">{place}</span>}
          </DetailCard>
          {invitation.dressCode && (
            <DetailCard icon={<Shirt className="size-5" />} label="Dress Code">
              {invitation.dressCode}
            </DetailCard>
          )}
          {invitation.receptionInfo && (
            <DetailCard icon={<PartyPopper className="size-5" />} label="Reception">
              {invitation.receptionInfo}
            </DetailCard>
          )}
        </div>
      </InvitationSection>

      {hasStory && (
        <InvitationSection variant="soft" eyebrow="Our Journey" title="Our Story" tone={tone}>
          <div className="flex flex-col gap-8 text-left text-base leading-relaxed text-[color:var(--iv-ink)]">
            {invitation.loveStory && <p>{invitation.loveStory}</p>}
            {invitation.howWeMet && (
              <div className="border-l-4 border-[color:var(--iv-main)] pl-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--iv-accent)]">How We Met</p>
                <p>{invitation.howWeMet}</p>
              </div>
            )}
            {invitation.vows && (
              <div className="border-l-4 border-[color:var(--iv-main)] pl-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--iv-accent)]">Our Vows</p>
                <p className="font-display text-lg italic">{invitation.vows}</p>
              </div>
            )}
          </div>
        </InvitationSection>
      )}

      {photos.length > 0 && (
        <InvitationSection eyebrow="Gallery" title="A Few Moments" tone={tone}>
          <div className="grid grid-cols-2 gap-3">
            {photos.map((slot, i) => (
              <RevealOnScroll
                key={slot.id}
                delayMs={i * 100}
                className={`overflow-hidden rounded-md border-4 border-[color:var(--iv-main)] shadow-md ${i % 3 === 0 ? 'col-span-2 aspect-[4/3]' : 'aspect-square'}`}
              >
                <img src={slot.url ?? ''} alt={slot.caption ?? ''} loading="lazy" className="h-full w-full object-cover" />
              </RevealOnScroll>
            ))}
          </div>
        </InvitationSection>
      )}

      <InvitationSection variant="soft" eyebrow="Getting There" title="Venue & Map" tone={tone}>
        <div className="rounded-md border border-[color:var(--iv-main)]/25 bg-[color:var(--iv-paper)] p-6 text-[color:var(--iv-ink)] shadow-sm">
          <MapPin className="mx-auto size-7 text-[color:var(--iv-accent)]" />
          <p className="mt-3 font-display text-xl">{invitation.venueName || 'Venue to be announced'}</p>
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

      <InvitationSection variant="band" eyebrow="Kindly Respond" tone={tone}>
        <div className="rounded-md bg-[color:var(--iv-paper)] p-6 text-left text-[color:var(--iv-ink)] shadow-lg">
          <RsvpForm invitationId={invitation.id} customMessage={invitation.customRsvpMessage} />
        </div>
      </InvitationSection>

      {hasMore && (
        <InvitationSection eyebrow="A Little More" tone={tone}>
          <div className="flex flex-col gap-4 text-base text-[color:var(--iv-ink)]">
            {invitation.giftInformation && (
              <DetailCard icon={<Gift className="size-5" />} label="Gifts">
                {invitation.giftInformation}
              </DetailCard>
            )}
            {invitation.additionalMessage && <p>{invitation.additionalMessage}</p>}
          </div>
        </InvitationSection>
      )}

      <footer className="bg-[color:var(--iv-main)] px-6 py-12 text-center text-[color:var(--iv-on-main)]">
        <p className="font-display text-2xl">
          {invitation.brideName} &amp; {invitation.groomName}
        </p>
        {invitation.weddingHashtag && (
          <p className="mx-auto mt-4 w-fit rounded-full border border-[color:var(--iv-on-main)]/60 px-4 py-1.5 text-sm">
            {invitation.weddingHashtag}
          </p>
        )}
        <p className="mt-6 text-xs opacity-80">Made with Evermore</p>
      </footer>
    </div>
  )
}