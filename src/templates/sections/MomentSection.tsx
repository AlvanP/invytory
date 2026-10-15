import type { WeddingInvitation } from '@/types'
import { FEATURE_SLOT_ID } from '@/types'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { FloatingPhoto } from '@/components/invitation/FloatingPhoto'

export const featurePhoto = (i: WeddingInvitation) => i.galleryImages.find((g) => g.id === FEATURE_SLOT_ID)?.url ?? null

/** SECTION 7: Floating photo. One photo in a minimal frame that tilts as guests scroll. */
export function MomentSection({ invitation }: { invitation: WeddingInvitation }) {
  const url = featurePhoto(invitation)
  if (!url) return null
  return (
    <InvitationSection id="moment">
      <FloatingPhoto src={url} />
    </InvitationSection>
  )
}
