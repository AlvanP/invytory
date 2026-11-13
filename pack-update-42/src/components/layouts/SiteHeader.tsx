import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/brand/Logo'
import { useAuth } from '@/hooks/useAuth'

const baseLinks = [
  { to: '/templates', label: 'Templates' },
  { to: '/#how', label: 'How it works' },
  { to: '/pricing', label: 'Pricing' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { user, loading } = useAuth()
  // Signed in: a Dashboard button. Signed out: Sign in. While the saved session is being checked, neither flashes.
  const links = loading ? baseLinks : [...baseLinks, user ? { to: '/dashboard', label: 'Dashboard' } : { to: '/sign-in', label: 'Sign in' }]

  return (
    <header className="relative z-40 bg-ivory/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" aria-label="Invytory home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="text-sm text-ink-soft transition-colors hover:text-wine">
              {link.label}
            </Link>
          ))}
          <Link to="/create">
            <Button size="sm">Create your invitation</Button>
          </Link>
        </nav>

        <button
          className="-mr-2 p-2 text-wine md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-wine/10 bg-ivory px-6 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Primary mobile">
            {links.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="py-2.5 font-brand text-2xl text-wine">
                {link.label}
              </Link>
            ))}
            <Link to="/create" onClick={() => setOpen(false)} className="mt-3">
              <Button className="w-full">Create your invitation</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
