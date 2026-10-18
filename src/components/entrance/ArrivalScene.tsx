import { useEffect, useState } from 'react'
import { cn } from '@/utils/cn'
import type { CoverTone } from '@/templates/TemplateCover'
import { DoorEntrance } from './DoorEntrance'
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

  useEffect(() => {
    if (revealed) onRevealed?.()
  }, [revealed, onRevealed])

  useEffect(() => {
    document.body.style.overflow = revealed ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [revealed])

  function handleOpen() {
    setExiting(true)
    // Matches the overlay's own fade-out duration below.
    setTimeout(() => setRevealed(true), 500)
  }

  return (
    <div className="relative">
      <div className={cn('transition-opacity duration-700', revealed ? 'opacity-100' : 'opacity-0')}>
        <RevealedContext.Provider value={revealed}>{children}</RevealedContext.Provider>
      </div>

      {!revealed && (
        <div
          className={cn(
            'fixed inset-0 z-50 animate-[entranceIn_0.6s_ease-out] transition-opacity duration-500',
            exiting && 'pointer-events-none opacity-0'
          )}
        >
          <DoorEntrance tone={tone} templateId={templateId} brideName={brideName} groomName={groomName} onOpen={handleOpen} onTap={onTap} autoOpenMs={autoOpenMs} inviteeName={inviteeName} />
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