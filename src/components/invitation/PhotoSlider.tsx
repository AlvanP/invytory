import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Photos in a row that guests swipe to the left (or use the arrows on a computer).
 * The photos snap into place, and the dots show which one is showing.
 */
export function PhotoSlider({ photos }: { photos: { id: string; url: string; caption?: string }[] }) {
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [moved, setMoved] = useState(false)

  function slideWidth(): number {
    const first = track.current?.firstElementChild as HTMLElement | null
    return first ? first.offsetWidth + 16 : 1
  }

  function onScroll() {
    const el = track.current
    if (!el) return
    setIndex(Math.min(photos.length - 1, Math.round(el.scrollLeft / slideWidth())))
    if (el.scrollLeft > 8) setMoved(true)
  }

  function go(delta: number) {
    const el = track.current
    if (!el) return
    el.scrollTo({ left: Math.max(0, (index + delta) * slideWidth()), behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={track}
        onScroll={onScroll}
        className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((p, i) => (
          <figure
            key={p.id}
            className={cn(
              'w-[72%] max-w-[300px] shrink-0 snap-center sm:w-[44%]',
              i % 2 === 1 && 'mt-8'
            )}
          >
            <div className="relative">
              <div aria-hidden className="absolute inset-0 -translate-x-2 translate-y-2 border border-[color:var(--iv-main)]" />
              <img
                src={p.url}
                alt={p.caption ?? ''}
                loading="lazy"
                draggable={false}
                className="relative aspect-[3/4] w-full object-cover"
              />
            </div>
          </figure>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label="Previous photo"
          className="hidden size-9 items-center justify-center rounded-full border border-[color:var(--iv-main)] text-[color:var(--iv-ink)] disabled:opacity-30 sm:flex"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="flex gap-2" aria-hidden>
          {photos.map((p, i) => (
            <span
              key={p.id}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-6 bg-[color:var(--iv-main)]' : 'w-1.5 bg-[color:var(--iv-main)]/30'
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={index >= photos.length - 1}
          aria-label="Next photo"
          className="hidden size-9 items-center justify-center rounded-full border border-[color:var(--iv-main)] text-[color:var(--iv-ink)] disabled:opacity-30 sm:flex"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <p
        className={cn(
          'mt-3 text-xs uppercase tracking-[0.3em] text-[color:var(--iv-ink)] opacity-60 transition-opacity duration-700 sm:hidden',
          moved && 'opacity-0'
        )}
      >
        Swipe &rarr;
      </p>
    </div>
  )
}
