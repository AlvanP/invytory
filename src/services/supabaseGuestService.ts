import type { Guest, RsvpSubmission } from '@/types'
import { supabase } from './supabaseClient'

interface GuestRow {
  id: string
  invitation_id: string
  full_name: string
  status: Guest['status']
  number_of_guests: number
  phone: string | null
  message: string | null
  response_date: string | null
}

function rowToGuest(row: GuestRow): Guest {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    fullName: row.full_name,
    status: row.status,
    numberOfGuests: row.number_of_guests,
    phone: row.phone ?? undefined,
    message: row.message ?? undefined,
    responseDate: row.response_date,
  }
}

export const supabaseGuestService = {
  async listByInvitation(invitationId: string): Promise<Guest[]> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('response_date', { ascending: false })
    if (error) throw error
    return (data as GuestRow[]).map(rowToGuest)
  },

  async submitRsvp(invitationId: string, submission: RsvpSubmission): Promise<Guest> {
    const payload = {
      invitation_id: invitationId,
      full_name: submission.fullName,
      status: submission.attending ? 'confirmed' : 'declined',
      number_of_guests: submission.attending ? submission.numberOfGuests : 0,
      phone: submission.phone ?? null,
      message: submission.message ?? null,
      response_date: new Date().toISOString(),
    }

    const { data, error } = await supabase.from('guests').insert(payload).select().single()
    if (error) throw error
    return rowToGuest(data as GuestRow)
  },
}