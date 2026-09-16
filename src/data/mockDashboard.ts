import type { DashboardStats } from '@/types'
import { mockGuests } from './mockGuests'

export function getDashboardStats(): DashboardStats {
  const confirmed = mockGuests.filter((g) => g.status === 'confirmed')
  const declined = mockGuests.filter((g) => g.status === 'declined')
  const pending = mockGuests.filter((g) => g.status === 'pending')
  const expectedGuests = confirmed.reduce((sum, g) => sum + g.numberOfGuests, 0)
  const messages = mockGuests.filter((g) => !!g.message).length

  return {
    invitationViews: 1284,
    confirmed: confirmed.length,
    declined: declined.length,
    pending: pending.length,
    expectedGuests,
    messages,
  }
}
