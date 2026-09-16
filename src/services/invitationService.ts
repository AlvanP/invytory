import type { InvitationDraft, WeddingInvitation } from '@/types'
import { mockWeddings, getInvitationBySlug, getInvitationById } from '@/data/mockWedding'

/**
 * Invitation service — every component talks to this module, never to
 * `mockWedding.ts` directly. When Supabase is introduced, create
 * `supabaseInvitationService.ts` implementing this same shape and swap
 * the export at the bottom of this file. No UI changes required.
 */

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function generateSlug(brideName: string, groomName: string): string {
  const clean = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${clean(brideName)}-and-${clean(groomName)}`
}

const mockInvitationService = {
  async list(): Promise<WeddingInvitation[]> {
    return delay([...mockWeddings])
  },

  async getBySlug(slug: string): Promise<WeddingInvitation | undefined> {
    return delay(getInvitationBySlug(slug))
  },

  async getById(id: string): Promise<WeddingInvitation | undefined> {
    return delay(getInvitationById(id))
  },

  /** Simulates publishing a finished draft. Does not persist across reloads yet. */
  async publish(draft: InvitationDraft): Promise<WeddingInvitation> {
    const now = new Date().toISOString()
    const brideName = draft.brideName ?? 'Bride'
    const groomName = draft.groomName ?? 'Groom'

    const invitation: WeddingInvitation = {
      id: draft.id ?? `inv_${Math.random().toString(36).slice(2, 9)}`,
      slug: draft.slug ?? generateSlug(brideName, groomName),
      templateId: draft.templateId,
      eventType: 'wedding',
      brideName,
      groomName,
      tagline: draft.tagline,
      weddingDate: draft.weddingDate ?? '',
      weddingTime: draft.weddingTime ?? '',
      venueName: draft.venueName ?? '',
      venueAddress: draft.venueAddress ?? '',
      city: draft.city ?? '',
      state: draft.state ?? '',
      country: draft.country ?? '',
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
      status: 'published',
      views: 0,
    }

    return delay(invitation, 600)
  },
}

export const invitationService = mockInvitationService
export type InvitationService = typeof mockInvitationService
