import type { InvitationDraft, WeddingInvitation } from '@/types'

/** Fills in sensible fallbacks so the preview always has something to
 * show, even before every field has been completed. */
export function draftToPreviewInvitation(draft: InvitationDraft): WeddingInvitation {
  const now = new Date().toISOString()
  return {
    id: draft.id ?? 'draft-preview',
    slug: draft.slug ?? 'your-invitation',
    templateId: draft.templateId,
    eventType: 'wedding',
    brideName: draft.brideName || 'Bride',
    groomName: draft.groomName || 'Groom',
    tagline: draft.tagline,
    weddingDate: draft.weddingDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toISOString().slice(0, 10),
    weddingTime: draft.weddingTime || '16:00',
    venueName: draft.venueName || 'Venue to be announced',
    venueAddress: draft.venueAddress || '',
    city: draft.city || '',
    state: draft.state || '',
    country: draft.country || '',
    mapUrl: draft.mapUrl,
    dressCode: draft.dressCode,
    receptionInfo: draft.receptionInfo,
    loveStory: draft.loveStory,
    howWeMet: draft.howWeMet,
    vows: draft.vows,
    heroImage: draft.heroImage ?? null,
    galleryImages: draft.galleryImages ?? [
      { id: 'g1', url: null },
      { id: 'g2', url: null },
      { id: 'g3', url: null },
      { id: 'g4', url: null },
    ],
    giftInformation: draft.giftInformation,
    weddingHashtag: draft.weddingHashtag,
    additionalMessage: draft.additionalMessage,
    customRsvpMessage: draft.customRsvpMessage,
    createdAt: draft.createdAt ?? now,
    updatedAt: now,
    status: draft.status ?? 'draft',
    views: draft.views ?? 0,
  }
}
