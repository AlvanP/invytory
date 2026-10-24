import type { ReactNode } from 'react'
import { Logo } from '@/components/brand/Logo'
import { BRAND_LINKS, type BrandLinkKey } from '@/data/brandLinks'

const ICONS: Record<Exclude<BrandLinkKey, 'website'>, { label: string; icon: ReactNode }> = {
  instagram: {
    label: 'Instagram',
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  facebook: {
    label: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
        <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" />
      </svg>
    ),
  },
  tiktok: {
    label: 'TikTok',
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
        <path d="M16.6 3c.3 2.3 1.6 3.7 3.9 3.9v3a7 7 0 0 1-3.8-1.2v6.2a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v3.1a2.6 2.6 0 1 0 1.7 2.4V3h2.9z" />
      </svg>
    ),
  },
  x: {
    label: 'X',
    icon: (
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
        <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z" />
      </svg>
    ),
  },
  whatsapp: {
    label: 'WhatsApp',
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3.5 20.5l1.2-4.3A8.5 8.5 0 1 1 8 19.4l-4.5 1.1z" />
        <path d="M9 8.8c.2 2.6 3.2 5.4 5.9 5.7l1-1.2-1.9-1-.8.8c-.9-.4-1.7-1.2-2.1-2.1l.8-.8-1-1.9L9 8.8z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
}

/** The small footer on a guest's invitation: the brand, how to reach it, and an invitation to make one. */
export function InvitationFooter() {
  const social = (Object.keys(ICONS) as (keyof typeof ICONS)[]).filter((k) => BRAND_LINKS[k])
  return (
    <footer className="bg-wine text-ivory">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-12 text-center">
        <a href={BRAND_LINKS.website} target="_blank" rel="noopener noreferrer" aria-label="Invytory home" className="group inline-flex items-center gap-3">
          <Logo tone="light" className="h-12 transition-transform duration-500 group-hover:scale-[1.03]" />
        </a>
        <p className="font-display text-lg italic opacity-90">Tell a story, with your invites.</p>

        <a
          href={`${BRAND_LINKS.website}/create`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-ivory px-6 py-2.5 text-sm font-medium text-wine transition-transform hover:scale-[1.04]"
        >
          Create your own invitation
        </a>

        <ul className="flex flex-wrap items-center justify-center gap-3">
          {social.map((k) => (
            <li key={k}>
              <a
                href={BRAND_LINKS[k]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={ICONS[k].label}
                title={ICONS[k].label}
                className="flex size-10 items-center justify-center rounded-full border border-ivory/35 transition-colors hover:bg-ivory hover:text-wine"
              >
                {ICONS[k].icon}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-1 border-t border-ivory/20 pt-5 text-xs opacity-85">
          <a href={BRAND_LINKS.website} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
            www.invytory.com
          </a>
          <p>&copy; {new Date().getFullYear()} Invytory. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
