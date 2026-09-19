import { useEffect, useState } from 'react'
import { Eye, CheckCircle2, XCircle, Users, Clock, MessageSquare } from 'lucide-react'
import type { DashboardStats, WeddingInvitation } from '@/types'
import { invitationService } from '@/services/invitationService'
import { guestService } from '@/services/guestService'
import { useAuth } from '@/hooks/useAuth'
import { StatCard } from '@/components/dashboard/StatCard'
import { DashboardCardSkeleton } from '@/components/ui/Skeleton'

export function DashboardOverviewPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [primaryInvitation, setPrimaryInvitation] = useState<WeddingInvitation | null>(null)
  const [hasInvitations, setHasInvitations] = useState(true)

  useEffect(() => {
    if (!user) return

    async function loadStats() {
      const invitations = await invitationService.list(user!.id)
      setPrimaryInvitation(invitations[0] ?? null)
      setHasInvitations(invitations.length > 0)

      const guestLists = await Promise.all(invitations.map((inv) => guestService.listByInvitation(inv.id)))
      const allGuests = guestLists.flat()

      setStats({
        invitationViews: invitations.reduce((sum, inv) => sum + inv.views, 0),
        confirmed: allGuests.filter((g) => g.status === 'confirmed').length,
        declined: allGuests.filter((g) => g.status === 'declined').length,
        pending: allGuests.filter((g) => g.status === 'pending').length,
        expectedGuests: allGuests
          .filter((g) => g.status === 'confirmed')
          .reduce((sum, g) => sum + g.numberOfGuests, 0),
        messages: allGuests.filter((g) => !!g.message).length,
      })
    }

    loadStats()
  }, [user])

  const greetingName = primaryInvitation
    ? `${primaryInvitation.brideName} & ${primaryInvitation.groomName}`
    : user?.email ?? 'there'

  return (
    <div>
      <p className="text-xs tracking-[0.2em] text-gold">Overview</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Welcome back, {greetingName}</h1>
      <p className="mt-1 text-sm text-ink-soft">Here&rsquo;s how your invitation is doing.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {!stats ? (
          Array.from({ length: 6 }).map((_, i) => <DashboardCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Invitation Views" value={stats.invitationViews} icon={Eye} />
            <StatCard label="Confirmed" value={stats.confirmed} icon={CheckCircle2} />
            <StatCard label="Declined" value={stats.declined} icon={XCircle} />
            <StatCard label="Pending" value={stats.pending} icon={Clock} />
            <StatCard label="Expected Guests" value={stats.expectedGuests} icon={Users} />
            <StatCard label="Messages" value={stats.messages} icon={MessageSquare} />
          </>
        )}
      </div>

      {stats && !hasInvitations && (
        <p className="mt-4 text-xs text-ink-soft/60">
          Numbers will appear here once you publish your first invitation and it starts receiving views and responses.
        </p>
      )}
    </div>
  )
}