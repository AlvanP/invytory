import type { WeddingInvitation } from '@/types'
import { FEATURE_SLOT_ID } from '@/types'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { PhotoSlider } from '@/components/invitation/PhotoSlider'

export const sliderPhotos = (i: WeddingInvitation) =>
  i.galleryImages
    .filter((g) => g.id !== FEATURE_SLOT_ID && g.url)
    .slice(0, 4)
    .map((g) => ({ id: g.id, url: g.url as string, caption: g.caption }))

/** SECTION 8: Photo slider. Up to four photos that guests swipe through to the left. */
export function GallerySection({ invitation }: { invitation: WeddingInvitation }) {
  return (
    <InvitationSection id="gallery" eyebrow="Gallery" title="Moments Together">
      <PhotoSlider photos={sliderPhotos(invitation)} />
    </InvitationSection>
  )
}
