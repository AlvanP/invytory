import { supabase } from './supabaseClient'

export interface WallMessage {
  id: string
  invitationId: string
  guestName: string
  message: string
  createdAt: string
}

interface WallRow {
  id: string
  invitation_id: string
  guest_name: string
  message: string
  created_at: string
}

const toMessage = (r: WallRow): WallMessage => ({
  id: r.id,
  invitationId: r.invitation_id,
  guestName: r.guest_name,
  message: r.message,
  createdAt: r.created_at,
})

/** Most messages a wall loads at once (the newest ones). */
export const WALL_LIMIT = 100

export const supabaseWallService = {
  async list(invitationId: string): Promise<WallMessage[]> {
    const { data, error } = await supabase
      .from('wall_messages')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false })
      .limit(WALL_LIMIT)
    if (error) throw error
    return (data as WallRow[]).map(toMessage)
  },

  async listByInvitations(invitationIds: string[]): Promise<WallMessage[]> {
    if (invitationIds.length === 0) return []
    const { data, error } = await supabase
      .from('wall_messages')
      .select('*')
      .in('invitation_id', invitationIds)
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) throw error
    return (data as WallRow[]).map(toMessage)
  },

  /** Adds a message. Like the RSVP insert, it does not read the row back (guests are anonymous). */
  async post(invitationId: string, guestName: string, message: string): Promise<void> {
    const { error } = await supabase.from('wall_messages').insert({
      invitation_id: invitationId,
      guest_name: guestName.trim().slice(0, 80),
      message: message.trim().slice(0, 500),
    })
    if (error) {
      console.error('[wall] insert failed:', error)
      throw new Error(error.message || 'Could not post your message.')
    }
  },

  /** Owner only. Asks for the row back, because row-level security hides rows silently. */
  async remove(id: string): Promise<void> {
    const { data, error } = await supabase.from('wall_messages').delete().eq('id', id).select('id')
    if (error) throw new Error(error.message)
    if (!data || data.length === 0) throw new Error('Could not delete: not found, or you are not the owner.')
  },
}
