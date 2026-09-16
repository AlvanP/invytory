import type { Guest } from '@/types'

const names = [
  'Chinelo Okafor', 'David Whitfield', 'Amara Nwosu', 'James Osei', 'Priya Nair',
  'Tunde Bakare', 'Grace Adenuga', 'Samuel Eze', 'Funmi Alade', 'Robert Chen',
  'Ngozi Umeh', 'Kelechi Obi', 'Sarah Williams', 'Ifeoma Chukwu', 'Michael Ross',
  'Bola Fashola', 'Emeka Nnamdi', 'Chidinma Peters', 'Daniel Ojo', 'Aisha Bello',
]

const statuses: Guest['status'][] = ['confirmed', 'declined', 'pending']

function seededResponseDate(seed: number): string | null {
  if (seed % 3 === 2) return null
  const day = 1 + (seed % 27)
  return `2027-0${1 + (seed % 2)}-${String(day).padStart(2, '0')}`
}

export const mockGuests: Guest[] = names.map((fullName, i) => {
  const status = statuses[i % 3]
  return {
    id: `guest_${i + 1}`,
    invitationId: 'inv_001',
    fullName,
    status,
    numberOfGuests: status === 'declined' ? 0 : 1 + (i % 3),
    phone: i % 4 === 0 ? undefined : `+234 80${String(10000000 + i * 137).slice(0, 8)}`,
    message: i % 5 === 0 ? 'So excited to celebrate with you both!' : undefined,
    responseDate: status === 'pending' ? null : seededResponseDate(i),
  }
})

export function getGuestsByInvitationId(invitationId: string): Guest[] {
  return mockGuests.filter((g) => g.invitationId === invitationId)
}
