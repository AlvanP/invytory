import type { InvitationDraft, WeddingInvitation, GalleryImageSlot, CeremonyType, MusicSource } from '@/types'
import type { PricingPlan } from '@/data/pricingPlans'
import { supabase } from './supabaseClient'
import { EVENT_KINDS, type EventKind } from '@/templates/events'

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
  music_source?: string | null
  music_url?: string | null
  music_title?: string | null
  theme_color?: string | null
  event_type?: string | null
}

export function rowToInvitation(row: InvitationRow): WeddingInvitation {
  return {
    id: row.id,
    slug: row.slug ?? '', // empty for ceremony rows linked to a wedding — they're looked up via wedding_id, not their own slug
    templateId: row.template_id,
    eventType: EVENT_KINDS.includes(row.event_type as EventKind) ? (row.event_type as EventKind) : 'wedding',
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
    musicSource: row.music_url ? ((row.music_source as MusicSource | null) ?? 'upload') : undefined,
    musicUrl: row.music_url ?? undefined,
    musicTitle: row.music_title ?? undefined,
    themeColor: row.theme_color ?? undefined,
  }
}

function generateSlug(brideName: string, groomName: string): string {
  const clean = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${clean(brideName)}-and-${clean(groomName)}`
}

/** What the owner may change after publishing (photos, music, RSVP note). */
export interface InvitationMediaUpdate {
  heroImage: string | null
  galleryImages: GalleryImageSlot[]
  customRsvpMessage: string
  musicSource: MusicSource | null
  musicUrl: string | null
  musicTitle: string | null
}

/** Details that belong to ONE ceremony. */
export interface CeremonyDetailsUpdate {
  weddingDate: string
  weddingTime: string
  venueName: string
  venueAddress: string
  city: string
  state: string
  dressCode: string
  receptionInfo: string
}

/** Details shared by every ceremony of a wedding. */
export interface CoupleDetailsUpdate {
  brideName: string
  groomName: string
  tagline: string
  loveStory: string
  howWeMet: string
  vows: string
  weddingHashtag: string
  giftInformation: string
  additionalMessage: string
}

const orNull = (v: string) => v.trim() || null

export const supabaseInvitationService = {
  /** Saves this ceremony's own details (date, venue, ...). */
  async updateCeremonyDetails(id: string, u: CeremonyDetailsUpdate): Promise<void> {
    const { data, error } = await supabase
      .from('invitations')
      .update({
        wedding_date: u.weddingDate,
        wedding_time: orNull(u.weddingTime),
        venue_name: u.venueName.trim(),
        venue_address: orNull(u.venueAddress),
        city: orNull(u.city),
        state: orNull(u.state),
        dress_code: orNull(u.dressCode),
        reception_info: orNull(u.receptionInfo),
      })
      .eq('id', id)
      .select('id')
    if (error) throw new Error(error.message || 'Could not save the ceremony details.')
    if (!data || data.length === 0) throw new Error('Could not save: not found, or you are not the owner.')
  },

  /** Saves couple-wide details on EVERY ceremony of the wedding (or just this
   * row for an older single invitation), so all ceremonies stay consistent.
   * The invitation link is never changed, so links already sent keep working. */
  async updateCoupleDetails(id: string, weddingId: string | undefined, u: CoupleDetailsUpdate): Promise<void> {
    const query = supabase
      .from('invitations')
      .update({
        bride_name: u.brideName.trim(),
        groom_name: u.groomName.trim(),
        tagline: orNull(u.tagline),
        love_story: orNull(u.loveStory),
        how_we_met: orNull(u.howWeMet),
        vows: orNull(u.vows),
        wedding_hashtag: orNull(u.weddingHashtag),
        gift_information: orNull(u.giftInformation),
        additional_message: orNull(u.additionalMessage),
      })
    const { data, error } = await (weddingId ? query.eq('wedding_id', weddingId) : query.eq('id', id)).select('id')
    if (error) throw new Error(error.message || 'Could not save the couple details.')
    if (!data || data.length === 0) throw new Error('Could not save: not found, or you are not the owner.')
  },

  /** Saves the colour of the day. Kept separate from other edits so that, if the
   * database column has not been added yet, nothing else fails with it. */
  async updateThemeColor(id: string, themeColor: string | null): Promise<void> {
    const { data, error } = await supabase
      .from('invitations')
      .update({ theme_color: themeColor })
      .eq('id', id)
      .select('id')
    if (error) throw new Error(error.message || 'Could not save the colour.')
    if (!data || data.length === 0) throw new Error('Could not save: not found, or you are not the owner.')
  },

  /** When a wedding's hosting ends (null if unknown). */
  async getWeddingExpiry(weddingId: string): Promise<string | null> {
    const { data } = await supabase.from('weddings').select('expires_at').eq('id', weddingId).maybeSingle()
    return (data as { expires_at: string | null } | null)?.expires_at ?? null
  },

  /** Saves edits to one published ceremony. Row-level security only lets the
   * owner update, and it hides other rows silently, so we ask for the row back
   * and treat "nothing came back" as "not allowed / not found". */
  async updateMedia(id: string, update: InvitationMediaUpdate): Promise<void> {
    const { data, error } = await supabase
      .from('invitations')
      .update({
        hero_image: update.heroImage,
        gallery_images: update.galleryImages,
        custom_rsvp_message: update.customRsvpMessage.trim() || null,
        music_source: update.musicUrl ? update.musicSource ?? 'upload' : null,
        music_url: update.musicUrl,
        music_title: update.musicUrl ? update.musicTitle : null,
      })
      .eq('id', id)
      .select('id')
    if (error) throw new Error(error.message || 'Could not save your changes.')
    if (!data || data.length === 0) throw new Error('Could not save: this invitation was not found, or you are not signed in as its owner.')
  },

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
      template_id: draft.templateId,
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