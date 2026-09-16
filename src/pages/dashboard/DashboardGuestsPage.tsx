import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Search, Download } from 'lucide-react'
import type { Guest, RsvpStatus } from '@/types'
import { guestService } from '@/services/guestService'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { GuestTable } from '@/components/dashboard/GuestTable'
import { GuestRowSkeleton } from '@/components/ui/Skeleton'
import { SEED_INVITATION_ID } from '@/utils/constants'

type SortKey = 'name' | 'date'

export function DashboardGuestsPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const [guests, setGuests] = useState<Guest[] | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<RsvpStatus | 'all'>('all')
  const [sort, setSort] = useState<SortKey>('name')

  useEffect(() => {
    guestService.listByInvitation(eventId ?? SEED_INVITATION_ID).then(setGuests)
  }, [eventId])

  const filtered = useMemo(() => {
    if (!guests) return []
    let list = guests.filter((g) => g.fullName.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter !== 'all') list = list.filter((g) => g.status === statusFilter)
    list = [...list].sort((a, b) => {
      if (sort === 'name') return a.fullName.localeCompare(b.fullName)
      return (b.responseDate ?? '').localeCompare(a.responseDate ?? '')
    })
    return list
  }, [guests, search, statusFilter, sort])

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] text-gold">Guests</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Guest List</h1>
        </div>
        <Button variant="outline" size="sm" icon={<Download className="size-4" />} title="CSV export coming soon">
          Export
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search guests by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search guests"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as RsvpStatus | 'all')}>
            <option value="all">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="declined">Declined</option>
            <option value="pending">Pending</option>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select aria-label="Sort guests" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="name">Sort by name</option>
            <option value="date">Sort by response date</option>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        {!guests ? (
          <div className="rounded-md border border-ink/10 bg-white">
            {Array.from({ length: 5 }).map((_, i) => <GuestRowSkeleton key={i} />)}
          </div>
        ) : (
          <GuestTable guests={filtered} />
        )}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft/60">
        <Search className="size-3.5" /> {filtered.length} of {guests?.length ?? 0} guests shown
      </p>
    </div>
  )
}
