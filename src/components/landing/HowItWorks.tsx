import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'

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
      <h2 className="max-w-md font-brand text-4xl leading-tight text-wine sm:text-5xl">From idea to full house in five steps</h2>

      <ol className="relative mt-14 grid gap-10 lg:grid-cols-5 lg:gap-6">
        <div aria-hidden className="absolute left-[1.35rem] top-2 h-[calc(100%-1rem)] w-px bg-wine/20 lg:left-0 lg:top-[1.35rem] lg:h-px lg:w-full" />
        {steps.map((s, i) => (
          <li key={s.title} className="relative">
            <RevealOnScroll delayMs={i * 90} className="flex gap-5 lg:block">
              <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border border-wine/30 bg-ivory font-brand text-xl text-wine">
                {i + 1}
              </span>
              <div className="lg:mt-6">
                <h3 className="font-brand text-2xl leading-tight text-wine">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.text}</p>
                {s.note && <p className="mt-3 inline-block rounded-full bg-ivory-deep px-3 py-1 text-xs font-medium text-wine">{s.note}</p>}
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
