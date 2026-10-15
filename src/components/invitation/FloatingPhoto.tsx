import { useEffect, useRef } from 'react'

/**
 * One photo in a minimal frame (a thin outline offset behind it). As the guest scrolls it
 * tilts a few degrees and drifts slightly. With "reduce motion" on, it stays still.
 */
export function FloatingPhoto({ src, alt = '' }: { src: string; alt?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const update = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      // -1 when the photo is just below the screen, +1 just above it.
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh))
      el.style.transform = `translateY(${(p * -22).toFixed(1)}px) rotate(${(p * 6).toFixed(2)}deg)`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="px-6 py-6">
      <div ref={ref} className="relative mx-auto w-[68%] max-w-[300px] will-change-transform">
        <div aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 border border-[color:var(--iv-main)]" />
        <div className="relative bg-[color:var(--iv-paper)] p-2 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)]">
          <img src={src} alt={alt} loading="lazy" className="aspect-[4/5] w-full object-cover" />
        </div>
      </div>
    </div>
  )
}
