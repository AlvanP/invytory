export type CeremonyType = 'white' | 'igbo' | 'yoruba' | 'hausa' | 'custom'

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
}

export function ceremonyDisplayName(c: { ceremonyType?: CeremonyType; ceremonyLabel?: string }): string {
  const type = c.ceremonyType ?? 'white'
  if (type === 'custom' && c.ceremonyLabel) return c.ceremonyLabel
  return CEREMONY_TYPE_LABELS[type]
}