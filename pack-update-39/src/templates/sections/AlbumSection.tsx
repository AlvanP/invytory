import { useState } from 'react'
import { Camera } from 'lucide-react'
import { Link } from 'react-router-dom'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { useAlbum } from '@/templates/AlbumContext'
import { variantFor } from '@/templates/designs'
import { useDesign } from '@/templates/DesignContext'
import { albumHasOpened, prettyOpenDate } from '@/utils/albumDate'

/** SECTION: Guest album. A button that takes guests to the shared album to add their photos. Only shown when the event has one. */
export function AlbumSection() {
  const album = useAlbum()
  const { design } = useDesign()
  const [notice, setNotice] = useState(false)
  if (!album) return null
  const onBand = variantFor(design, 'album') === 'band'
  const opened = albumHasOpened(album.opensOn)
  const buttonClass = onBand
    ? 'inline-flex items-center gap-2 rounded-full bg-[color:var(--iv-paper)] px-7 py-3.5 text-sm font-medium text-[color:var(--iv-ink)] shadow-lg transition-transform active:scale-95'
    : 'inline-flex items-center gap-2 rounded-full bg-[color:var(--iv-main)] px-7 py-3.5 text-sm font-medium text-[color:var(--iv-on-main)] shadow-lg transition-transform active:scale-95'
  return (
    <InvitationSection id="album" eyebrow="Share The Memories" title="Add Your Photos">
      <div className="flex flex-col items-center gap-6">
        <p className={onBand ? 'max-w-sm text-base leading-relaxed' : 'max-w-sm text-base leading-relaxed text-[color:var(--iv-ink)]'}>
          Took a great photo? Add it to the shared album so everyone can enjoy it. No app and no sign-up.
        </p>
        {opened ? (
          <Link to={album.path} className={buttonClass}>
            <Camera className="size-4" /> Add your photos
          </Link>
        ) : (
          <>
            <button type="button" onClick={() => setNotice(true)} className={buttonClass} aria-expanded={notice}>
              <Camera className="size-4" /> Add your photos
            </button>
            {notice && (
              <p role="status" className={onBand ? 'max-w-sm text-sm leading-relaxed' : 'max-w-sm text-sm leading-relaxed text-[color:var(--iv-ink)]'}>
                The event is still ahead. The album opens on {album.opensOn ? prettyOpenDate(album.opensOn) : 'the day of the event'}.
                Please come back then to add your photos.
              </p>
            )}
          </>
        )}
      </div>
    </InvitationSection>
  )
}
