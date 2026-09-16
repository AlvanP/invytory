import { useEffect, useState } from 'react'
import { Eye, CheckCircle2, XCircle, Users, Clock, MessageSquare } from 'lucide-react'
import type { DashboardStats } from '@/types'
import { getDashboardStats } from '@/data/mockDashboard'
import { StatCard } from '@/components/dashboard/StatCard'
import { DashboardCardSkeleton } from '@/components/ui/Skeleton'

export function DashboardOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    setTimeout(() => setStats(getDashboardStats()), 200)
  }, [])

  return (
    <div>
      <p className="text-xs tracking-[0.2em] text-gold">Overview</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Welcome back, Ada &amp; Michael</h1>
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
    </div>
  )
}
