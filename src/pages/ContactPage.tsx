import { useEffect, useState } from 'react'
import { Check, Loader2, Mail } from 'lucide-react'
import { CONTACT_EMAIL } from '@/pages/legal/LegalPage'
import { BRAND_LINKS } from '@/data/brandLinks'
import { Button } from '@/components/ui/Button'

const TOPICS = ['General question', 'Help with my invitation', 'Payments', 'Guest photo album', 'Partnerships and planners', 'Report a problem']

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState(TOPICS[0])
  const [message, setMessage] = useState('')
  const [trap, setTrap] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    const previous = document.title
    document.title = 'Contact us | Invytory'
    window.scrollTo(0, 0)
    return () => {
      document.title = previous
    }
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, message, website: trap }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (res.ok && data.ok) {
        setState('sent')
        return
      }
      setError(
        data.error === 'not_configured' || data.error === 'send_failed'
          ? `We could not send that just now. Please email us directly at ${CONTACT_EMAIL}.`
          : (data.error ?? 'Something went wrong. Please try again.')
      )
    } catch {
      setError(`Could not reach the server. Please check your connection, or email us at ${CONTACT_EMAIL}.`)
    }
    setState('error')
  }

  const field = 'rounded-xs border border-ink/15 bg-white px-3 py-2.5 text-base text-ink outline-none focus:border-wine'

  return (
    <div className="mx-auto max-w-2xl px-6 py-14 sm:py-20">
      <h1 className="font-display text-4xl text-ink">Contact us</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        Questions, feedback or need a hand with your invitation? Send us a message and we will reply by email.
      </p>

      {state === 'sent' ? (
        <div role="status" className="mt-8 flex items-start gap-3 rounded-md border border-ink/10 bg-white p-6">
          <Check className="mt-0.5 size-5 shrink-0 text-success" />
          <div>
            <p className="font-display text-xl text-ink">Message sent</p>
            <p className="mt-1 text-sm text-ink-soft">Thank you. We will reply to {email} as soon as we can.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 flex flex-col gap-4 rounded-md border border-ink/10 bg-white p-6">
          <label className="flex flex-col gap-1 text-sm text-ink-soft">
            Your name
            <input required value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={field} autoComplete="name" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink-soft">
            Your email
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} className={field} autoComplete="email" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink-soft">
            Topic
            <select value={topic} onChange={(e) => setTopic(e.target.value)} className={field}>
              {TOPICS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink-soft">
            Message
            <textarea required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={4000} className={field} />
          </label>
          {/* Hidden from people; bots fill it in and are ignored. */}
          <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden name="website" />
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button type="submit" disabled={state === 'sending'} icon={state === 'sending' ? <Loader2 className="size-4 animate-spin" /> : undefined}>
            {state === 'sending' ? 'Sending…' : 'Send message'}
          </Button>
        </form>
      )}

      <p className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft">
        <Mail className="size-4 text-wine" /> You can also email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-wine underline-offset-2 hover:underline">{CONTACT_EMAIL}</a>
      </p>
      {(BRAND_LINKS.instagram || BRAND_LINKS.tiktok) && (
        <p className="mt-2 text-sm text-ink-soft">
          Follow us on{' '}
          {BRAND_LINKS.instagram && <a href={BRAND_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="text-wine underline-offset-2 hover:underline">Instagram</a>}
          {BRAND_LINKS.instagram && BRAND_LINKS.tiktok && ' and '}
          {BRAND_LINKS.tiktok && <a href={BRAND_LINKS.tiktok} target="_blank" rel="noopener noreferrer" className="text-wine underline-offset-2 hover:underline">TikTok</a>}
        </p>
      )}
    </div>
  )
}
