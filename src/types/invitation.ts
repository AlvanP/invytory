/**
 * Core data model for a wedding invitation.
 *
 * This type is intentionally storage-agnostic — it doesn't know whether
 * it came from a local mock array or a Supabase table. That's what lets
 * us swap `mockInvitationService` for `supabaseInvitationService` later
 * without touching any component that consumes this type.
  */

import type { CeremonyType } from './wedding'

export type InvitationStatus = 'draft' | 'published' | 'archived'

export interface GalleryImageSlot {
  id: string
  /** null until a real upload pipeline exists — the UI renders a placeholder */
  url: string | null
  caption?: string
}

export interface WeddingInvitation {
  id: string
  slug: string
  templateId: string
  eventType: 'wedding' // the only event type supported in v0.1; see EventType

  // Couple
  brideName: string
  groomName: string
  tagline?: string

  // Wedding details
  weddingDate: string // ISO date, e.g. "2027-04-18"
  weddingTime: string // e.g. "16:00"
  venueName: string
  venueAddress: string
  city: string
  state: string
  country: string
  mapUrl?: string
  dressCode?: string
  receptionInfo?: string

  // Story (optional)
  loveStory?: string
  howWeMet?: string
  vows?: string

  // Photos
  heroImage: string | null
  galleryImages: GalleryImageSlot[]

  // Optional details
  giftInformation?: string
  weddingHashtag?: string
  additionalMessage?: string
  customRsvpMessage?: string

    // System
  createdAt: string
  updatedAt: string
  status: InvitationStatus
  views: number

    // Plan & payment
  plan?: 'silver' | 'gold'
  maxGuests?: number
  /** Running total of confirmed guests, maintained by a database
   * trigger — never trust a client-computed count for capacity checks. */
  confirmedGuestCount?: number
  /** ISO date the hosting period ends — the plan's hostingDays after publish. */
  expiresAt?: string
    paymentReference?: string

  // Multi-Ceremony Wedding Engine foundation (see docs/ROADMAP-multi-ceremony.md).
  // Not used by any UI yet — every existing invitation is implicitly a
  // single "white" ceremony with no parent Wedding until the next
  // milestone builds on top of these fields.
  weddingId?: string
  ceremonyType?: CeremonyType
  /** Optional custom name, e.g. "Reception" — shown instead of the
   * default ceremonyType label when set. */
  ceremonyLabel?: string
}

/**
 * The shape used while a user is moving through the creation wizard.
 * Every field is optional because the record is built up incrementally
 * across steps, and the user can jump backward/forward freely.
 */
export type InvitationDraft = Partial<WeddingInvitation> & {
  templateId: string
}
