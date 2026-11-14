import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'
import type { CoverTone } from '@/templates/TemplateCover'
import { DoorEntrance } from './DoorEntrance'
import { useEntranceSetting } from '@/hooks/useEntranceSetting'
import { musicDelaySeconds } from '@/services/entranceService'
import { RevealedContext } from '@/hooks/useRevealed'

/**
 * The Transition Engine. The entrance sits as a full-screen overlay
 * above the invitation; tapping it triggers DoorEntrance's opening
 * animation, then this component fades the overlay out and reveals
 * the invitation underneath, which was already mounted (not
 * remounted), so scrolling starts smoothly with no flash or reload.
 */
export function ArrivalScene({
  tone,
  templateId,
  brideName,
  groomName,
  onTap,
  onStartMusic,
  autoOpenMs,
  onRevealed,
  inviteeName,
  children,
}: {
  tone: CoverTone
  templateId?: string
  brideName: string
  groomName: string
  /** Passed to the entrance; runs inside the guest's tap (used to start music). */
  onTap?: () => void
  /** Starts the music. When it runs depends on the entrance's setting (admin > Entrances). */
  onStartMusic?: () => void
  /** Opens the entrance by itself after this many ms (used by the moving samples). */
  autoOpenMs?: number
  /** Called once the invitation is showing. */
  onRevealed?: () => void
  /** For a personal link: "Chief Emeka Okonkwo is specially invited to" replaces the usual line. */
  inviteeName?: string
  children: React.ReactNode
}) {
  const [exiting, setExiting] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [overlayGone, setOverlayGone] = useState(false)
  const { loading, setting } = useEntranceSetting(templateId)
  const musicStarted = useRef(false)
  const timers = useRef<number[]>([])

  /** Starts the music once, however many triggers fire. */
  const startMusic = useCallback(() => {
    if (musicStarted.current) return
    musicStarted.current = true
    onStartMusic?.()
  }, [onStartMusic])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  /** The guest tapped: start the music now, or arrange for it to start at the chosen moment. */
  function handleTap() {
    const mode = setting.musicStart
    if (mode === 'tap') {
      startMusic()
      return
    }
    onTap?.() // unlocks sound for the later start
    const delay = musicDelaySeconds(mode)
    if (delay !== null) timers.current.push(window.setTimeout(startMusic, delay * 1000))
  }

  useEffect(() => {
    if (revealed) onRevealed?.()
  }, [revealed, onRevealed])

  useEffect(() => {
    if (revealed && setting.musicStart === 'content') startMusic()
  }, [revealed, setting.musicStart, startMusic])

  useEffect(() => {
    document.body.style.overflow = revealed ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [revealed])

  function handleOpen() {
    if (setting.musicStart === 'end') startMusic()
    setExiting(true)
    // Matches the overlay's own fade-out duration below.
    setTimeout(() => {
      setRevealed(true)
      setOverlayGone(true)
    }, 500)
  }

  /** A video entrance fades itself out, so the invitation is revealed under it while it fades. */
  function handleFadeStart() {
    if (setting.musicStart === 'end') startMusic()
    setRevealed(true)
  }

  return (
    <div className="relative">
      <div className={cn('transition-opacity duration-700', revealed ? 'opacity-100' : 'opacity-0')}>
        <RevealedContext.Provider value={revealed}>{children}</RevealedContext.Provider>
      </div>

      {!overlayGone && (
        <div
          className={cn(
            'fixed inset-0 z-50 animate-[entranceIn_0.6s_ease-out] transition-opacity duration-500',
            (exiting || revealed) && 'pointer-events-none',
            exiting && 'opacity-0'
          )}
        >
          {loading ? <div className="h-full w-full bg-black" /> : <DoorEntrance tone={tone} templateId={templateId} brideName={brideName} groomName={groomName} setting={setting} onOpen={handleOpen} onFadeStart={handleFadeStart} onTap={handleTap} autoOpenMs={autoOpenMs} inviteeName={inviteeName} />}
        </div>
      )}

      <style>{`
        @keyframes entranceIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}