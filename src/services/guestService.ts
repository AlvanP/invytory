import type { Guest, RsvpSubmission } from '@/types'
import { getGuestsByInvitationId } from '@/data/mockGuests'

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// In-memory store so RSVP submissions are reflected during the session,
// even though nothing is persisted to a real backend yet.
const sessionGuests: Guest[] = []

const mockGuestService = {
  async listByInvitation(invitationId: string): Promise<Guest[]> {
    const stored = sessionGuests.filter((g) => g.invitationId === invitationId)
    return delay([...getGuestsByInvitationId(invitationId), ...stored])
  },

  async submitRsvp(invitationId: string, submission: RsvpSubmission): Promise<Guest> {
    const guest: Guest = {
      id: `guest_rsvp_${Math.random().toString(36).slice(2, 9)}`,
      invitationId,
      fullName: submission.fullName,
      status: submission.attending ? 'confirmed' : 'declined',
      numberOfGuests: submission.attending ? submission.numberOfGuests : 0,
      phone: submission.phone,
      message: submission.message,
      responseDate: new Date().toISOString(),
    }
    sessionGuests.push(guest)
    return delay(guest, 500)
  },
}

export const guestService = mockGuestService
export type GuestService = typeof mockGuestService
