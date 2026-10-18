import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'

const COLORS = ['#D9577A', '#F2A93B', '#1F8A8A', '#4A90C2', '#7D4FA3']

const steps = [
  { title: 'Choose your style', text: 'Pick a design made for your kind of event, from a wedding to a memorial.' },
  { title: 'Customise', text: 'Add your names, date, venue, photos and music. Choose your colours of the day.' },
  { title: 'Share', text: 'Send one link on WhatsApp, or print the QR code on your cards.' },
  { title: 'RSVP', text: 'Guests reply in a tap. You see who is coming as the answers arrive.' },
  { title: 'Your guests’ photos, in one album', text: 'After the event, guests add the photos they took. You download them all.', note: 'Signature plan' },
]

/** The five steps, in order. This is a real sequence, so the steps are numbered. */
export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
      <RevealOnScroll>
        <h2 className="max-w-md font-brand text-4xl leading-tight text-wine sm:text-5xl">From idea to full house in five steps</h2>
      </RevealOnScroll>

      <ol className="relative mt-14 grid gap-10 lg:grid-cols-5 lg:gap-6">
        <div aria-hidden className="absolute left-[1.35rem] top-2 h-[calc(100%-1rem)] w-0.5 bg-gradient-to-b from-rose via-teal to-plum opacity-40 lg:left-0 lg:top-[1.35rem] lg:h-0.5 lg:w-full lg:bg-gradient-to-r" />
        {steps.map((s, i) => (
          <li key={s.title} className="relative">
            <RevealOnScroll delayMs={i * 90} className="flex gap-5 lg:block">
              <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full font-brand text-xl text-white shadow-soft transition-transform duration-300 hover:scale-110" style={{ backgroundColor: COLORS[i] }}>
                {i + 1}
              </span>
              <div className="lg:mt-6">
                <h3 className="font-brand text-2xl leading-tight text-wine">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.text}</p>
                {s.note && <p className="mt-3 inline-block rounded-full bg-amber/20 px-3 py-1 text-xs font-medium text-wine">{s.note}</p>}
              </div>
            </RevealOnScroll>
          </li>
        ))}
      </ol>

      <div className="mt-14">
        <Link to="/create">
          <Button size="lg">Create your invitation</Button>
        </Link>
      </div>
    </section>
  )
}
