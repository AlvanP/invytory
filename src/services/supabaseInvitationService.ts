import type { InvitationDraft, WeddingInvitation, GalleryImageSlot, CeremonyType } from '@/types'
import type { PricingPlan } from '@/data/pricingPlans'
import { supabase } from './supabaseClient'

export interface InvitationRow {
  id: string
  slug: string | null
  template_id: string
  owner_id: string | null
  bride_name: string
  groom_name: string
  tagline: string | null
  wedding_date: string
  wedding_time: string | null
  venue_name: string | null
  venue_address: string | null
  city: string | null
  state: string | null
  country: string | null
  map_url: string | null
  dress_code: string | null
  reception_info: string | null
  love_story: string | null
  how_we_met: string | null
  vows: string | null
  hero_image: string | null
  gallery_images: GalleryImageSlot[]
  gift_information: string | null
  wedding_hashtag: string | null
  additional_message: string | null
  custom_rsvp_message: string | null
  status: WeddingInvitation['status']
  views: number
  created_at: string
  updated_at: string
  plan: WeddingInvitation['plan'] | null
  max_guests: number | null
  confirmed_guest_count: number
  expires_at: string | null
  payment_reference: string | null
  wedding_id: string | null
  ceremony_type: string | null
  ceremony_label: string | null
}

export function rowToInvitation(row: InvitationRow): WeddingInvitation {
  return {
    id: row.id,
    slug: row.slug ?? '', // empty for ceremony rows linked to a wedding — they're looked up via wedding_id, not their own slug
    templateId: row.template_id,
    eventType: 'wedding',
    brideName: row.bride_name,
    groomName: row.groom_name,
    tagline: row.tagline ?? undefined,
    weddingDate: row.wedding_date,
    weddingTime: row.wedding_time ?? '',
    venueName: row.venue_name ?? '',
    venueAddress: row.venue_address ?? '',
    city: row.city ?? '',
    state: row.state ?? '',
    country: row.country ?? '',
    mapUrl: row.map_url ?? undefined,
    dressCode: row.dress_code ?? undefined,
    receptionInfo: row.reception_info ?? undefined,
    loveStory: row.love_story ?? undefined,
    howWeMet: row.how_we_met ?? undefined,
    vows: row.vows ?? undefined,
    heroImage: row.hero_image,
    galleryImages: row.gallery_images ?? [],
    giftInformation: row.gift_information ?? undefined,
    weddingHashtag: row.wedding_hashtag ?? undefined,
    additionalMessage: row.additional_message ?? undefined,
    customRsvpMessage: row.custom_rsvp_message ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    views: row.views,
    plan: row.plan ?? undefined,
    maxGuests: row.max_guests ?? undefined,
    confirmedGuestCount: row.confirmed_guest_count,
    expiresAt: row.expires_at ?? undefined,
    paymentReference: row.payment_reference ?? undefined,
    weddingId: row.wedding_id ?? undefined,
    ceremonyType: (row.ceremony_type as CeremonyType | null) ?? undefined,
    ceremonyLabel: row.ceremony_label ?? undefined,
  }
}

function generateSlug(brideName: string, groomName: string): string {
  const clean = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${clean(brideName)}-and-${clean(groomName)}`
}

export const supabaseInvitationService = {
  /** Pass the signed-in user's id to list only their invitations
   * (used by the dashboard). Omit it to rely on RLS's public-read
   * rule for published invitations only (not used directly today,
   * kept for future public "browse" features). */
    async list(ownerId?: string): Promise<WeddingInvitation[]> {
    let query = supabase.from('invitations').select('*').order('created_at', { ascending: false })
    if (ownerId) query = query.eq('owner_id', ownerId)
    const { data, error } = await query
    if (error) throw error
    return (data as InvitationRow[]).map(rowToInvitation)
  },

  /** Only "legacy" invitations — ones NOT linked to a Wedding. Used by
   * the dashboard so a multi-ceremony wedding shows as one card. */
  async listLegacyByOwner(ownerId: string): Promise<WeddingInvitation[]> {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('owner_id', ownerId)
      .is('wedding_id', null)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as InvitationRow[]).map(rowToInvitation)
  },

  async getBySlug(slug: string): Promise<WeddingInvitation | undefined> {
    const { data, error } = await supabase.from('invitations').select('*').eq('slug', slug).maybeSingle()
    if (error) throw error
    return data ? rowToInvitation(data as InvitationRow) : undefined
  },

  async getById(id: string): Promise<WeddingInvitation | undefined> {
    const { data, error } = await supabase.from('invitations').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? rowToInvitation(data as InvitationRow) : undefined
  },

  /** ownerId is required in practice — the database rejects an insert
   * with no owner_id once RLS is updated. `plan` and `paymentReference`
   * are only trusted here because they were only reached after
   * /api/verify-payment confirmed the charge server-side — see
   * StepPreview.tsx. */
  async publish(
    draft: InvitationDraft,
    ownerId: string,
    plan: PricingPlan,
    paymentReference: string
  ): Promise<WeddingInvitation> {
    const brideName = draft.brideName ?? 'Bride'
    const groomName = draft.groomName ?? 'Groom'
    const slug = draft.slug ?? generateSlug(brideName, groomName)

    const expiresAt = new Date(Date.now() + plan.hostingDays * 24 * 60 * 60 * 1000).toISOString()

    const payload = {
      slug,
      template_id: c.templateId || draft.templateId,
      owner_id: ownerId,
      bride_name: brideName,
      groom_name: groomName,
      tagline: draft.tagline ?? null,
      wedding_date: draft.weddingDate || new Date().toISOString().slice(0, 10),
      wedding_time: draft.weddingTime ?? null,
      venue_name: draft.venueName ?? null,
      venue_address: draft.venueAddress ?? null,
      city: draft.city ?? null,
      state: draft.state ?? null,
      country: draft.country ?? null,
      map_url: draft.mapUrl ?? null,
      dress_code: draft.dressCode ?? null,
      reception_info: draft.receptionInfo ?? null,
      love_story: draft.loveStory ?? null,
      how_we_met: draft.howWeMet ?? null,
      vows: draft.vows ?? null,
      hero_image: draft.heroImage ?? null,
      gallery_images: draft.galleryImages ?? [],
      gift_information: draft.giftInformation ?? null,
      wedding_hashtag: draft.weddingHashtag ?? null,
      additional_message: draft.additionalMessage ?? null,
      custom_rsvp_message: draft.customRsvpMessage ?? null,
      status: 'published' as const,
      plan: plan.id,
      max_guests: plan.maxGuests,
      expires_at: expiresAt,
      payment_reference: paymentReference,
    }

    const { data, error } = await supabase.from('invitations').insert(payload).select().single()
    if (error) throw error
    return rowToInvitation(data as InvitationRow)
  },
}