import { RevealOnScroll } from '@/components/animation/RevealOnScroll'

/**
 * Sample reviews. Replace these with real ones from your customers as they arrive.
 */
const reviews = [
  { quote: 'Guests kept asking who designed our invitation. The date scratch-off alone was worth it, and I stopped chasing RSVPs on WhatsApp.', who: 'Mirabel A.', role: 'Bride, Lagos', large: true },
  { quote: 'We dedicated our daughter on Sunday and the invitation looked as gentle as the day felt.', who: 'Ifeoma and Daniel O.', role: 'Child dedication, Abuja' },
  { quote: 'I knew the headcount a week before the party. The caterer was happy and so was I.', who: 'Tolu B.', role: 'Birthday, Ibadan' },
  { quote: 'Clear, professional and easy for our guests. Registration took two taps.', who: 'Chinedu E.', role: 'Corporate event, Port Harcourt' },
  { quote: 'Dignified and quiet, which is exactly what our family needed. Everyone knew where to be and when.', who: 'The Adeyemi family', role: 'Memorial service, Ibadan' },
]

export function Reviews() {
  const [first, ...rest] = reviews
  return (
    <section id="reviews" className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
      <h2 className="max-w-lg font-brand text-4xl leading-tight text-wine sm:text-5xl">What hosts say</h2>
      <div className="mt-12 grid gap-x-12 gap-y-12 lg:grid-cols-12">
        <RevealOnScroll className="lg:col-span-7">
          <figure>
            <blockquote className="font-brand text-3xl leading-snug text-wine sm:text-4xl">“{first.quote}”</blockquote>
            <figcaption className="mt-5 text-sm text-ink-soft">
              <span className="font-medium text-ink">{first.who}</span>, {first.role}
            </figcaption>
          </figure>
        </RevealOnScroll>
        <div className="grid gap-10 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
          {rest.slice(0, 3).map((r, i) => (
            <RevealOnScroll key={r.who} delayMs={i * 100}>
              <figure className="border-l-2 border-wine/20 pl-5">
                <blockquote className="text-base leading-relaxed text-ink">“{r.quote}”</blockquote>
                <figcaption className="mt-3 text-sm text-ink-soft">
                  <span className="font-medium text-ink">{r.who}</span>, {r.role}
                </figcaption>
              </figure>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
