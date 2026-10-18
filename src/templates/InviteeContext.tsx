import { createContext, useContext } from 'react'
import type { EventKind } from './events'

/** The person a personal link was made for: { name: "Chief Emeka Okonkwo", code: "k7m2xq9d" }. */
export interface Invitee {
  name: string
  code: string
}

export const InviteeContext = createContext<Invitee | null>(null)

/** The guest this invitation was personalised for, or null for an ordinary link. */
export function useInvitee(): Invitee | null {
  return useContext(InviteeContext)
}

/** What follows "is specially invited to", so the line reads naturally for each kind of event. */
export const specialLead: Record<EventKind, string> = {
  wedding: 'the wedding of',
  'child-dedication': 'the dedication of',
  birthday: 'the birthday celebration of',
  corporate: '',
  funeral: 'the celebration of life of',
}
