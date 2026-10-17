import type { WeddingInvitation } from '@/types'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { NAME_FONT, AND_FONT } from '@/templates/fonts'
import { useDesign } from '@/templates/DesignContext'

/** SECTION 11: Footer. The names, the hashtag and the sign-off. */
export function FooterSection({ invitation }: { invitation: WeddingInvitation }) {
  const { event } = useDesign()
  const second = invitation.groomName.trim()
  return (
    <InvitationSection id="footer">
      <p className="text-3xl" style={{ fontFamily: NAME_FONT }}>
        {invitation.brideName}
        {second && (
          <>
            {' '}
            <span className="text-4xl" style={{ fontFamily: AND_FONT }}>
              and
            </span>{' '}
            {second}
          </>
        )}
      </p>
      {event.footerSign && <p className="mt-3 text-sm opacity-85">{event.footerSign}</p>}
      {invitation.weddingHashtag && (
        <p className="mx-auto mt-5 w-fit rounded-full border border-current px-4 py-1.5 text-sm opacity-90">{invitation.weddingHashtag}</p>
      )}
      <p className="mt-8 text-xs opacity-75">Made with Invytory</p>
    </InvitationSection>
  )
}
