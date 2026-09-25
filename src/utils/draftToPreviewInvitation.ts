import type { WeddingInvitation, CeremonyDraft } from '@/types'
import type { WeddingDraft } from '@/hooks/useWizard'

export function draftToPreviewInvitation(draft: WeddingDraft, ceremony: CeremonyDraft): WeddingInvitation {
  const now = new Date().toISOString()
  return {
    id: ceremony.id,
    slug: 'your-invitation',
    templateId: ceremony.templateId || draft.templateId,
    eventType: 'wedding',
    brideName: draft.brideName || 'Bride',
    groomName: draft.groomName || 'Groom',
    tagline: draft.tagline,
    weddingDate: ceremony.weddingDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toISOString().slice(0, 10),
    weddingTime: ceremony.weddingTime || '16:00',
    venueName: ceremony.venueName || 'Venue to be announced',
    venueAddress: ceremony.venueAddress || '',
    city: ceremony.city || '',
    state: ceremony.state || '',
    country: ceremony.country || '',
    mapUrl: ceremony.mapUrl,
    dressCode: ceremony.dressCode,
    receptionInfo: ceremony.receptionInfo,
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
    createdAt: now,
    updatedAt: now,
    status: 'draft',
    views: 0,
    ceremonyType: ceremony.ceremonyType,
    ceremonyLabel: ceremony.ceremonyLabel,
  }
}