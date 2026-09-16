import type { Guest } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/utils/format'
import { EmptyState } from '@/components/ui/State'

const statusTone: Record<Guest['status'], 'confirmed' | 'declined' | 'pending'> = {
  confirmed: 'confirmed',
  declined: 'declined',
  pending: 'pending',
}

export function GuestTable({ guests }: { guests: Guest[] }) {
  if (guests.length === 0) {
    return <EmptyState title="No guests match your search" description="Try a different name or filter." />
  }

  return (
    <div className="overflow-x-auto rounded-md border border-ink/10 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink-soft/70">
            <th className="px-4 py-3 font-medium">Guest Name</th>
            <th className="px-4 py-3 font-medium">Attendance</th>
            <th className="px-4 py-3 font-medium">Guests</th>
            <th className="px-4 py-3 font-medium">Phone</th>
            <th className="px-4 py-3 font-medium">Message</th>
            <th className="px-4 py-3 font-medium">Response Date</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((g) => (
            <tr key={g.id} className="border-b border-ink/8 last:border-0">
              <td className="px-4 py-4 text-ink">{g.fullName}</td>
              <td className="px-4 py-4"><Badge tone={statusTone[g.status]}>{g.status}</Badge></td>
              <td className="px-4 py-4 text-ink-soft">{g.numberOfGuests}</td>
              <td className="px-4 py-4 text-ink-soft">{g.phone ?? '—'}</td>
              <td className="px-4 py-4 max-w-[220px] truncate text-ink-soft" title={g.message}>{g.message ?? '—'}</td>
              <td className="px-4 py-4 text-ink-soft">{g.responseDate ? formatDate(g.responseDate.slice(0, 10)) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
