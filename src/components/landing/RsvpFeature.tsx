import { useEffect, useState } from 'react'
import { Check, ListChecks, MessageCircle, FileSpreadsheet } from 'lucide-react'
import { useInView } from '@/hooks/useInView'

const TOTAL = 200
const YES = 142
const NO = 18
const replies = [
  { name: 'Ngozi Eze', answer: 'Yes', guests: '2 guests' },
  { name: 'Tunde Bakare', answer: 'Yes', guests: '1 guest' },
  { name: 'Amina Yusuf', answer: 'Yes', guests: '4 guests' },
  { name: 'Peter Okafor', answer: 'No', guests: '' },
]

/** Counts up to `target` once `start` is true. */
function useCount(target: number, start: boolean) {
  const [value, setValue] = useState(0)
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  useEffect(() => {
    if (!start) return
    if (reduced) return
    let frame = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 1400, 1)
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [start, target, reduced])
  return reduced && start ? target : value
}

export function RsvpFeature() {
  const { ref, inView } = useInView<HTMLDivElement>()
  const count = useCount(YES, inView)
  const pct = (n: number) => `${(n / TOTAL) * 100}%`

  return (
    <section id="rsvp" className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
      <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="max-w-md font-brand text-4xl leading-tight text-wine sm:text-5xl">Know how many are coming before you plan the seats</h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
            Every reply lands on your dashboard as it happens. You see the headcount, not a pile of WhatsApp messages.
          </p>
          <ul className="mt-8 flex max-w-md flex-col gap-4 text-base text-ink">
            <li className="flex gap-3">
              <ListChecks className="mt-1 size-5 shrink-0 text-gold" strokeWidth={1.5} />
              <span>Yes, no and waiting, at a glance.</span>
            </li>
            <li className="flex gap-3">
              <Check className="mt-1 size-5 shrink-0 text-gold" strokeWidth={1.5} />
              <span>Guests say how many people they are bringing, so your number is realistic.</span>
            </li>
            <li className="flex gap-3">
              <FileSpreadsheet className="mt-1 size-5 shrink-0 text-gold" strokeWidth={1.5} />
              <span>Download the guest list as a spreadsheet for the caterer and the venue.</span>
            </li>
            <li className="flex gap-3">
              <MessageCircle className="mt-1 size-5 shrink-0 text-gold" strokeWidth={1.5} />
              <span>Guests can leave a message on your wall when they reply.</span>
            </li>
          </ul>
        </div>

        <div ref={ref} className="rounded-2xl bg-white p-6 shadow-[0_30px_60px_-30px_rgba(89,38,47,0.35)] ring-1 ring-wine/10 sm:p-8">
          <p className="text-sm text-ink-soft">Expected to attend</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="font-brand text-7xl leading-none text-wine tabular-nums">{count}</span>
            <span className="text-sm text-ink-soft">guests, of {TOTAL} invited</span>
          </p>

          <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-ivory-deep" role="img" aria-label={`${YES} yes, ${NO} no, ${TOTAL - YES - NO} waiting`}>
            <div className="h-full bg-wine transition-all duration-[1400ms] ease-out" style={{ width: inView ? pct(YES) : '0%' }} />
            <div className="h-full bg-gold/50 transition-all delay-300 duration-[1400ms] ease-out" style={{ width: inView ? pct(NO) : '0%' }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
            <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-wine" /> {YES} yes</span>
            <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-gold/50" /> {NO} no</span>
            <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-ivory-deep ring-1 ring-wine/20" /> {TOTAL - YES - NO} waiting</span>
          </div>

          <ul className="mt-6 divide-y divide-wine/10 border-t border-wine/10">
            {replies.map((r) => (
              <li key={r.name} className="flex items-center justify-between py-3 text-sm">
                <span className="text-ink">{r.name}</span>
                <span className="text-ink-soft">
                  <span className={r.answer === 'Yes' ? 'font-medium text-wine' : ''}>{r.answer}</span>
                  {r.guests && <span> &middot; {r.guests}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
