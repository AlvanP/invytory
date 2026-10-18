import type { WeddingInvitation } from '@/types'
import { FEATURE_SLOT_ID } from '@/types'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { useDesign } from '@/templates/DesignContext'
import { PhotoGallery } from '@/components/invitation/PhotoGallery'
import { galleryStyleFor } from '@/templates/galleryStyles'

export const sliderPhotos = (i: WeddingInvitation) =>
  i.galleryImages
    .filter((g) => g.id !== FEATURE_SLOT_ID && g.url)
    .slice(0, 4)
    .map((g) => ({ id: g.id, url: g.url as string, caption: g.caption }))

/** SECTION 8: Photo gallery. Up to four photos, shown in the style the template uses. */
export function GallerySection({ invitation }: { invitation: WeddingInvitation }) {
  const { event, templateId } = useDesign()
  return (
    <InvitationSection id="gallery" eyebrow={event.gallery.eyebrow} title={event.gallery.title}>
      <PhotoGallery photos={sliderPhotos(invitation)} style={galleryStyleFor(templateId)} />
    </InvitationSection>
  )
}
