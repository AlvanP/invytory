import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { eventCopy, EVENT_KINDS } from '@/templates/events'

export function SiteFooter() {
  return (
    <footer className="bg-ivory-deep">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-[24ch] text-sm text-ink-soft">Tell a story, with your invites.</p>
          </div>

          <div>
            <p className="text-sm font-medium text-wine">Events</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft">
              {EVENT_KINDS.map((k) => (
                <li key={k}>
                  <Link to={`/templates?category=${k}`} className="hover:text-wine">{eventCopy[k].plural}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-wine">Invytory</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft">
              <li><Link to="/templates" className="hover:text-wine">Templates</Link></li>
              <li><Link to="/#how" className="hover:text-wine">How it works</Link></li>
              <li><Link to="/pricing" className="hover:text-wine">Pricing</Link></li>
              <li><Link to="/create" className="hover:text-wine">Create an invitation</Link></li>
              <li><Link to="/contact" className="hover:text-wine">Contact us</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-wine">Account</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft">
              <li><Link to="/sign-in" className="hover:text-wine">Sign in</Link></li>
              <li><Link to="/dashboard" className="hover:text-wine">Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-2 border-t border-wine/10 pt-6 text-xs text-ink-soft sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Invytory. All rights reserved.</p>
          <p className="flex gap-4">
            <Link to="/contact" className="hover:text-wine">Contact</Link>
            <Link to="/privacy" className="hover:text-wine">Privacy</Link>
            <Link to="/terms" className="hover:text-wine">Terms</Link>
            <span>www.invytory.com</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
