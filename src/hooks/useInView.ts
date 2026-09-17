import { useEffect, useRef, useState } from 'react'

/**
 * Reveals its children once, the first time they scroll into view.
 * Deliberately never "un-reveals" on scroll back up — that reads as
 * glitchy rather than elegant. Respects prefers-reduced-motion
 * automatically via the global CSS override in styles/index.css,
 * which collapses all transition durations to ~0 for those users.
 */
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px', ...options }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [options])

  return { ref, inView }
}