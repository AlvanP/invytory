import type { WeddingInvitation } from '@/types'
import type { CoverTone } from './TemplateCover'
import { formatDate, formatTime } from '@/utils/format'
import { ImagePlaceholder, MapPlaceholder } from '@/components/ui/Placeholder'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { CountdownDisplay } from '@/components/invitation/CountdownDisplay'
import { RsvpForm } from '@/components/invitation/RsvpForm'

/**
 * The reusable core of every wedding invitation. Each template passes
 * its own `tone`, which changes heading styles and ornaments (see
 * `toneStyles.ts`) without duplicating this component six times.
 */
export function InvitationBody({ invitation, tone }: { invitation: WeddingInvitation; tone: CoverTone }) {
  const hasStory = invitation.loveStory || invitation.howWeMet || invitation.vows

  return (
    <div>
      <InvitationSection eyebrow="The Wedding Of" tone={tone}>
        <h1 className="font-display text-4xl text-ink sm:text-5xl">
          {invitation.brideName} <span className="text-gold">&amp;</span> {invitation.groomName}
        </h1>
        {invitation.tagline && <p className="mt-3 text-sm text-ink-soft">{invitation.tagline}</p>}
        <div className="mx-auto mt-6 h-px w-16 bg-gold/50" />
        <p className="mt-6 font-display text-xl text-ink">
          {formatDate(invitation.weddingDate)}
        </p>
      </InvitationSection>

      <InvitationSection eyebrow="Details" title="Join Us" tone={tone}>
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-soft/70">Date</dt>
            <dd className="mt-1 text-ink">{formatDate(invitation.weddingDate)}</dd>
          </div>
          <div>
            <dt className="text-ink-soft/70">Time</dt>
            <dd className="mt-1 text-ink">{formatTime(invitation.weddingTime) || 'To be announced'}</dd>
          </div>
          <div>
            <dt className="text-ink-soft/70">Venue</dt>
            <dd className="mt-1 text-ink">{invitation.venueName || 'To be announced'}</dd>
          </div>
          <div>
            <dt className="text-ink-soft/70">Location</dt>
            <dd className="mt-1 text-ink">{[invitation.city, invitation.state, invitation.country].filter(Boolean).join(', ') || 'To be announced'}</dd>
          </div>
          {invitation.dressCode && (
            <div>
              <dt className="text-ink-soft/70">Dress Code</dt>
              <dd className="mt-1 text-ink">{invitation.dressCode}</dd>
            </div>
          )}
          {invitation.receptionInfo && (
            <div>
              <dt className="text-ink-soft/70">Reception</dt>
              <dd className="mt-1 text-ink">{invitation.receptionInfo}</dd>
            </div>
          )}
        </dl>
      </InvitationSection>

      {hasStory && (
        <InvitationSection eyebrow="Our Journey" title="Our Story" tone={tone} className="bg-ivory-deep">
          <div className="flex flex-col gap-6 text-left text-sm leading-relaxed text-ink-soft">
            {invitation.loveStory && <p>{invitation.loveStory}</p>}
            {invitation.howWeMet && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-gold">How We Met</p>
                <p>{invitation.howWeMet}</p>
              </div>
            )}
            {invitation.vows && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-gold">Our Vows</p>
                <p>{invitation.vows}</p>
              </div>
            )}
          </div>
        </InvitationSection>
      )}

      <InvitationSection eyebrow="Gallery" title="A Few Moments" tone={tone}>
        <div className="grid grid-cols-2 gap-3">
          {invitation.galleryImages.map((slot) => (
            <div key={slot.id} className="aspect-square overflow-hidden rounded-sm">
              <ImagePlaceholder src={slot.url} className="h-full w-full" />
            </div>
          ))}
        </div>
      </InvitationSection>

      <InvitationSection eyebrow="Counting Down" title="Until We Say I Do" tone={tone}>
        <CountdownDisplay weddingDate={invitation.weddingDate} />
      </InvitationSection>

      <InvitationSection eyebrow="Kindly Respond" tone={tone} className="bg-ivory-deep">
        <RsvpForm invitationId={invitation.id} customMessage={invitation.customRsvpMessage} />
      </InvitationSection>

      <InvitationSection eyebrow="Getting There" title="Venue &amp; Map" tone={tone}>
        <div className="text-left">
          <p className="text-sm text-ink">{invitation.venueName}</p>
          <p className="text-sm text-ink-soft">{invitation.venueAddress}</p>
          <p className="text-sm text-ink-soft">{[invitation.city, invitation.state, invitation.country].filter(Boolean).join(', ')}</p>
        </div>
        <MapPlaceholder className="mt-4" />
      </InvitationSection>

      {(invitation.giftInformation || invitation.weddingHashtag || invitation.additionalMessage) && (
        <InvitationSection eyebrow="A Little More" tone={tone}>
          <div className="flex flex-col gap-3 text-sm text-ink-soft">
            {invitation.giftInformation && <p>{invitation.giftInformation}</p>}
            {invitation.weddingHashtag && <p className="text-gold">{invitation.weddingHashtag}</p>}
            {invitation.additionalMessage && <p>{invitation.additionalMessage}</p>}
          </div>
        </InvitationSection>
      )}

      <footer className="border-t border-ink/10 py-10 text-center">
        <p className="font-display text-lg text-ink">{invitation.brideName} &amp; {invitation.groomName}</p>
        <p className="mt-1 text-xs text-ink-soft/70">Made with Evermore</p>
      </footer>
    </div>
  )
}