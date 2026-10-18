import { eventCopy, EVENT_KINDS } from '@/templates/events'
import { ACCENTS } from '@/utils/accents'

const EXTRA = ['Animated entrances', 'RSVP in a tap', 'Guest photo album', 'Special guest links', 'Share on WhatsApp']

/** A slow strip of what Invytory is for and what it does. Purely decoration, so it is hidden from screen readers. */
export function Marquee() {
  const items = [
    ...EVENT_KINDS.map((k) => ({ text: eventCopy[k].plural, color: ACCENTS[k] })),
    ...EXTRA.map((text, i) => ({ text, color: Object.values(ACCENTS)[i % 5] })),
  ]
  const row = (key: string) => (
    <ul key={key} className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((it) => (
        <li key={it.text} className="flex items-center gap-3 whitespace-nowrap font-brand text-xl text-wine/80">
          <i className="size-2.5 rounded-full" style={{ backgroundColor: it.color }} />
          {it.text}
        </li>
      ))}
    </ul>
  )
  return (
    <div aria-hidden className="overflow-hidden border-y border-wine/10 bg-white/60 py-4">
      <div className="marquee-track flex w-max">
        {row('a')}
        {row('b')}
      </div>
    </div>
  )
}
