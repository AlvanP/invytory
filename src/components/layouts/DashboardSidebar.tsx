import { NavLink, useParams } from 'react-router-dom'
import { LayoutGrid, ScrollText, Users, Settings, PlusCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

export function DashboardSidebar() {
  const { eventId } = useParams()
  const activeEventId = eventId ?? 'inv_001'

  const links = [
    { to: '/dashboard', label: 'Overview', icon: LayoutGrid, end: true },
    { to: '/dashboard/events', label: 'My Invitations', icon: ScrollText },
    { to: `/dashboard/events/${activeEventId}/guests`, label: 'Guests', icon: Users },
    { to: `/dashboard/events/${activeEventId}/settings`, label: 'Settings', icon: Settings },
  ]

  return (
    <aside className="w-full shrink-0 border-b border-ink/10 bg-ivory-deep md:h-full md:w-60 md:border-b-0 md:border-r">
      <div className="p-6">
        <p className="font-display text-lg text-ink">Evermore</p>
        <p className="text-xs text-ink-soft">Organizer dashboard</p>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-col md:overflow-visible md:pb-0" aria-label="Dashboard">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex shrink-0 items-center gap-3 rounded-xs px-3 py-2.5 text-sm transition-colors',
                isActive ? 'bg-ink text-ivory' : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
              )
            }
          >
            <Icon className="size-4" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}

        <NavLink
          to="/create"
          className="mt-0 flex shrink-0 items-center gap-3 rounded-xs border border-gold/50 px-3 py-2.5 text-sm text-gold hover:bg-gold/10 md:mt-4"
        >
          <PlusCircle className="size-4" strokeWidth={1.75} />
          Create Invitation
        </NavLink>
      </nav>
    </aside>
  )
}
