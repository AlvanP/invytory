/**
 * Foundation types for the Multi-Ceremony Wedding Engine.
 * See docs/ROADMAP-multi-ceremony.md for the full plan.
 *
 * Today, nothing in the app creates or reads a `Wedding` yet — a
 * `WeddingInvitation` (see invitation.ts) is still the single source
 * of truth for both plan/payment AND ceremony details. This file
 * exists so the next milestone (the actual multi-ceremony wizard and
 * guest-facing ceremony selector) has a real type to build against,
 * without needing another schema migration first.
 */

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
  /** The one link guests receive, regardless of how many ceremonies exist. */
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