import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, Eye, ImageIcon, LogOut, MessageSquare, Search, ShieldCheck, Trash2, UserCheck, Users, Wallet } from 'lucide-react'
import { adminService, type AdminEvent, type AdminOverview, type AdminUser } from '@/services/adminService'
import { authService } from '@/services/authService'
import { pricingPlans } from '@/data/pricingPlans'
import { AdminMusicTab } from './AdminMusicTab'
import { AdminPricingTab } from './AdminPricingTab'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/dashboard/StatCard'
import { formatDate, formatNumber } from '@/utils/format'
import { cn } from '@/utils/cn'

type Tab = 'overview' | 'events' | 'users' | 'music' | 'pricing'

const TYPE_LABELS: Record<string, string> = {
  wedding: 'Wedding',
  dedication: 'Child dedication',
  birthday: 'Birthday',
  corporate: 'Corporate',
  funeral: 'Funeral',
}
const PLAN_NAMES: Record<string, string> = { silver: 'Essential', gold: 'Signature', none: 'No plan' }
const priceOf = (plan: string | null) => pricingPlans.find((p) => p.id === plan)?.price ?? 0
const naira = (n: number) => `₦${formatNumber(n)}`
const isExpired = (e: AdminEvent) => !!e.expires_at && new Date(e.expires_at).getTime() < Date.now()

function Bars({ data, labels }: { data: Record<string, number>; labels: Record<string, string> }) {
  const rows = Object.entries(data).sort((a, b) => b[1] - a[1])
  const max = Math.max(1, ...rows.map(([, n]) => n))
  if (rows.length === 0) return <p className="text-sm text-ink-soft">Nothing yet.</p>
  return (
    <ul className="flex flex-col gap-3">
      {rows.map(([key, n]) => (
        <li key={key} className="flex items-center gap-3 text-sm">
          <span className="w-32 shrink-0 text-ink-soft">{labels[key] ?? key}</span>
          <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-ivory-deep">
            <span className="block h-full rounded-full bg-wine" style={{ width: `${(n / max) * 100}%` }} />
          </span>
          <span className="w-10 text-right text-ink">{n}</span>
        </li>
      ))}
    </ul>
  )
}

