import { useEffect, useState } from 'react'
import { Camera, Check, Clock, CreditCard, Loader2, LifeBuoy, Send, Users } from 'lucide-react'
import { CONTACT_EMAIL } from '@/pages/legal/LegalPage'
import { contactService } from '@/services/contactService'
import { BRAND_LINKS } from '@/data/brandLinks'
import { ICONS } from '@/components/brand/SocialIcons'

const TOPICS = ['General question', 'Help with my invitation', 'Payments', 'Guest photo album', 'Partnerships and planners', 'Report a problem']
const ORDER = ['instagram', 'tiktok', 'linkedin', 'facebook'] as const

const HELP = [
  { icon: LifeBuoy, title: 'Help with an invitation', text: 'Editing, sharing links, RSVPs and guest lists.' },
  { icon: CreditCard, title: 'Payments', text: 'Plans, receipts and anything about checkout.' },
  { icon: Camera, title: 'Guest photo album', text: 'QR codes, uploads and downloads.' },
  { icon: Users, title: 'Planners and partners', text: 'Planning many events? Let us talk.' },
]

/** Tries to email the Invytory inbox: our own server first, then a backup service. True if one worked. */
async function emailInbox(payload: { name: string; email: string; topic: string; message: string; website: string }): Promise<boolean> {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean }
    if (res.ok && data.ok) return true
  } catch (err) {
    console.error('[contact] server route failed:', err)
  }
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        topic: payload.topic,
        message: payload.message,
        _subject: `[Invytory contact] ${payload.topic} from ${payload.name}`,
        _template: 'table',
        _captcha: 'false',
      }),
    })
    const data = (await res.json().catch(() => ({}))) as { success?: string | boolean; message?: string }
    if (res.ok && (data.success === true || data.success === 'true')) return true
    console.error('[contact] backup route said:', data.message ?? res.status)
  } catch (err) {
    console.error('[contact] backup route failed:', err)
  }
  return false
}

/** The message is kept in the database (so it can never be lost) and emailed when an email route works. */
async function sendMessage(payload: { name: string; email: string; topic: string; message: string; website: string }): Promise<void> {
  const [saved, emailed] = await Promise.all([contactService.save(payload), emailInbox(payload)])
  if (!saved && !emailed) throw new Error('send_failed')
}

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
    if (trap) return
    setState('sending')
    setError('')
    try {
      await sendMessage({ name, email, topic, message, website: trap })
      setState('sent')
    } catch (err) {
      const text = err instanceof Error ? err.message : ''
      setError(text && text !== 'send_failed' ? text : 'We could not send that just now. Please try again in a moment.')
      setState('error')
    }
  }

  const field =
    'w-full rounded-sm border border-ink/15 bg-ivory/60 px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-wine focus:bg-white'
  const links = ORDER.filter((k) => BRAND_LINKS[k])

  return (
    <div>
      <section className="relative overflow-hidden bg-wine text-ivory">
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-gold/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-72 rounded-full bg-ivory/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 py-16 text-center sm:py-24">
          <p className="text-xs tracking-[0.25em] text-gold-soft">CONTACT US</p>
          <h1 className="mt-4 font-display text-4xl sm:text-6xl">We would love to hear from you</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed opacity-85">
            A question, an idea, or a hand needed with your invitation. Send us a message and a real person will reply by email.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-ivory/25 px-4 py-1.5 text-xs">
            <Clock className="size-3.5 text-gold-soft" /> We usually reply within a day
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-8 px-6 pb-20 lg:grid-cols-[1.25fr_1fr]">
        <div className="relative z-10 -mt-10 rounded-md border border-ink/10 bg-white p-6 shadow-lift sm:p-9">
          {state === 'sent' ? (
            <div role="status" className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
                <Check className="size-7" />
              </span>
              <h2 className="font-display text-3xl text-ink">Message sent</h2>
              <p className="max-w-sm text-sm leading-relaxed text-ink-soft">Thank you, {name.split(' ')[0] || 'friend'}. We will reply to {email} as soon as we can.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-5">
              <div>
                <h2 className="font-display text-2xl text-ink">Send us a message</h2>
                <p className="mt-1 text-sm text-ink-soft">Fill in the form and we will get back to you.</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
                  Your name
                  <input required value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Ada Okafor" className={field} autoComplete="name" />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
                  Your email
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} placeholder="you@example.com" className={field} autoComplete="email" />
                </label>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">What is this about?</span>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTopic(t)}
                      aria-pressed={topic === t}
                      className={
                        topic === t
                          ? 'rounded-full border border-wine bg-wine px-3.5 py-1.5 text-xs font-medium text-ivory'
                          : 'rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-xs text-ink-soft transition-colors hover:border-wine hover:text-wine'
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
                Your message
                <textarea required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={4000} placeholder="Tell us how we can help" className={field} />
              </label>
              <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden name="website" />
              {error && <p role="alert" className="rounded-xs bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
              <button
                type="submit"
                disabled={state === 'sending'}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-wine px-7 py-3.5 text-base font-medium text-ivory transition-colors hover:bg-wine-soft disabled:opacity-60"
              >
                {state === 'sending' ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                {state === 'sending' ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}
        </div>

        <aside className="flex flex-col gap-6 lg:pt-8">
          <ul className="flex flex-col gap-4">
            {HELP.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-4 rounded-md border border-ink/10 bg-white p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-wine/10 text-wine">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="font-medium text-ink">{title}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          {links.length > 0 && (
            <div className="rounded-md bg-ivory-deep p-6 text-center">
              <p className="font-display text-xl text-wine">Follow our stories</p>
              <p className="mt-1 text-sm text-ink-soft">Ideas, new designs and real celebrations.</p>
              <ul className="mt-4 flex flex-wrap items-center justify-center gap-3">
                {links.map((k) => (
                  <li key={k}>
                    <a
                      href={BRAND_LINKS[k]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={ICONS[k].label}
                      title={ICONS[k].label}
                      className="flex size-12 items-center justify-center rounded-full bg-wine text-ivory transition-transform hover:scale-110"
                    >
                      {ICONS[k].icon}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
