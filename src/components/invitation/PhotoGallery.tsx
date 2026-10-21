import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { GalleryStyle } from '@/templates/galleryStyles'
import { cn } from '@/utils/cn'
import { PhotoSlider } from './PhotoSlider'

export interface GalleryPhoto {
  id: string
  url: string
  caption?: string
}

const EASE = 'cubic-bezier(0.22, 0.8, 0.2, 1)'

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(q.matches)
    q.addEventListener('change', on)
    return () => q.removeEventListener('change', on)
  }, [])
  return reduced
}

/** True while the element is on screen, so moving galleries only move when someone can see them. */
function useOnScreen<T extends Element>(): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.35 })
    io.observe(node)
    return () => io.disconnect()
  }, [])
  return [ref, on]
}

/** Swipe left or right on an element. Taps are left alone. */
function useSwipe(onSwipe: (dir: 1 | -1) => void, onTap?: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null)
  return {
    onPointerDown: (e: React.PointerEvent) => {
      start.current = { x: e.clientX, y: e.clientY }
    },
    onPointerUp: (e: React.PointerEvent) => {
      const s = start.current
      start.current = null
      if (!s) return
      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) onSwipe(dx < 0 ? 1 : -1)
      else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) onTap?.()
    },
    onPointerCancel: () => {
      start.current = null
    },
  }
}

