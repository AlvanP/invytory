import type { WeddingInvitation } from '@/types'
import { FEATURE_SLOT_ID } from '@/types'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { useDesign } from '@/templates/DesignContext'
import { PhotoSlider } from '@/components/invitation/PhotoSlider'

export const sliderPhotos = (i: WeddingInvitation) =>
  i.galleryImages
    .filter((g) => g.id !== FEATURE_SLOT_ID && g.url)
    .slice(0, 4)
    .map((g) => ({ id: g.id, url: g.url as string, caption: g.caption }))

/** SECTION 8: Photo slider. Up to four photos that guests swipe through to the left. */
export function GallerySection({ invitation }: { invitation: WeddingInvitation }) {
  const { event } = useDesign()
  return (
    <InvitationSection id="gallery" eyebrow={event.gallery.eyebrow} title={event.gallery.title}>
      <PhotoSlider photos={sliderPhotos(invitation)} />
    </InvitationSection>
  )
}
