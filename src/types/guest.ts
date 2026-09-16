export type RsvpStatus = 'confirmed' | 'declined' | 'pending'

export interface Guest {
  id: string
  invitationId: string
  fullName: string
  status: RsvpStatus
  numberOfGuests: number
  phone?: string
  message?: string
  responseDate: string | null // ISO date, null while pending
}

/** Payload the RSVP form submits — kept separate from the stored Guest
 * record so the guest-facing form doesn't need to know about IDs. */
export interface RsvpSubmission {
  fullName: string
  attending: boolean
  numberOfGuests: number
  phone?: string
  message?: string
}