function Dots({ count, index, onPick, light }: { count: number; index: number; onPick: (i: number) => void; light?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Photo ${i + 1}`}
          aria-current={i === index}
          onClick={() => onPick(i)}
          className={cn(
            'h-1.5 rounded-full transition-all duration-500',
            i === index ? 'w-6' : 'w-1.5 opacity-40',
            light ? 'bg-white' : 'bg-[color:var(--iv-main)]'
          )}
        />
      ))}
    </div>
  )
}

function ArrowButton({ dir, onClick, light }: { dir: 1 | -1; onClick: () => void; light?: boolean }) {
  const Icon = dir === 1 ? ChevronRight : ChevronLeft
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 1 ? 'Next photo' : 'Previous photo'}
      className={cn(
        'flex size-9 items-center justify-center rounded-full border backdrop-blur-sm transition-colors',
        light ? 'border-white/60 bg-black/20 text-white hover:bg-black/35' : 'border-[color:var(--iv-main)] text-[color:var(--iv-ink)] hover:bg-[color:var(--iv-main)]/10'
      )}
    >
      <Icon className="size-4" />
    </button>
  )
}

/* ───────── 1. Zoom slide ─────────
 * One photo shows at a time. Going forward, the next photo starts big and to the right, then
 * slides in while it zooms out into place. The one leaving zooms in a little as it slides away. */
function ZoomSlider({ photos }: { photos: GalleryPhoto[] }) {
  const n = photos.length
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [box, visible] = useOnScreen<HTMLDivElement>()
  const [dir, setDir] = useState<1 | -1>(1)

  const go = useCallback(
    (d: 1 | -1) => {
      setDir(d)
      setIndex((i) => (i + d + n) % n)
    },
    [n]
  )

  useEffect(() => {
    if (reduced || paused || !visible || n < 2) return
    const t = window.setInterval(() => go(1), 4800)
    return () => window.clearInterval(t)
  }, [reduced, paused, visible, n, go])

  const swipe = useSwipe((d) => go(d))
  return (
    <div className="mx-auto max-w-3xl" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div
        ref={box}
        {...swipe}
        className="relative aspect-[4/5] touch-pan-y select-none overflow-hidden bg-black/5 shadow-[0_24px_50px_-28px_rgba(0,0,0,0.5)] sm:aspect-[3/2]"
      >
        {photos.map((p, i) => {
          const rel = (i - index + n) % n
          // With three or more photos: the one leaving waits on the left, the rest wait on the right.
          const pos = rel === 0 ? 'active' : n > 2 && rel === n - 1 ? 'left' : 'right'
          // A photo crossing from one waiting side to the other does it unseen, with no animation.
          const jump = n > 2 && (dir === 1 ? rel === n - 2 : rel === n - 1)
          const fade = reduced || n === 2
          const transform = reduced
            ? 'none'
            : pos === 'active'
              ? 'translateX(0) scale(1)'
              : n === 2
                ? 'scale(1.3)'
                : pos === 'left'
                  ? 'translateX(-100%) scale(1.18)'
                  : 'translateX(100%) scale(1.4)'
          return (
            <img
              key={p.id}
              src={p.url}
              alt={p.caption ?? ''}
              draggable={false}
              loading={i === 0 ? 'eager' : 'lazy'}
              aria-hidden={pos !== 'active'}
              className="absolute inset-0 size-full object-cover"
              style={{
                transform,
                opacity: fade ? (pos === 'active' ? 1 : 0) : 1,
                zIndex: pos === 'active' ? 2 : 1,
                transition: jump ? 'none' : `transform 1300ms ${EASE}, opacity 700ms ease`,
                willChange: 'transform',
              }}
            />
          )
        })}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-24 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-4 z-[4] flex items-center justify-between px-4">
          <ArrowButton dir={-1} onClick={() => go(-1)} light />
          <Dots count={n} index={index} onPick={setIndex} light />
          <ArrowButton dir={1} onClick={() => go(1)} light />
        </div>
      </div>
    </div>
  )
}

/* ───────── 2. Spotlight ─────────
 * Photos in a row. The one in the middle is large and bright; the ones beside it are smaller and faded. */
function Spotlight({ photos }: { photos: GalleryPhoto[] }) {
  const n = photos.length
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  const paint = useCallback(() => {
    const el = track.current
    if (!el) return
    const mid = el.scrollLeft + el.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    Array.from(el.children).slice(1, -1).forEach((child, i) => {
      const c = child as HTMLElement
      const dist = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid)
      const k = Math.min(1, dist / (c.offsetWidth * 0.9))
      c.style.transform = `scale(${1 - 0.2 * k})`
      c.style.opacity = String(1 - 0.5 * k)
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    })
    setIndex(best)
  }, [])

  useEffect(() => {
    paint()
    window.addEventListener('resize', paint)
    return () => window.removeEventListener('resize', paint)
  }, [paint])

  function to(i: number) {
    const el = track.current
    const child = el?.children[1 + Math.max(0, Math.min(n - 1, i))] as HTMLElement | undefined
    if (el && child) el.scrollTo({ left: child.offsetLeft + child.offsetWidth / 2 - el.clientWidth / 2, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={track}
        onScroll={paint}
        className="-mx-6 flex snap-x snap-mandatory items-center gap-3 overflow-x-auto py-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div aria-hidden className="w-[16%] shrink-0 sm:w-[33%]" />
        {photos.map((p) => (
          <figure key={p.id} className="w-[68%] shrink-0 snap-center transition-[transform,opacity] duration-150 sm:w-[34%]">
            <img src={p.url} alt={p.caption ?? ''} loading="lazy" draggable={false} className="aspect-[3/4] w-full object-cover shadow-[0_22px_40px_-22px_rgba(0,0,0,0.55)]" />
          </figure>
        ))}
        <div aria-hidden className="w-[16%] shrink-0 sm:w-[33%]" />
      </div>
      <div className="mt-1 flex items-center justify-center gap-4">
        <div className="hidden sm:block"><ArrowButton dir={-1} onClick={() => to(index - 1)} /></div>
        <Dots count={n} index={index} onPick={to} />
        <div className="hidden sm:block"><ArrowButton dir={1} onClick={() => to(index + 1)} /></div>
      </div>
    </div>
  )
}

/* ───────── 3. Deck ─────────
 * Photos in a pile of prints. Swipe or tap: the top print flies off and the next one rises. */
function Deck({ photos }: { photos: GalleryPhoto[] }) {
  const n = photos.length
  const reduced = useReducedMotion()
  const [top, setTop] = useState(0)
  const [leaving, setLeaving] = useState<{ i: number; dir: 1 | -1 } | null>(null)
  const timer = useRef<number | null>(null)
  // The top print follows the finger while it is down; letting go either flings it away or springs it back.
  const [drag, setDrag] = useState(0)
  const [dragging, setDragging] = useState(false)
  const start = useRef<{ x: number; y: number } | null>(null)

  const fling = useCallback(
    (dir: 1 | -1) => {
      if (leaving) return
      if (reduced) {
        setDrag(0)
        return setTop((t) => (t + 1) % n)
      }
      setLeaving({ i: top, dir })
      timer.current = window.setTimeout(() => {
        setTop((t) => (t + 1) % n)
        setLeaving(null)
        setDrag(0)
      }, 420)
    },
    [leaving, reduced, top, n]
  )
  useEffect(() => () => void (timer.current && window.clearTimeout(timer.current)), [])

  const handlers = {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      if (leaving) return
      start.current = { x: e.clientX, y: e.clientY }
      setDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
      const s = start.current
      if (!s) return
      const dx = e.clientX - s.x
      if (Math.abs(dx) > Math.abs(e.clientY - s.y)) setDrag(dx)
    },
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => {
      const s = start.current
      start.current = null
      setDragging(false)
      if (!s) return
      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      // The print flies the way the finger went: swipe left and it goes left.
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) fling(dx < 0 ? -1 : 1)
      else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) fling(1)
      else setDrag(0)
    },
    onPointerCancel: () => {
      start.current = null
      setDragging(false)
      setDrag(0)
    },
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div {...handlers} className="relative aspect-[4/5] w-[78%] max-w-[340px] cursor-grab touch-pan-y select-none active:cursor-grabbing">
        {photos.map((p, i) => {
          const rel = (i - top + n) % n
          const isLeaving = leaving?.i === i
          const depth = Math.min(rel, 3)
          const tilt = rel === 0 ? 0 : (rel % 2 === 0 ? -1 : 1) * (2 + rel)
          const rising = !!leaving || (Math.abs(drag) > 30 && rel === 1)
          const followFinger = rel === 0 && !isLeaving && drag !== 0
          const transform = isLeaving
            ? `translateX(${leaving.dir * 125}%) rotate(${leaving.dir * 16}deg)`
            : followFinger
              ? `translateX(${drag}px) rotate(${drag / 22}deg)`
              : `translateY(${(rising && rel === 1 ? 0 : depth) * 10}px) rotate(${rising && rel === 1 ? 0 : tilt}deg) scale(${rising && rel === 1 ? 1 : 1 - depth * 0.05})`
          return (
            <figure
              key={p.id}
              className="absolute inset-0 bg-white p-2.5 pb-9 shadow-[0_18px_34px_-18px_rgba(0,0,0,0.5)]"
              style={{
                transform,
                zIndex: isLeaving ? n + 1 : n - rel,
                opacity: rel > 3 && !isLeaving ? 0 : 1,
                transition: reduced || (dragging && rel === 0) ? 'none' : `transform 420ms ${EASE}, opacity 300ms ease`,
              }}
            >
              <img src={p.url} alt={p.caption ?? ''} loading="lazy" draggable={false} className="size-full object-cover" />
            </figure>
          )
        })}
      </div>
      <Dots count={n} index={top} onPick={setTop} />
      <p className="text-xs tracking-[0.25em] text-[color:var(--iv-ink)] opacity-60">TAP OR SWIPE</p>
    </div>
  )
}

/* ───────── 4. Mosaic ─────────
 * Every photo at once in an editorial layout. Tap one to see it large. */
function Mosaic({ photos }: { photos: GalleryPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const [grid, seen] = useOnScreen<HTMLDivElement>()
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (seen) setShown(true)
  }, [seen])
  const n = photos.length

  useEffect(() => {
    if (open === null) return
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((o) => (o === null ? o : (o + 1) % n))
      if (e.key === 'ArrowLeft') setOpen((o) => (o === null ? o : (o - 1 + n) % n))
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [open, n])

  const tile = (i: number, cls: string) => (
    <button
      key={photos[i].id}
      type="button"
      onClick={() => setOpen(i)}
      aria-label={`Open photo ${i + 1}`}
      className={cn('relative overflow-hidden bg-black/5', cls)}
      style={{
        clipPath: shown ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)',
        transition: `clip-path 1100ms ${EASE} ${i * 140}ms`,
      }}
    >
      <img
        src={photos[i].url}
        alt={photos[i].caption ?? ''}
        loading="lazy"
        draggable={false}
        className="absolute inset-0 size-full object-cover transition-transform duration-[1400ms] hover:scale-105"
        style={{ transform: shown ? undefined : 'scale(1.25)' }}
      />
    </button>
  )

  let layout: React.ReactNode
  if (n === 2) {
    layout = (
      <div className="grid grid-cols-2 gap-2">
        {tile(0, 'aspect-[3/4]')}
        <div className="pt-10">{tile(1, 'aspect-[3/4] w-full')}</div>
      </div>
    )
  } else if (n === 3) {
    layout = (
      <div className="grid grid-cols-2 gap-2">
        {tile(0, 'col-span-2 aspect-[16/10]')}
        {tile(1, 'aspect-square')}
        {tile(2, 'aspect-square')}
      </div>
    )
  } else {
    layout = (
      <div className="flex flex-col gap-2">
        <div className="grid aspect-[5/4] grid-cols-3 grid-rows-2 gap-2">
          {tile(0, 'col-span-2 row-span-2')}
          {tile(1, '')}
          {tile(2, '')}
        </div>
        {tile(3, 'aspect-[16/8] w-full')}
      </div>
    )
  }

  return (
    <div ref={grid} className="mx-auto max-w-xl">
      {layout}
      {open !== null && (
        <div role="dialog" aria-modal="true" aria-label="Photo" className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4" onClick={() => setOpen(null)}>
          <img src={photos[open].url} alt={photos[open].caption ?? ''} className="max-h-full max-w-full object-contain" />
          <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/15 text-white">
            <X className="size-5" />
          </button>
          {n > 1 && (
            <div className="absolute inset-x-0 bottom-6 flex justify-center gap-4" onClick={(e) => e.stopPropagation()}>
              <ArrowButton dir={-1} onClick={() => setOpen((o) => (o === null ? o : (o - 1 + n) % n))} light />
              <ArrowButton dir={1} onClick={() => setOpen((o) => (o === null ? o : (o + 1) % n))} light />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ───────── 5. Frames ─────────
 * A column of framed photos. Each one rises into place as you scroll, and the next stacks below it,
 * leaning the other way and tucked slightly under the one before. */
function Frames({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col">
      {photos.map((p, i) => (
        <FrameItem key={p.id} photo={p} index={i} />
      ))}
    </div>
  )
}

function FrameItem({ photo, index }: { photo: GalleryPhoto; index: number }) {
  const [ref, seen] = useOnScreen<HTMLDivElement>()
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (seen) setShown(true)
  }, [seen])
  const right = index % 2 === 1
  return (
    <div
      ref={ref}
      className={cn('relative w-[88%]', right ? 'self-end' : 'self-start', index > 0 && '-mt-6')}
      style={{
        zIndex: index + 1,
        opacity: shown ? 1 : 0,
        transform: shown ? `rotate(${right ? 1.6 : -1.6}deg)` : `translateY(60px) rotate(${right ? 5 : -5}deg)`,
        transition: `opacity 900ms ease, transform 1100ms ${EASE}`,
      }}
    >
      <div className="bg-white p-3 shadow-[0_22px_40px_-22px_rgba(0,0,0,0.55)]">
        <div className="border border-[color:var(--iv-main)] p-1.5">
          <img src={photo.url} alt={photo.caption ?? ''} loading="lazy" draggable={false} className="aspect-[4/5] w-full object-cover" />
        </div>
      </div>
    </div>
  )
}

/* ───────── 6. Cascade ─────────
 * Prints dropped one on top of another down the page. Each lands with a little bounce as it comes into view. */
function Cascade({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <div className="mx-auto flex max-w-xs flex-col items-center pb-6">
      {photos.map((p, i) => (
        <CascadeItem key={p.id} photo={p} index={i} />
      ))}
    </div>
  )
}

function CascadeItem({ photo, index }: { photo: GalleryPhoto; index: number }) {
  const [ref, seen] = useOnScreen<HTMLDivElement>()
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (seen) setShown(true)
  }, [seen])
  const tilt = [-3, 2.5, -2, 3][index % 4]
  return (
    <div
      ref={ref}
      className={cn('relative w-[84%]', index > 0 && '-mt-16')}
      style={{
        zIndex: index + 1,
        opacity: shown ? 1 : 0,
        transform: shown ? `rotate(${tilt}deg) scale(1)` : `rotate(${tilt * 3}deg) scale(1.18) translateY(-30px)`,
        transition: `opacity 500ms ease, transform 900ms cubic-bezier(0.34, 1.4, 0.5, 1)`,
      }}
    >
      <figure className="bg-white p-2.5 pb-10 shadow-[0_22px_40px_-20px_rgba(0,0,0,0.55)]">
        <img src={photo.url} alt={photo.caption ?? ''} loading="lazy" draggable={false} className="aspect-[4/5] w-full object-cover" />
      </figure>
    </div>
  )
}

/** The photo gallery of an invitation, in the style its template uses. */
export function PhotoGallery({ photos, style }: { photos: GalleryPhoto[]; style: GalleryStyle }) {
  if (photos.length === 0) return null
  if (photos.length === 1) {
    return (
      <div className="mx-auto max-w-md">
        <img src={photos[0].url} alt={photos[0].caption ?? ''} loading="lazy" className="aspect-[4/5] w-full object-cover shadow-[0_24px_50px_-28px_rgba(0,0,0,0.5)]" />
      </div>
    )
  }
  if (style === 'spotlight') return <Spotlight photos={photos} />
  if (style === 'deck') return <Deck photos={photos} />
  if (style === 'mosaic') return <Mosaic photos={photos} />
  if (style === 'frames') return <Frames photos={photos} />
  if (style === 'cascade') return <Cascade photos={photos} />
  if (style === 'slider') return <PhotoSlider photos={photos} />
  return <ZoomSlider photos={photos} />
}
