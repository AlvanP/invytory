import { BellRing, CalendarPlus, Clapperboard, LayoutGrid, Music2, Palette, Users, Link2 } from 'lucide-react'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'

const features = [
  { icon: Clapperboard, color: 'text-rose', title: 'Animated entrances', text: 'Your guests open a door, a curtain or a film before they see the details.' },
  { icon: LayoutGrid, color: 'text-teal', title: '44 templates', text: 'Weddings (white, Igbo, Yoruba, Hausa), dedications, birthdays, corporate and memorials.' },
  { icon: Palette, color: 'text-amber', title: 'Your colours', text: 'Choose your colours of the day, or type in your own hex colour.' },
  { icon: BellRing, color: 'text-plum', title: 'Automatic reminders', text: 'Guests are reminded a week and a day before. Nothing for you to send.' },
  { icon: CalendarPlus, color: 'text-sky', title: 'Add to Calendar', text: 'One tap saves the date to Google, Apple or Outlook, with an alarm.' },
  { icon: Link2, color: 'text-mint', title: 'Special guest links', text: 'Give important guests a link with their own name on it.' },
  { icon: Music2, color: 'text-rose', title: 'Your music', text: 'Pick a song from our library or add your own, timed to the entrance.' },
  { icon: Users, color: 'text-teal', title: 'Plan it together', text: 'Invite a co-host or planner to manage the guest list with you.' },
]

/** A quick tour of what comes with every invitation. */
export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 pb-20 lg:pb-28">
      <RevealOnScroll>
        <h2 className="max-w-lg font-brand text-4xl leading-tight text-wine sm:text-5xl">Everything you need, in every invitation</h2>
      </RevealOnScroll>
      <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <li key={f.title}>
            <RevealOnScroll delayMs={(i % 4) * 80}>
              <f.icon className={`size-7 ${f.color}`} strokeWidth={1.5} />
              <h3 className="mt-3 font-brand text-xl text-wine">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.text}</p>
            </RevealOnScroll>
          </li>
        ))}
      </ul>
    </section>
  )
}
