import { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'
import { getKit, kitStyle, loadKit, type KitId } from '@/templates/fontKits'

const FADE_MS = 1000
/** Give up on a video that has not arrived by now, and use the built-in entrance. */
const LOAD_TIMEOUT_MS = 30000

/**
 * A designer-made entrance video. The whole file is downloaded before it can be tapped, so the
 * playback never stalls halfway on a slow connection. It waits on its first frame with a "tap to
 * open" prompt. A tap plays it from the start; when it ends the whole layer fades from fully
 * visible to fully transparent, revealing the invitation underneath.
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
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
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

  // Download the entire video first, then play it from memory: no stalls, ever.
  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null
    const timeout = window.setTimeout(() => {
      if (!cancelled) onFail()
    }, LOAD_TIMEOUT_MS)
    ;(async () => {
      try {
        const res = await fetch(src)
        const type = res.headers.get('content-type') ?? ''
        // A missing file is answered with the site's home page, not an error.
        if (!res.ok || type.includes('text/html')) throw new Error('missing')
        const total = Number(res.headers.get('content-length')) || 0
        const reader = res.body?.getReader()
        if (!reader) {
          const blob = await res.blob()
          if (cancelled) return
          objectUrl = URL.createObjectURL(blob)
          setBlobUrl(objectUrl)
          return
        }
        const chunks: Uint8Array[] = []
        let got = 0
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
          got += value.length
          if (total && !cancelled) setProgress(Math.min(0.99, got / total))
        }
        if (cancelled) return
        objectUrl = URL.createObjectURL(new Blob(chunks as BlobPart[], { type: type.startsWith('video/') ? type : 'video/mp4' }))
        setBlobUrl(objectUrl)
      } catch {
        if (!cancelled) onFail()
      }
    })()
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  // Ready when the downloaded video can show its first frame (it may already have by the time this runs).
  useEffect(() => {
    const v = videoRef.current
    if (!v || !blobUrl) return
    const mark = () => setReady(true)
    if (v.readyState >= 2) mark()
    v.addEventListener('loadeddata', mark)
    v.addEventListener('canplay', mark)
    return () => {
      v.removeEventListener('loadeddata', mark)
      v.removeEventListener('canplay', mark)
    }
  }, [blobUrl])

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
    if (!v || !ready || phaseRef.current !== 'idle') return
    onTap?.()
    try {
      navigator.vibrate?.(18)
    } catch {
      // not supported
    }
    setPhase('playing')
    v.currentTime = 0
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
      {blobUrl && (
        <video
          ref={videoRef}
          src={blobUrl}
          playsInline
          muted={muted}
          preload="auto"
          disableRemotePlayback
          onError={onFail}
          onEnded={fade}
          // object-cover fills a phone screen; on a wide screen the whole video stays visible instead of being cropped.
          className="absolute inset-0 h-full w-full object-cover landscape:object-contain"
        />
      )}

      {!ready && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-1 w-32 overflow-hidden rounded-full bg-white/15">
              <div className="h-full bg-white/70 transition-[width] duration-200" style={{ width: `${Math.max(6, Math.round(progress * 100))}%` }} />
            </div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">Preparing</p>
          </div>
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
