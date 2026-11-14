import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

const FADE_MS = 1000
/** Give up on a video that has not become playable by now, and use the built-in entrance. */
const LOAD_TIMEOUT_MS = 9000

/**
 * A designer-made entrance video. It waits on its first frame with a "tap to open" prompt. A tap plays
 * it from the start; when it ends the whole layer fades from fully visible to fully transparent,
 * revealing the invitation underneath.
 */
export function VideoEntrance({
  src,
  hint = 'Tap to open',
  inviteeName,
  onTap,
  onFadeStart,
  onOpen,
  onFail,
  autoOpenMs,
}: {
  src: string
  hint?: string
  inviteeName?: string
  /** Runs inside the guest's tap (starts the music). */
  onTap?: () => void
  /** The fade has begun: show the invitation underneath now. */
  onFadeStart?: () => void
  /** The fade is finished: remove this layer. */
  onOpen: () => void
  /** The video could not be loaded: use the built-in entrance instead. */
  onFail: () => void
  /** Opens by itself after this many ms (the moving samples). */
  autoOpenMs?: number
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'playing' | 'fading'>('idle')
  const [canSkip, setCanSkip] = useState(false)
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  // The video may already be loaded by the time this runs (cached), in which case its event has come and gone.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (v.readyState >= 2) setReady(true)
    const mark = () => setReady(true)
    v.addEventListener('loadeddata', mark)
    v.addEventListener('canplay', mark)
    return () => {
      v.removeEventListener('loadeddata', mark)
      v.removeEventListener('canplay', mark)
    }
  }, [])

  // A missing file is answered with the site's home page, not an error. Spot that straight away
  // so the guest gets the built-in entrance instead of waiting on a spinner.
  useEffect(() => {
    let cancelled = false
    fetch(src, { method: 'HEAD' })
      .then((res) => {
        const type = res.headers.get('content-type') ?? ''
        if (!cancelled && (!res.ok || type.includes('text/html'))) onFail()
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  // A video that never loads must not trap the guest on a blank screen.
  useEffect(() => {
    if (ready) return
    const t = window.setTimeout(onFail, LOAD_TIMEOUT_MS)
    return () => window.clearTimeout(t)
  }, [ready, onFail])

  function fade() {
    if (phaseRef.current === 'fading') return
    setPhase('fading')
    onFadeStart?.()
    window.setTimeout(onOpen, FADE_MS)
  }

  function start() {
    const v = videoRef.current
    if (!v || !ready || phaseRef.current !== 'idle') return
    onTap?.()
    try {
      navigator.vibrate?.(18)
    } catch {
      // not supported
    }
    setPhase('playing')
    v.currentTime = 0
    v.play().catch(fade)
    window.setTimeout(() => setCanSkip(true), 1500)
  }

  useEffect(() => {
    if (!autoOpenMs || !ready) return
    const t = window.setTimeout(start, autoOpenMs)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenMs, ready])

  return (
    <div
      className={cn('relative h-full w-full overflow-hidden bg-black', phase === 'idle' && ready && 'cursor-pointer')}
      style={{ opacity: phase === 'fading' ? 0 : 1, transition: `opacity ${FADE_MS}ms ease-in-out`, pointerEvents: phase === 'fading' ? 'none' : undefined }}
      onClick={start}
      role="button"
      tabIndex={0}
      aria-label="Open the invitation"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') start()
      }}
    >
      <video
        ref={videoRef}
        // #t=0.001 makes phones paint the first frame while waiting for the tap.
        src={`${src}#t=0.001`}
        playsInline
        preload="auto"
        onError={onFail}
        onEnded={fade}
        // object-cover fills a phone screen; on a wide screen the whole video stays visible instead of being cropped.
        className="absolute inset-0 h-full w-full object-cover landscape:object-contain"
      />

      {!ready && (
        <div className="absolute inset-0 grid place-items-center">
          <Loader2 className="size-7 animate-spin text-white/70" />
        </div>
      )}

      {ready && inviteeName && phase === 'idle' && (
        <p className="pointer-events-none absolute inset-x-0 top-[8%] px-8 text-center font-display text-lg text-white [text-shadow:0_2px_14px_rgba(0,0,0,.7)]">
          {inviteeName} is specially invited
        </p>
      )}

      {ready && phase === 'idle' && (
        <p className="pointer-events-none absolute inset-x-0 bottom-[7%] animate-pulse text-center text-xs uppercase tracking-[0.3em] text-white [text-shadow:0_2px_12px_rgba(0,0,0,.8)]">
          {hint}
        </p>
      )}

      {phase === 'playing' && canSkip && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            fade()
          }}
          className="absolute bottom-6 right-5 rounded-full bg-black/35 px-4 py-1.5 text-xs tracking-[0.15em] text-white/90 backdrop-blur-sm"
        >
          Skip
        </button>
      )}
    </div>
  )
}
