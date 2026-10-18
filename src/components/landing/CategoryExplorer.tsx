import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PhoneMockup } from '@/components/brand/PhoneMockup'
import { templates, templatesForCategory } from '@/data/templates'
import { eventCopy, EVENT_KINDS, type EventKind } from '@/templates/events'
import { cn } from '@/utils/cn'
import { ACCENTS, tint } from '@/utils/accents'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'

/** Which designs to show first for each event. */
const FEATURED: Record<EventKind, string[]> = {
  wedding: ['classic-elegance', 'garden-romance', 'modern-luxury', 'igbo-design-1', 'yoruba-design-1', 'hausa-design-1'],
  'child-dedication': [],
  birthday: [],
  corporate: [],
  funeral: [],
}

function featured(kind: EventKind) {
  const ids = FEATURED[kind]
  const all = templatesForCategory(kind)
  return ids.length ? ids.map((id) => all.find((t) => t.id === id)!).filter(Boolean) : all
}

/**
 * One list of the events Invytory is for. Choosing one shows a live sample on the phone
 * beside it, and the designs available for that event underneath.
 */
export function CategoryExplorer() {
  const [kind, setKind] = useState<EventKind>('child-dedication')
  const [templateId, setTemplateId] = useState(featured('child-dedication')[0].id)
  const list = featured(kind)
  const count = templates.filter((t) => t.category === kind).length

  const choose = (next: EventKind) => {
    setKind(next)
    setTemplateId(featured(next)[0].id)
  }

  return (
    <section id="events" className="transition-colors duration-700" style={{ backgroundColor: tint(ACCENTS[kind], 16) }}>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
        <div>
          <RevealOnScroll>
            <h2 className="max-w-lg font-brand text-4xl leading-tight text-wine sm:text-5xl">One place for every occasion worth inviting people to</h2>
          </RevealOnScroll>

          <ul className="mt-10 border-t border-wine/15">
            {EVENT_KINDS.map((k) => {
              const active = k === kind
              return (
                <li key={k} className="border-b border-wine/15">
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => choose(k)}
                    className="group flex w-full items-baseline justify-between gap-4 py-4 text-left"
                  >
                    <span
                      className={cn(
                        'flex items-center gap-3 font-brand text-3xl transition-all duration-300 sm:text-4xl',
                        active ? 'translate-x-2 text-wine' : 'text-wine/45 group-hover:text-wine/80'
                      )}
                    >
                      <i
                        className={cn('inline-block rounded-full transition-all duration-500', active ? 'size-3.5' : 'size-2.5 opacity-60')}
                        style={{ backgroundColor: ACCENTS[k] }}
                      />
                      {eventCopy[k].plural}
                    </span>
                    <span className={cn('hidden max-w-[17rem] text-sm leading-snug text-ink-soft transition-opacity duration-300 sm:block', active ? 'opacity-100' : 'opacity-0')}>
                      {eventCopy[k].blurb}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <p className="mt-5 text-sm text-ink-soft sm:hidden">{eventCopy[kind].blurb}</p>

          <div className="mt-8">
            <div className="flex flex-wrap gap-2" role="group" aria-label={`${eventCopy[kind].plural} designs`}>
              {list.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={t.id === templateId}
                  onClick={() => setTemplateId(t.id)}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-sm transition-colors',
                    t.id === templateId ? 'border-transparent text-white' : 'border-wine/25 text-wine hover:border-wine'
                  )}
                  style={t.id === templateId ? { backgroundColor: ACCENTS[kind] } : undefined}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <Link to={`/templates?category=${kind}`} className="mt-5 inline-block text-sm font-medium text-wine underline decoration-wine/30 underline-offset-4 hover:decoration-wine">
              See all {count} {eventCopy[kind].label.toLowerCase()} designs
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-[15.5rem] sm:w-[17rem]">
          <div aria-hidden className="drift-a absolute -inset-10 rounded-full opacity-40 blur-3xl transition-colors duration-700" style={{ backgroundColor: ACCENTS[kind] }} />
          <div className="relative">
            <PhoneMockup key={templateId} templateId={templateId} />
          </div>
        </div>
      </div>
    </section>
  )
}
