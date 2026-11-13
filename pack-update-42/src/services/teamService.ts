import { supabase } from './supabaseClient'

export interface TeamMember {
  userId: string
  email: string | null
  joinedAt: string
}
export interface TeamInvite {
  token: string
  email: string | null
  createdAt: string
}

function fail(error: { message?: string }): never {
  throw new Error(error.message || 'Something went wrong. Please try again.')
}

/** The link a host sends to someone they want on their team. */
export const joinLink = (token: string) => `${window.location.origin}/join/${token}`

export const teamService = {
  async list(weddingId: string): Promise<{ members: TeamMember[]; invites: TeamInvite[] }> {
    const { data, error } = await supabase.rpc('event_team', { wid: weddingId })
    if (error) fail(error)
    const rows = (data ?? []) as { kind: string; ref: string; email: string | null; created_at: string }[]
    return {
      members: rows.filter((r) => r.kind === 'manager').map((r) => ({ userId: r.ref, email: r.email, joinedAt: r.created_at })),
      invites: rows.filter((r) => r.kind === 'invite').map((r) => ({ token: r.ref, email: r.email, createdAt: r.created_at })),
    }
  },

  /** Makes a private, single-use link (good for 14 days). With an email, only that person can use it. */
  async invite(weddingId: string, email?: string): Promise<string> {
    const { data, error } = await supabase.rpc('create_event_invite', { wid: weddingId, invite_email: email?.trim() || null })
    if (error) fail(error)
    return data as string
  },

  async revoke(token: string): Promise<void> {
    const { error } = await supabase.rpc('revoke_event_invite', { tok: token })
    if (error) fail(error)
  },

  async remove(weddingId: string, userId: string): Promise<void> {
    const { error } = await supabase.rpc('remove_event_manager', { wid: weddingId, uid: userId })
    if (error) fail(error)
  },

  async preview(token: string): Promise<{ names: string; usable: boolean; emailLocked: boolean } | null> {
    const { data, error } = await supabase.rpc('invite_preview', { tok: token })
    if (error || !data || (data as unknown[]).length === 0) return null
    const r = (data as { names: string; usable: boolean; email_locked: boolean }[])[0]
    return { names: r.names, usable: r.usable, emailLocked: r.email_locked }
  },

  async accept(token: string): Promise<string> {
    const { data, error } = await supabase.rpc('accept_event_invite', { tok: token })
    if (error) fail(error)
    return data as string
  },

  /** Ids of events this person manages but does not own. */
  async managedIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase.from('event_managers').select('wedding_id').eq('user_id', userId)
    if (error) return []
    return (data ?? []).map((r) => (r as { wedding_id: string }).wedding_id)
  },
}
