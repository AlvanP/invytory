import type { WeddingInvitation } from '@/types'

/**
 * A fully-populated example invitation, used to power the template
 * preview screen and as a fallback for the guest-facing page when a
 * slug matches. Replace with real records once Supabase is connected.
 */
export const mockWeddings: WeddingInvitation[] = [
  {
    id: 'inv_001',
    slug: 'ada-and-michael',
    templateId: 'royal-door',
    eventType: 'wedding',
    brideName: 'Ada',
    groomName: 'Michael',
    tagline: 'Together with their families',
    weddingDate: '2027-04-18',
    weddingTime: '16:00',
    venueName: 'The Terrace at Harborview',
    venueAddress: '14 Marina Close',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    mapUrl: '',
    dressCode: 'Black tie, gold accents welcome',
    receptionInfo: 'Reception immediately follows in the Garden Pavilion.',
    loveStory:
      'What began as a chance meeting at a mutual friend\u2019s birthday dinner became five years of shared mornings, long drives, and quiet certainty. We\u2019re overjoyed to begin this next chapter with the people who have shaped our story.',
    howWeMet: 'Introduced by mutual friends over a very long dinner that neither of us wanted to end.',
    vows: '',
    heroImage: null,
    galleryImages: [
      { id: 'g1', url: null },
      { id: 'g2', url: null },
      { id: 'g3', url: null },
      { id: 'g4', url: null },
    ],
    giftInformation: 'Your presence is the only gift we need. For those who\u2019ve asked, a registry link will follow.',
    weddingHashtag: '#AdaAndMichael2027',
    additionalMessage: 'We can\u2019t wait to celebrate with you.',
    customRsvpMessage: 'Kindly respond by March 1st, 2027.',
    createdAt: '2026-06-01T09:00:00.000Z',
    updatedAt: '2026-08-14T09:00:00.000Z',
    status: 'published',
    views: 1284,
  },
]

export function getInvitationBySlug(slug: string): WeddingInvitation | undefined {
  return mockWeddings.find((w) => w.slug === slug)
}

export function getInvitationById(id: string): WeddingInvitation | undefined {
  return mockWeddings.find((w) => w.id === id)
}
