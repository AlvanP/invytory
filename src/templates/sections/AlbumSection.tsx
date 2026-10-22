import { Camera } from 'lucide-react'
import { Link } from 'react-router-dom'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { useAlbum } from '@/templates/AlbumContext'
import { variantFor } from '@/templates/designs'
import { useDesign } from '@/templates/DesignContext'

/** SECTION: Guest album. A button that takes guests to the shared album to add their photos. Only shown when the event has one. */
export function AlbumSection() {
  const album = useAlbum()
  const { design } = useDesign()
  if (!album) return null
  const onBand = variantFor(design, 'album') === 'band'
  return (
    <InvitationSection id="album" eyebrow="Share The Memories" title="Add Your Photos">
      <div className="flex flex-col items-center gap-6">
        <p className={onBand ? 'max-w-sm text-base leading-relaxed' : 'max-w-sm text-base leading-relaxed text-[color:var(--iv-ink)]'}>
          Took a great photo? Add it to the shared album so everyone can enjoy it. No app and no sign-up.
        </p>
        <Link
          to={album.path}
          className={
            onBand
              ? 'inline-flex items-center gap-2 rounded-full bg-[color:var(--iv-paper)] px-7 py-3.5 text-sm font-medium text-[color:var(--iv-ink)] shadow-lg transition-transform active:scale-95'
              : 'inline-flex items-center gap-2 rounded-full bg-[color:var(--iv-main)] px-7 py-3.5 text-sm font-medium text-[color:var(--iv-on-main)] shadow-lg transition-transform active:scale-95'
          }
        >
          <Camera className="size-4" /> Add your photos
        </Link>
      </div>
    </InvitationSection>
  )
}