function Overview({ events }: { events: AdminEvent[] | null }) {
  const [data, setData] = useState<AdminOverview | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    adminService.overview().then(setData).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load.'))
  }, [])
  if (error) return <p className="text-sm text-danger">{error}</p>
  if (!data) return <p className="text-sm text-ink-soft">Loading…</p>

  // Revenue is worked out from the plan each event was paid on, using today's prices.
  const revenue = Object.entries(data.plans).reduce((sum, [plan, n]) => sum + priceOf(plan) * n, 0)
  const days = data.signups_by_day
  const maxDay = Math.max(1, ...days.map((d) => d.count))

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="People signed up" value={data.users} icon={Users} />
        <StatCard label="Events created" value={data.events} icon={CalendarClock} />
        <StatCard label="Sales (estimate, ₦)" value={revenue} icon={Wallet} />
        <StatCard label="Invitation views" value={data.views} icon={Eye} />
        <StatCard label="New people, 7 days" value={data.users_7d} icon={UserCheck} />
        <StatCard label="New events, 7 days" value={data.events_7d} icon={CalendarClock} />
        <StatCard label="RSVPs received" value={data.rsvps} icon={UserCheck} />
        <StatCard label="Album photos" value={data.album_photos} icon={ImageIcon} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border border-ink/10 bg-white p-6">
          <h2 className="mb-4 font-display text-xl text-ink">Events by kind</h2>
          <Bars data={data.event_types} labels={TYPE_LABELS} />
        </section>
        <section className="rounded-md border border-ink/10 bg-white p-6">
          <h2 className="mb-4 font-display text-xl text-ink">Events by plan</h2>
          <Bars data={data.plans} labels={PLAN_NAMES} />
          <p className="mt-4 text-xs text-ink-soft/70">
            {data.published} live · {data.suspended} suspended · {data.expired} past their hosting date · {data.wall_messages} wall messages
          </p>
        </section>
      </div>

      <section className="rounded-md border border-ink/10 bg-white p-6">
        <h2 className="mb-4 font-display text-xl text-ink">Sign-ups, last 30 days ({data.users_30d})</h2>
        {days.length === 0 ? (
          <p className="text-sm text-ink-soft">No sign-ups in the last 30 days.</p>
        ) : (
          <div className="flex h-28 items-end gap-1">
            {days.map((d) => (
              <span key={d.day} title={`${d.day}: ${d.count}`} className="max-w-8 flex-1 rounded-t-xs bg-wine/80" style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: 4 }} />
            ))}
          </div>
        )}
      </section>

      {events && events.length > 0 && (
        <section className="rounded-md border border-ink/10 bg-white p-6">
          <h2 className="mb-4 font-display text-xl text-ink">Latest events</h2>
          <ul className="divide-y divide-ink/10 text-sm">
            {events.slice(0, 6).map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0 truncate text-ink">{e.title || e.slug}</span>
                <span className="shrink-0 text-xs text-ink-soft">{TYPE_LABELS[e.event_type] ?? e.event_type} · {formatDate(e.created_at.slice(0, 10))}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Events({ events, reload }: { events: AdminEvent[] | null; reload: () => Promise<void> }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [plan, setPlan] = useState('all')
  const [kind, setKind] = useState('all')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (events ?? []).filter((e) => {
      if (status === 'expired' ? !isExpired(e) : status !== 'all' && e.status !== status) return false
      if (plan !== 'all' && (e.plan ?? 'none') !== plan) return false
      if (kind !== 'all' && e.event_type !== kind) return false
      return !q || [e.title, e.slug, e.owner_email, e.payment_reference].some((v) => v?.toLowerCase().includes(q))
    })
  }, [events, query, status, plan, kind])

  async function run(id: string, action: () => Promise<void>) {
    setBusyId(id)
    setError(null)
    try {
      await action()
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.')
    } finally {
      setBusyId(null)
    }
  }

  function extend(e: AdminEvent) {
    const raw = window.prompt('Add how many days of hosting?', '30')
    const days = Number(raw)
    if (!raw || !Number.isFinite(days) || days === 0) return
    const base = e.expires_at && new Date(e.expires_at).getTime() > Date.now() ? new Date(e.expires_at).getTime() : Date.now()
    void run(e.id, () => adminService.setExpiry(e.id, new Date(base + days * 86_400_000).toISOString()))
  }

  function remove(e: AdminEvent) {
    const typed = window.prompt(`This deletes "${e.title || e.slug}" with its guests, messages and album records for good. Type DELETE to confirm.`)
    if (typed !== 'DELETE') return
    void run(e.id, () => adminService.deleteEvent(e.id))
  }

  const select = 'rounded-xs border border-ink/15 bg-white px-3 py-2 text-sm text-ink'
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <label className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search names, links, emails, payment reference" className={cn(select, 'w-full pl-9')} />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={select} aria-label="Status">
          <option value="all">Any status</option>
          <option value="published">Live</option>
          <option value="archived">Suspended</option>
          <option value="draft">Draft</option>
          <option value="expired">Past hosting date</option>
        </select>
        <select value={plan} onChange={(e) => setPlan(e.target.value)} className={select} aria-label="Plan">
          <option value="all">Any plan</option>
          <option value="silver">Essential</option>
          <option value="gold">Signature</option>
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value)} className={select} aria-label="Kind">
          <option value="all">Any kind</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      <p className="text-xs text-ink-soft">{events ? `${shown.length} of ${events.length} events` : 'Loading…'}</p>

      <div className="overflow-x-auto rounded-md border border-ink/10 bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-ink/10 text-xs text-ink-soft">
            <tr>
              <th className="p-3 font-medium">Event</th>
              <th className="p-3 font-medium">Owner</th>
              <th className="p-3 font-medium">Plan</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Activity</th>
              <th className="p-3 font-medium">Hosted until</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {shown.map((e) => (
              <tr key={e.id} className="align-top">
                <td className="p-3">
                  <Link to={`/invitation/${e.slug}`} target="_blank" className="font-medium text-ink hover:underline">{e.title || e.slug}</Link>
                  <p className="text-xs text-ink-soft">{TYPE_LABELS[e.event_type] ?? e.event_type} · {e.ceremonies} {e.ceremonies === 1 ? 'ceremony' : 'ceremonies'} · {formatDate(e.created_at.slice(0, 10))}</p>
                </td>
                <td className="p-3 text-ink-soft">{e.owner_email ?? '—'}</td>
                <td className="p-3 text-ink-soft">{PLAN_NAMES[e.plan ?? 'none']}</td>
                <td className="p-3">
                  <span className={cn('rounded-full px-2 py-0.5 text-xs', e.status === 'published' ? 'bg-success/15 text-success' : 'bg-ink/10 text-ink-soft')}>
                    {e.status === 'published' ? 'Live' : e.status === 'archived' ? 'Suspended' : 'Draft'}
                  </span>
                  {isExpired(e) && <p className="mt-1 text-xs text-danger">Past hosting date</p>}
                </td>
                <td className="p-3 text-xs text-ink-soft">
                  <span className="flex items-center gap-1"><Eye className="size-3" /> {e.views}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="size-3" /> {e.rsvps} RSVPs</span>
                  {e.album_photos > 0 && <span className="flex items-center gap-1"><ImageIcon className="size-3" /> {e.album_photos}</span>}
                </td>
                <td className="p-3 text-xs text-ink-soft">{e.expires_at ? formatDate(e.expires_at.slice(0, 10)) : '—'}</td>
                <td className="p-3">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <Button size="sm" variant="outline" disabled={busyId === e.id} onClick={() => extend(e)}>Extend</Button>
                    <Button size="sm" variant="outline" disabled={busyId === e.id} onClick={() => run(e.id, () => adminService.setStatus(e.id, e.status === 'archived' ? 'published' : 'archived'))}>
                      {e.status === 'archived' ? 'Restore' : 'Suspend'}
                    </Button>
                    <Button size="sm" variant="danger" disabled={busyId === e.id} onClick={() => remove(e)} aria-label="Delete event"><Trash2 className="size-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {events && shown.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-ink-soft">No events match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    adminService.users().then(setUsers).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load.'))
  }, [])
  const shown = (users ?? []).filter((u) => !query.trim() || u.email?.toLowerCase().includes(query.trim().toLowerCase()))
  return (
    <div className="flex flex-col gap-4">
      <label className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by email" className="w-full rounded-xs border border-ink/15 bg-white py-2 pl-9 pr-3 text-sm text-ink" />
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <p className="text-xs text-ink-soft">{users ? `${shown.length} of ${users.length} people` : 'Loading…'}</p>
      <div className="overflow-x-auto rounded-md border border-ink/10 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-ink/10 text-xs text-ink-soft">
            <tr><th className="p-3 font-medium">Email</th><th className="p-3 font-medium">Joined</th><th className="p-3 font-medium">Last seen</th><th className="p-3 font-medium">Events</th></tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {shown.map((u) => (
              <tr key={u.id}>
                <td className="p-3 text-ink">{u.email ?? '—'} {u.is_admin && <span className="ml-1 rounded-full bg-wine/10 px-2 py-0.5 text-xs text-wine">Admin</span>}</td>
                <td className="p-3 text-ink-soft">{formatDate(u.created_at.slice(0, 10))}</td>
                <td className="p-3 text-ink-soft">{u.last_sign_in_at ? formatDate(u.last_sign_in_at.slice(0, 10)) : 'Never'}</td>
                <td className="p-3 text-ink-soft">{u.events}</td>
              </tr>
            ))}
            {users && shown.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-ink-soft">No people match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AdminPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('overview')
  const [events, setEvents] = useState<AdminEvent[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    try {
      setEvents(await adminService.events())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load events.')
      setEvents([])
    }
  }, [])
  useEffect(() => {
    void loadEvents()
  }, [loadEvents])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'events', label: 'Events' },
    { id: 'users', label: 'People' },
    { id: 'music', label: 'Music' },
    { id: 'pricing', label: 'Pricing' },
  ]

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Logo className="text-lg" />
          <span className="flex items-center gap-1 rounded-full bg-wine px-2.5 py-1 text-xs text-ivory"><ShieldCheck className="size-3.5" /> Platform admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/dashboard"><Button size="sm" variant="outline">My dashboard</Button></Link>
          <Button size="sm" variant="ghost" icon={<LogOut className="size-4" />} onClick={async () => { await authService.signOut(); navigate('/') }}>Sign out</Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <nav className="mb-8 flex gap-1 border-b border-ink/10" aria-label="Admin">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn('-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors', tab === t.id ? 'border-wine text-wine' : 'border-transparent text-ink-soft hover:text-ink')}
            >
              {t.label}
            </button>
          ))}
        </nav>
        {error && <p className="mb-4 text-sm text-danger">{error}</p>}
        {tab === 'overview' && <Overview events={events} />}
        {tab === 'events' && <Events events={events} reload={loadEvents} />}
        {tab === 'users' && <UsersTab />}
        {tab === 'music' && <AdminMusicTab />}
        {tab === 'pricing' && <AdminPricingTab />}
      </main>
    </div>
  )
}
