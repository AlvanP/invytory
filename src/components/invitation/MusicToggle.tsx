import { Volume2, VolumeX } from 'lucide-react'

/** Small floating button that mutes / unmutes the invitation's music. */
export function MusicToggle({
  muted,
  needsTap,
  onToggle,
}: {
  muted: boolean
  needsTap: boolean
  onToggle: () => void
}) {
  const silent = muted || needsTap
  const label = needsTap ? 'Play music' : muted ? 'Unmute music' : 'Mute music'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className="fixed bottom-4 right-4 z-40 flex size-11 items-center justify-center rounded-full bg-white/90 text-ink shadow-lift backdrop-blur transition-colors hover:bg-white"
    >
      {silent ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
    </button>
  )
}
