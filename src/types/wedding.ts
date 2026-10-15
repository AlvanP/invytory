import type { GalleryImageSlot } from './invitation'

export type CeremonyType = 'white' | 'igbo' | 'yoruba' | 'hausa' | 'custom'

/** Where a ceremony's music came from: our library, or the couple's own file. */
export type MusicSource = 'library' | 'upload'

export const CEREMONY_TYPE_LABELS: Record<CeremonyType, string> = {
  white: 'White Wedding',
  igbo: 'Igbo Traditional Wedding',
  yoruba: 'Yoruba Traditional Wedding',
  hausa: 'Hausa Traditional Wedding',
  custom: 'Traditional Ceremony',
}

export interface Wedding {
  id: string
  ownerId: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  plan?: 'silver' | 'gold'
  maxGuests?: number
  confirmedGuestCount?: number
  expiresAt?: string
  paymentReference?: string
  views: number
  createdAt: string
  updatedAt: string
}

export interface CeremonyDraft {
  id: string
  /** Each ceremony picks its own template — defaults to the wedding's
   * initial template choice but can be overridden per ceremony. */
  templateId?: string
  ceremonyType: CeremonyType
  ceremonyLabel?: string
  weddingDate?: string
  weddingTime?: string
  venueName?: string
  venueAddress?: string
  city?: string
  state?: string
  country?: string
  mapUrl?: string
  dressCode?: string
  receptionInfo?: string
  /** Per-ceremony photos. Undefined until the couple uploads something;
   * use `emptyGallery()` to get the four blank slots. */
  heroImage?: string | null
  galleryImages?: GalleryImageSlot[]
  /** Per-ceremony RSVP note shown above this ceremony's RSVP form. */
  customRsvpMessage?: string
  /** Per-ceremony music. All three are set together, or all are empty. */
  musicSource?: MusicSource | null
  musicUrl?: string | null
  musicTitle?: string | null
  /** Colour of the day for this ceremony (#RRGGBB). */
  themeColor?: string | null
}

/** Photo slot id for the one photo that floats in the body of the invitation. */
export const FEATURE_SLOT_ID = 'feature'

/** The slots after the hero: one floating "feature" photo and four slider photos (6 photos in all with the hero). */
export function emptyGallery(): GalleryImageSlot[] {
  return [
    { id: FEATURE_SLOT_ID, url: null },
    { id: 'g1', url: null },
    { id: 'g2', url: null },
    { id: 'g3', url: null },
    { id: 'g4', url: null },
  ]
}

export function ceremonyDisplayName(c: { ceremonyType?: CeremonyType; ceremonyLabel?: string }): string {
  const type = c.ceremonyType ?? 'white'
  if (type === 'custom' && c.ceremonyLabel) return c.ceremonyLabel
  return CEREMONY_TYPE_LABELS[type]
}
/** Sets one slot's photo, adding the slot if an older invitation does not have it yet. */
export function setGallerySlot(gallery: GalleryImageSlot[], id: string, url: string | null): GalleryImageSlot[] {
  return gallery.some((s) => s.id === id)
    ? gallery.map((s) => (s.id === id ? { ...s, url } : s))
    : [...gallery, { id, url }]
}
