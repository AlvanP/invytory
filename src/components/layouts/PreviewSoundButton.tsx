import { useSyncExternalStore } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { previewMusic } from '@/services/previewMusic'

let snap = ''
const getSnap = () => {
  const s = previewMusic.state()
  const next = `${s.active}|${s.muted}|${s.waiting}`
  snap = next
  return snap
}

/** A small floating button so visitors can mute the preview music. Only shows while a preview has a song. */
export function PreviewSoundButton() {
  const s = useSyncExternalStore(previewMusic.subscribe, getSnap, () => '')
  const [active, muted] = s.split('|')
  if (active !== 'true') return null
  const off = muted === 'true'
  return (
    <button
      type="button"
      onClick={() => previewMusic.toggleMute()}
      aria-label={off ? 'Turn the preview music on' : 'Mute the preview music'}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-wine/20 bg-ivory/95 px-4 py-2.5 text-xs font-medium text-wine shadow-lg backdrop-blur"
    >
      {off ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      {off ? 'Sound off' : 'Sound on'}
    </button>
  )
}
