import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const links = [
  { to: '/templates', label: 'Templates' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/dashboard', label: 'Dashboard' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-ivory/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl tracking-wide text-ink">
          Evermore
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm transition-colors ${isActive ? 'text-ink' : 'text-ink-soft hover:text-ink'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link to="/create">
            <Button size="sm">Create Your Invitation</Button>
          </Link>
        </div>

        <button
          className="p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink/10 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4" aria-label="Primary mobile">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="text-sm text-ink-soft hover:text-ink"
              >
                {link.label}
              </NavLink>
            ))}
            <Link to="/create" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full">Create Your Invitation</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
