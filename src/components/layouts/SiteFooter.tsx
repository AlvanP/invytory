import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-ivory-deep">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="font-display text-lg text-ink">Evermore</p>
            <p className="mt-2 max-w-[22ch] text-sm text-ink-soft">
              Digital invitations for the moments worth remembering.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft/70">Product</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft">
              <li><Link to="/templates" className="hover:text-ink">Templates</Link></li>
              <li><Link to="/create" className="hover:text-ink">Create an Invitation</Link></li>
              <li><Link to="/dashboard" className="hover:text-ink">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft/70">Company</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft">
              <li><span className="cursor-default">About</span></li>
              <li><span className="cursor-default">Contact</span></li>
              <li><span className="cursor-default">Privacy</span></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft/70">Coming later</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft/70">
              <li>Birthdays</li>
              <li>Child dedications</li>
              <li>Corporate events</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-ink/10 pt-6 text-xs text-ink-soft/70 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Evermore. All rights reserved.</p>
          <p>Made for weddings, first.</p>
        </div>
      </div>
    </footer>
  )
}
