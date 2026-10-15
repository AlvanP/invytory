import type { WeddingInvitation } from '@/types'
import { InvitationSection } from '@/components/invitation/InvitationSection'

/** SECTION 11: Footer. The names, the hashtag and the sign-off. */
export function FooterSection({ invitation }: { invitation: WeddingInvitation }) {
  return (
    <InvitationSection id="footer">
      <p className="font-display text-3xl">
        {invitation.brideName} &amp; {invitation.groomName}
      </p>
      {invitation.weddingHashtag && (
        <p className="mx-auto mt-5 w-fit rounded-full border border-current px-4 py-1.5 text-sm opacity-90">{invitation.weddingHashtag}</p>
      )}
      <p className="mt-8 text-xs opacity-75">Made with Evermore</p>
    </InvitationSection>
  )
}
