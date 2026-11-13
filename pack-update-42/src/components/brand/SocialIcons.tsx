import type { ReactNode } from 'react'
import type { BrandLinkKey } from '@/data/brandLinks'

/** Social icons used in the footers and the Contact page. */
export const ICONS: Record<Exclude<BrandLinkKey, 'website'>, { label: string; icon: ReactNode }> = {
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
  linkedin: {
    label: 'LinkedIn',
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
        <path d="M4.5 9h3.9v11.5H4.5V9zm1.95-5.5a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5zM10.8 9h3.7v1.6h.1c.5-1 1.8-2 3.7-2 3.9 0 4.6 2.6 4.6 5.9v6H19v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8v5.4h-3.9V9z" />
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
