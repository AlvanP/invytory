import type { WeddingInvitation } from '@/types'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { NAME_FONT, AND_FONT } from '@/templates/fonts'

/** SECTION 11: Footer. The names, the hashtag and the sign-off. */
export function FooterSection({ invitation }: { invitation: WeddingInvitation }) {
  return (
    <InvitationSection id="footer">
      <p className="text-3xl" style={{ fontFamily: NAME_FONT }}>
        {invitation.brideName}{' '}
        <span className="text-4xl" style={{ fontFamily: AND_FONT }}>
          and
        </span>{' '}
        {invitation.groomName}
      </p>
      {invitation.weddingHashtag && (
        <p className="mx-auto mt-5 w-fit rounded-full border border-current px-4 py-1.5 text-sm opacity-90">{invitation.weddingHashtag}</p>
      )}
      <p className="mt-8 text-xs opacity-75">Made with Evermore</p>
    </InvitationSection>
  )
}
