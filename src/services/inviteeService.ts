import { supabase } from './supabaseClient'

export interface InviteLink {
  id: string
  weddingId: string
  guestName: string
  code: string
  openedCount: number
  firstOpenedAt: string | null
  lastOpenedAt: string | null
  createdAt: string
}

interface Row {
  id: string
  wedding_id: string
  guest_name: string
  code: string
  opened_count: number
  first_opened_at: string | null
  last_opened_at: string | null
  created_at: string
}

const toLink = (r: Row): InviteLink => ({
  id: r.id,
  weddingId: r.wedding_id,
  guestName: r.guest_name,
  code: r.code,
  openedCount: r.opened_count,
  firstOpenedAt: r.first_opened_at,
  lastOpenedAt: r.last_opened_at,
  createdAt: r.created_at,
})

// No 0/O/1/l/i, so a code read aloud or typed from a screenshot is not mixed up.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'

/** A short, hard-to-guess code, e.g. "k7m2xq9d". */
function makeCode(): string {
  const bytes = new Uint8Array(10)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
}

/** Query-string name used in personal links: /invitation/<slug>?to=<code> */
export const INVITE_PARAM = 'to'

export function inviteUrl(slug: string, code: string, v = ''): string {
  return `${window.location.origin}/invitation/${slug}?${INVITE_PARAM}=${code}${v ? `&v=${v}` : ''}`
}

export const inviteeService = {
  async list(weddingId: string): Promise<InviteLink[]> {
    const { data, error } = await supabase
      .from('invite_links')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data as Row[]).map(toLink)
  },

  /** Adds one link per name. Blank and repeated names are skipped. Returns the new links. */
  async add(weddingId: string, names: string[]): Promise<InviteLink[]> {
    const seen = new Set<string>()
    const clean = names
      .map((n) => n.replace(/\s+/g, ' ').trim().slice(0, 80))
      .filter((n) => n && !seen.has(n.toLowerCase()) && seen.add(n.toLowerCase()))
    if (clean.length === 0) return []
    const rows = clean.map((guest_name) => ({ wedding_id: weddingId, guest_name, code: makeCode() }))
    const { data, error } = await supabase.from('invite_links').insert(rows).select('*')
    if (error) throw new Error(error.message)
    return (data as Row[]).map(toLink)
  },

  async remove(id: string): Promise<void> {
    const { data, error } = await supabase.from('invite_links').delete().eq('id', id).select('id')
    if (error) throw new Error(error.message)
    if (!data || data.length === 0) throw new Error('Could not delete: not found, or you are not the owner.')
  },

  /** For guests: whose link is this? null when the code is unknown. Never throws. */
  async lookup(code: string): Promise<{ name: string; weddingId: string } | null> {
    try {
      const { data, error } = await supabase.rpc('get_invite_link', { link_code: code })
      if (error || !Array.isArray(data) || data.length === 0) return null
      const row = data[0] as { guest_name: string; wedding_id: string }
      return { name: row.guest_name, weddingId: row.wedding_id }
    } catch {
      return null
    }
  },

  async trackOpen(code: string): Promise<void> {
    try {
      await supabase.rpc('track_invite_open', { link_code: code })
    } catch {
      // Counting is a bonus; never get in the guest's way.
    }
  },

  /** For the host: which personal links have already answered, and how. Best effort; empty if unavailable. */
  async rsvpByCode(codes: string[]): Promise<Record<string, 'confirmed' | 'declined'>> {
    if (codes.length === 0) return {}
    try {
      const { data, error } = await supabase.from('guests').select('invite_code, status').in('invite_code', codes)
      if (error || !data) return {}
      const out: Record<string, 'confirmed' | 'declined'> = {}
      for (const row of data as { invite_code: string; status: string }[]) {
        if (row.status === 'confirmed' || row.status === 'declined') out[row.invite_code] = row.status
      }
      return out
    } catch {
      return {}
    }
  },
}
