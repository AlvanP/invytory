import { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'

const SCREEN_W = 390
const SCREEN_H = 844

/**
 * A slim-framed phone showing a live sample invitation. The invitation is the real thing
 * (the /sample page) in an iframe, scaled to fit, so it scrolls and animates exactly as a guest sees it.
 * It only loads once it is close to the screen, so a page with several phones stays light.
 */
export function PhoneMockup({
  templateId,
  auto = true,
  interactive = false,
  scratch = false,
  className,
}: {
  templateId: string
  /** Scrolls by itself. */
  auto?: boolean
  /** Lets the visitor scroll and tap inside the phone. */
  interactive?: boolean
  scratch?: boolean
  className?: string
}) {
  const screen = useRef<HTMLDivElement | null>(null)
  const frame = useRef<HTMLIFrameElement | null>(null)
  const [scale, setScale] = useState(0.5)
  const [height, setHeight] = useState(SCREEN_H)
  const [near, setNear] = useState(false)
  const [loadedSrc, setLoadedSrc] = useState('')

  useEffect(() => {
    const node = screen.current
    if (!node) return
    const resize = new ResizeObserver(() => {
      const k = node.clientWidth / SCREEN_W
      setScale(k)
      // fill the whole screen: the frame's height decides how tall the page inside is
      setHeight(node.clientHeight / k)
    })
    resize.observe(node)
    const seen = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '300px' })
    // Pause the moving sample while the phone is off screen, so the page stays light.
    const watch = new IntersectionObserver(([e]) => frame.current?.contentWindow?.postMessage(e.isIntersecting ? 'invytory:play' : 'invytory:pause', '*'))
    watch.observe(node)
    seen.observe(node)
    return () => {
      resize.disconnect()
      seen.disconnect()
      watch.disconnect()
    }
  }, [])

  const query = [auto && !interactive ? 'auto=1' : '', auto || interactive ? 'entrance=1' : '', scratch ? 'scratch=1' : ''].filter(Boolean).join('&')
  const src = `/sample/${templateId}${query ? `?${query}` : ''}`
  const ready = loadedSrc === src

  return (
    <div
      className={cn(
        'relative aspect-[390/844] rounded-[2.4rem] bg-[#1d1214] p-[5px] shadow-[0_40px_80px_-30px_rgba(89,38,47,0.55),0_0_0_1px_rgba(255,255,255,0.08)_inset]',
        className
      )}
    >
      <div ref={screen} className="relative size-full overflow-hidden rounded-[2.05rem] bg-ivory">
        {near && (
          <iframe
            ref={frame}
            key={src}
            src={src}
            title={`Sample invitation`}
            tabIndex={interactive ? 0 : -1}
            aria-hidden={interactive ? undefined : true}
            onLoad={() => setLoadedSrc(src)}
            className={cn(
              'absolute left-0 top-0 origin-top-left border-0 transition-opacity duration-700',
              ready ? 'opacity-100' : 'opacity-0',
              !interactive && 'pointer-events-none'
            )}
            style={{ width: SCREEN_W, height, transform: `scale(${scale})`, willChange: 'transform' }}
          />
        )}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[7px] h-[11px] w-[58px] -translate-x-1/2 rounded-full bg-[#1d1214]" />
      </div>
    </div>
  )
}
