import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Search, Download } from 'lucide-react'
import type { Guest, RsvpStatus } from '@/types'
import { ceremonyDisplayName } from '@/types'
import { guestService } from '@/services/guestService'
import { weddingService } from '@/services/weddingService'
import { downloadCsv, guestsToCsv, safeFilename } from '@/utils/guestCsv'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { GuestTable } from '@/components/dashboard/GuestTable'
import { WallModeration } from '@/components/dashboard/WallModeration'
import { GuestRowSkeleton } from '@/components/ui/Skeleton'
import { SEED_INVITATION_ID } from '@/utils/constants'

type SortKey = 'name' | 'date'

function SummaryTile({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="rounded-md border border-ink/10 bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-ink-soft/70">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-soft">{note}</p>
    </div>
  )
}

export function DashboardGuestsPage() {
  const { eventId, weddingId } = useParams<{ eventId: string; weddingId: string }>()
  const [guests, setGuests] = useState<Guest[] | null>(null)
  // Wedding view only: the ceremonies of this wedding, and which one is shown.
  const [ceremonyNames, setCeremonyNames] = useState<Record<string, string> | undefined>(undefined)
  const [ceremonyFilter, setCeremonyFilter] = useState('all')
  const [loadError, setLoadError] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<RsvpStatus | 'all'>('all')
  const [sort, setSort] = useState<SortKey>('name')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (weddingId) {
        const ceremonies = await weddingService.getCeremoniesById(weddingId)
        const list = await guestService.listByInvitations(ceremonies.map((c) => c.id))
        if (cancelled) return
        setCeremonyNames(Object.fromEntries(ceremonies.map((c) => [c.id, ceremonyDisplayName(c)])))
        setGuests(list)
        setLoadError(false)
      } else {
        const list = await guestService.listByInvitation(eventId ?? SEED_INVITATION_ID)
        if (cancelled) return
        setCeremonyNames(undefined)
        setGuests(list)
        setLoadError(false)
      }
    }
    load().catch(() => {
      if (!cancelled) setLoadError(true)
    })
    return () => {
      cancelled = true
    }
  }, [eventId, weddingId])

  // Guests of the chosen ceremony (everyone when "All ceremonies").
  const scoped = useMemo(() => {
    if (!guests) return null
    return ceremonyFilter === 'all' ? guests : guests.filter((g) => g.invitationId === ceremonyFilter)
  }, [guests, ceremonyFilter])

  // Totals always cover every response, whatever the search or filter shows.
  const summary = useMemo(() => {
    const all = scoped ?? []
    const confirmed = all.filter((g) => g.status === 'confirmed')
    const declined = all.filter((g) => g.status === 'declined')
    return {
      attendingPeople: confirmed.reduce((sum, g) => sum + g.numberOfGuests, 0),
      attendingResponses: confirmed.length,
      declinedResponses: declined.length,
      totalResponses: all.length,
    }
  }, [scoped])

  const filtered = useMemo(() => {
    if (!scoped) return []
    let list = scoped.filter((g) => g.fullName.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter !== 'all') list = list.filter((g) => g.status === statusFilter)
    list = [...list].sort((a, b) => {
      if (sort === 'name') return a.fullName.localeCompare(b.fullName)
      return (b.responseDate ?? '').localeCompare(a.responseDate ?? '')
    })
    return list
  }, [scoped, search, statusFilter, sort])

  const exportCsv = () => {
    const rows = filtered.map((guest) => ({ guest, ceremony: ceremonyNames?.[guest.invitationId] }))
    const csv = guestsToCsv(rows, !!ceremonyNames)
    const scope = ceremonyFilter !== 'all' && ceremonyNames ? `-${safeFilename(ceremonyNames[ceremonyFilter] ?? '')}` : ''
    downloadCsv(`invytory-guests${scope}.csv`, csv)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] text-gold">Guests</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Guest List</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<Download className="size-4" />}
          onClick={exportCsv}
          disabled={!guests || filtered.length === 0}
          title="Download the guests shown below as a spreadsheet (CSV)"
        >
          Export CSV
        </Button>
      </div>

      {loadError && (
        <p role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load the guest list. Check your internet and refresh the page.
        </p>
      )}

      {guests && (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryTile
            label="Attending"
            value={summary.attendingPeople}
            note={`${summary.attendingResponses} ${summary.attendingResponses === 1 ? 'RSVP' : 'RSVPs'}, counting each guest they bring`}
          />
          <SummaryTile
            label="Declined"
            value={summary.declinedResponses}
            note={summary.declinedResponses === 1 ? 'person can’t make it' : 'people can’t make it'}
          />
          <SummaryTile
            label="Total responses"
            value={summary.totalResponses}
            note="Yes and no replies combined"
          />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search guests by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search guests"
          />
        </div>
        {ceremonyNames && (
          <div className="w-full sm:w-48">
            <Select aria-label="Filter by ceremony" value={ceremonyFilter} onChange={(e) => setCeremonyFilter(e.target.value)}>
              <option value="all">All ceremonies</option>
              {Object.entries(ceremonyNames).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </Select>
          </div>
        )}
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
        {loadError ? null : !guests ? (
          <div className="rounded-md border border-ink/10 bg-white">
            {Array.from({ length: 5 }).map((_, i) => <GuestRowSkeleton key={i} />)}
          </div>
        ) : (
          <GuestTable guests={filtered} ceremonyNames={ceremonyNames} />
        )}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft/60">
        <Search className="size-3.5" /> {filtered.length} of {scoped?.length ?? 0} guests shown
      </p>

      <WallModeration
        invitationIds={ceremonyNames ? Object.keys(ceremonyNames) : [eventId ?? SEED_INVITATION_ID]}
        ceremonyNames={ceremonyNames}
      />
    </div>
  )
}
