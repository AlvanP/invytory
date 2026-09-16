import { Outlet, Link } from 'react-router-dom'
import { DashboardSidebar } from './DashboardSidebar'

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <DashboardSidebar />
      <div className="flex-1">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4 md:hidden">
          <Link to="/" className="text-sm text-ink-soft hover:text-ink">&larr; Back to site</Link>
        </div>
        <main className="p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
