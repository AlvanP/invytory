import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

/** Where people reach you about privacy, terms and takedown requests. Change this one line. */
export const CONTACT_EMAIL = 'hello@invytory.com'
export const LEGAL_UPDATED = '20 October 2026'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl text-wine">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-[15px] leading-relaxed text-ink-soft">{children}</div>
    </section>
  )
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  )
}

export function LegalPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} | Invytory`
    window.scrollTo(0, 0)
    return () => {
      document.title = previous
    }
  }, [title])

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
      <h1 className="font-display text-4xl text-ink">{title}</h1>
      <p className="mt-2 text-xs text-ink-soft">Last updated {LEGAL_UPDATED}</p>
      <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">{intro}</p>
      {children}
      <p className="mt-12 border-t border-ink/10 pt-6 text-sm text-ink-soft">
        Questions? Write to <a className="text-wine underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. See also our{' '}
        <Link className="text-wine underline" to={title === 'Privacy Policy' ? '/terms' : '/privacy'}>
          {title === 'Privacy Policy' ? 'Terms of Service' : 'Privacy Policy'}
        </Link>
        .
      </p>
    </div>
  )
}
