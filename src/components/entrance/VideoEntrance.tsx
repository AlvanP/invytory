import { useEffect, useRef, useState } from 'react'
import { posterUrl } from '@/services/entranceService'
import { cn } from '@/utils/cn'
import { getKit, kitStyle, loadKit, type KitId } from '@/templates/fontKits'

const FADE_MS = 1000
/** Give up on a video that has not arrived by now, and use the built-in entrance. */
const LOAD_TIMEOUT_MS = 25000

/**
 * A designer-made entrance video. It shows its still picture at once, then "tap to open" (after a
 * moment at most, whatever the connection). A tap plays it, buffering as needed; when it ends the
 * whole layer fades from fully visible to fully transparent, revealing the invitation underneath.
 */
export function VideoEntrance({
  src,
  hint = 'Tap to open',
  inviteeName,
  muted = false,
  names,
  namesAt,
  namesColor = '#E6CF9A',
  kit,
  onTap,
  onFadeStart,
  onOpen,
  onFail,
  autoOpenMs,
}: {
  src: string
  hint?: string
  inviteeName?: string
  /** Play without the video's own sound. */
  muted?: boolean
  /** The couple's names, shown in lines once the video reaches `namesAt` seconds. */
  names?: string[]
  namesAt?: number | null
  namesColor?: string
  kit?: KitId
  /** Runs inside the guest's tap. */
  onTap?: () => void
  /** The fade has begun: the video is over and the invitation shows underneath now. */
  onFadeStart?: () => void
  /** The fade is finished: remove this layer. */
  onOpen: () => void
  /** The video could not be loaded: use the built-in entrance instead. */
  onFail: () => void
  /** Opens by itself after this many ms (the moving samples). */
  autoOpenMs?: number
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [buffering, setBuffering] = useState(false)
  const poster = posterUrl(src)
  const [ready, setReady] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'playing' | 'fading'>('idle')
  const [canSkip, setCanSkip] = useState(false)
  const [namesIn, setNamesIn] = useState(false)
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const kitDef = getKit(kit)

  useEffect(() => {
    if (kit) loadKit(kitDef)
  }, [kit, kitDef])

  // The guest can tap as soon as the picture (or the video's first frame) is there, or after a
  // short moment at most. Nothing ever waits on the whole video: it buffers while they look.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const mark = () => setReady(true)
    if (v.readyState >= 1) mark()
    v.addEventListener('loadedmetadata', mark)
    v.addEventListener('loadeddata', mark)
    v.addEventListener('canplay', mark)
    const soon = window.setTimeout(mark, 1200)
    // A video that gives no sign of life at all (broken file) hands over to the built-in entrance.
    const giveUp = window.setTimeout(() => {
      if (v.readyState < 1 && v.networkState !== 2) onFail()
    }, LOAD_TIMEOUT_MS)
    return () => {
      window.clearTimeout(soon)
      window.clearTimeout(giveUp)
      v.removeEventListener('loadedmetadata', mark)
      v.removeEventListener('loadeddata', mark)
      v.removeEventListener('canplay', mark)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Show the names when the video reaches the chosen second.
  useEffect(() => {
    if (phase !== 'playing' || namesAt == null) return
    let raf = 0
    const tick = () => {
      const v = videoRef.current
      if (v && v.currentTime >= namesAt) {
        setNamesIn(true)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, namesAt])

  function fade() {
    if (phaseRef.current === 'fading') return
    setPhase('fading')
    onFadeStart?.()
    window.setTimeout(onOpen, FADE_MS)
  }

  function start() {
    const v = videoRef.current
    if (!v || phaseRef.current !== 'idle') return
    onTap?.()
    try {
      navigator.vibrate?.(18)
    } catch {
      // not supported
    }
    setPhase('playing')
    v.muted = muted
    v.play().catch(() => {
      // Some phones refuse sound; try again silently rather than leave the guest stuck.
      v.muted = true
      v.play().catch(fade)
    })
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
      {
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          onWaiting={() => phaseRef.current === 'playing' && setBuffering(true)}
          onPlaying={() => setBuffering(false)}
          playsInline
          muted={muted}
          preload="auto"
          disableRemotePlayback
          onError={onFail}
          onEnded={fade}
          // object-cover fills a phone screen; on a wide screen the whole video stays visible instead of being cropped.
          className="absolute inset-0 h-full w-full object-cover landscape:object-contain"
        />
      }

      {(buffering || !ready) && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/25 border-t-white/80" />
        </div>
      )}

      {ready && inviteeName && phase === 'idle' && (
        <p className="pointer-events-none absolute inset-x-0 top-[8%] px-8 text-center font-display text-lg text-white [text-shadow:0_2px_14px_rgba(0,0,0,.7)]">
          {inviteeName} is specially invited
        </p>
      )}

      {names && names.length > 0 && namesAt != null && (
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 px-8 text-center"
          style={{ ...kitStyle(kitDef), color: namesColor, opacity: namesIn ? 1 : 0, transform: namesIn ? 'none' : 'translateY(14px)', transition: 'opacity 2600ms ease-out, transform 2600ms ease-out', textShadow: '0 2px 18px rgba(0,0,0,.45)' }}
        >
          {names.map((n, i) => (
            <p
              key={i}
              className={i === 1 ? 'text-3xl opacity-80' : 'text-5xl leading-[1.15]'}
              style={{ fontFamily: 'var(--iv-name-font)' }}
            >
              {n}
            </p>
          ))}
        </div>
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
