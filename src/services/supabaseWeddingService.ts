import type { Wedding, WeddingInvitation } from '@/types'
import type { WeddingDraft } from '@/hooks/useWizard'
import type { PricingPlan } from '@/data/pricingPlans'
import { supabase } from './supabaseClient'
import { rowToInvitation, type InvitationRow } from './supabaseInvitationService'
import { checkPlanHosting } from '@/utils/hostingDuration'

interface WeddingRow {
  id: string
  owner_id: string
  slug: string
  status: Wedding['status']
  plan: Wedding['plan'] | null
  max_guests: number | null
  confirmed_guest_count: number
  expires_at: string | null
  payment_reference: string | null
  views: number
  created_at: string
  updated_at: string
}

function rowToWedding(row: WeddingRow): Wedding {
  return {
    id: row.id,
    ownerId: row.owner_id,
    slug: row.slug,
    status: row.status,
    plan: row.plan ?? undefined,
    maxGuests: row.max_guests ?? undefined,
    confirmedGuestCount: row.confirmed_guest_count,
    expiresAt: row.expires_at ?? undefined,
    paymentReference: row.payment_reference ?? undefined,
    views: row.views,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function generateSlug(brideName: string, groomName: string): string {
  const clean = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${clean(brideName)}-and-${clean(groomName)}`
}

export const supabaseWeddingService = {
  async getBySlugWithCeremonies(slug: string): Promise<{ wedding: Wedding; ceremonies: WeddingInvitation[] } | undefined> {
    const { data: weddingRow, error: weddingError } = await supabase
      .from('weddings')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
    if (weddingError) throw weddingError
    if (!weddingRow) return undefined

    const { data: ceremonyRows, error: ceremonyError } = await supabase
      .from('invitations')
      .select('*')
      .eq('wedding_id', weddingRow.id)
      .order('wedding_date', { ascending: true })
    if (ceremonyError) throw ceremonyError

    return {
      wedding: rowToWedding(weddingRow as WeddingRow),
      ceremonies: ((ceremonyRows ?? []) as InvitationRow[]).map(rowToInvitation),
    }
  },

  async listByOwner(ownerId: string): Promise<Wedding[]> {
    const { data, error } = await supabase
      .from('weddings')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as WeddingRow[]).map(rowToWedding)
  },

  async countCeremonies(weddingIds: string[]): Promise<Record<string, number>> {
    if (weddingIds.length === 0) return {}
    const { data, error } = await supabase
      .from('invitations')
      .select('wedding_id')
      .in('wedding_id', weddingIds)
    if (error) throw error
    const counts: Record<string, number> = {}
    for (const row of data ?? []) {
      const id = (row as { wedding_id: string }).wedding_id
      counts[id] = (counts[id] ?? 0) + 1
    }
    return counts
  },

  async publish(
    draft: WeddingDraft,
    ownerId: string,
    plan: PricingPlan,
    paymentReference: string
  ): Promise<{ wedding: Wedding; ceremonies: WeddingInvitation[] }> {
    const brideName = draft.brideName ?? 'Bride'
    const groomName = draft.groomName ?? 'Groom'
    const slug = generateSlug(brideName, groomName)

    const hosting = checkPlanHosting(plan.id, draft.ceremonies)
    const expiresAt = new Date(Date.now() + hosting.hostingDays * 24 * 60 * 60 * 1000).toISOString()

    const { data: weddingRow, error: weddingError } = await supabase
      .from('weddings')
      .insert({
        owner_id: ownerId,
        slug,
        status: 'published',
        plan: plan.id,
        max_guests: plan.maxGuests,
        expires_at: expiresAt,
        payment_reference: paymentReference,
      })
      .select()
      .single()
    if (weddingError) throw weddingError

    const ceremonyPayloads = draft.ceremonies.map((c) => ({
      slug: null,
      template_id: draft.templateId,
      owner_id: ownerId,
      wedding_id: weddingRow.id,
      bride_name: brideName,
      groom_name: groomName,
      tagline: draft.tagline ?? null,
      wedding_date: c.weddingDate || new Date().toISOString().slice(0, 10),
      wedding_time: c.weddingTime ?? null,
      venue_name: c.venueName ?? null,
      venue_address: c.venueAddress ?? null,
      city: c.city ?? null,
      state: c.state ?? null,
      country: c.country ?? null,
      map_url: c.mapUrl ?? null,
      dress_code: c.dressCode ?? null,
      reception_info: c.receptionInfo ?? null,
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
      ceremony_type: c.ceremonyType,
      ceremony_label: c.ceremonyLabel ?? null,
    }))

    const { data: ceremonyRows, error: ceremonyError } = await supabase
      .from('invitations')
      .insert(ceremonyPayloads)
      .select()
    if (ceremonyError) throw ceremonyError

    return {
      wedding: rowToWedding(weddingRow as WeddingRow),
      ceremonies: ((ceremonyRows ?? []) as InvitationRow[]).map(rowToInvitation),
    }
  },
}