import { NavLink, useParams, useNavigate } from 'react-router-dom'
import { LayoutGrid, ScrollText, Users, Settings, PlusCircle, LogOut } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'

export function DashboardSidebar() {
  const { eventId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const links = [
    { to: '/dashboard', label: 'Overview', icon: LayoutGrid, end: true },
    { to: '/dashboard/events', label: 'My Invitations', icon: ScrollText },
    ...(eventId
      ? [
          { to: `/dashboard/events/${eventId}/guests`, label: 'Guests', icon: Users },
          { to: `/dashboard/events/${eventId}/settings`, label: 'Settings', icon: Settings },
        ]
      : []),
  ]

  async function handleSignOut() {
    await authService.signOut()
    navigate('/')
  }

  return (
    <aside className="flex w-full shrink-0 flex-col justify-between border-b border-ink/10 bg-ivory-deep md:h-full md:w-60 md:border-b-0 md:border-r">
      <div>
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
      </div>

      <div className="border-t border-ink/10 p-4">
        {user?.email && <p className="truncate px-2 pb-2 text-xs text-ink-soft/70">{user.email}</p>}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xs px-2 py-2 text-sm text-ink-soft hover:bg-ink/5 hover:text-ink"
        >
          <LogOut className="size-4" strokeWidth={1.75} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}