import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Camera, Check, Loader2, RotateCw, Trash2 } from 'lucide-react'
import type { Wedding } from '@/types'
import { weddingService } from '@/services/weddingService'
import { albumService, type AlbumPhoto } from '@/services/albumService'
import { namesTitle } from '@/utils/format'
import { albumHasOpened, earliestEventDate, prettyOpenDate } from '@/utils/albumDate'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'

type Status = 'waiting' | 'uploading' | 'done' | 'failed'
interface QueueItem {
  key: string
  file: File
  status: Status
  error?: string
}

const NAME_KEY = 'invytory:album-name'
const CONCURRENCY = 2

function readName(): string {
  try {
    return window.localStorage.getItem(NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

export function AlbumPage() {
  const { slug } = useParams<{ slug: string }>()
  const [state, setState] = useState<'loading' | 'missing' | 'closed' | 'early' | 'open'>('loading')
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [title, setTitle] = useState('')
  const [name, setName] = useState(readName)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [photos, setPhotos] = useState<AlbumPhoto[]>([])
  const [viewing, setViewing] = useState<AlbumPhoto | null>(null)
  const [opensOn, setOpensOn] = useState<string | null>(null)
  const [mine, setMine] = useState<Set<string>>(() => albumService.mine())
  const [removing, setRemoving] = useState(false)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const runningRef = useRef(0)
  const queueRef = useRef<QueueItem[]>([])
  queueRef.current = queue
  const nameRef = useRef(name)
  nameRef.current = name

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    weddingService
      .getBySlugWithCeremonies(slug)
      .then(async (found) => {
        if (cancelled) return
        if (!found) return setState('missing')
        const { wedding: w, ceremonies } = found
        setWedding(w)
        const first = ceremonies[0]
        setTitle(first ? namesTitle(first.brideName, first.groomName) : 'Our event')
        const expired = !!w.expiresAt && new Date(w.expiresAt).getTime() < Date.now()
        if (w.status !== 'published' || w.plan !== 'gold' || expired) return setState('closed')
        const opens = earliestEventDate(ceremonies.map((c) => c.weddingDate))
        setOpensOn(opens)
        // Photos can be added from the day of the event. Before that, guests are told when to come back.
        if (!albumHasOpened(opens)) return setState('early')
        setState('open')
        try {
          setPhotos(await albumService.list(w.id, 60))
        } catch {
          // The grid is a bonus; uploading still works without it.
        }
      })
      .catch(() => !cancelled && setState('missing'))
    return () => {
      cancelled = true
    }
  }, [slug])

  const patch = useCallback((key: string, change: Partial<QueueItem>) => {
    setQueue((cur) => cur.map((q) => (q.key === key ? { ...q, ...change } : q)))
  }, [])

  const pump = useCallback(() => {
    if (!wedding) return
    while (runningRef.current < CONCURRENCY) {
      const next = queueRef.current.find((q) => q.status === 'waiting')
      if (!next) return
      // Mark it in the ref straight away so the loop does not pick it twice.
      next.status = 'uploading'
      runningRef.current += 1
      patch(next.key, { status: 'uploading', error: undefined })
      albumService
        .upload(wedding.id, next.file, nameRef.current)
        .then(() => patch(next.key, { status: 'done' }))
        .catch((err: unknown) =>
          patch(next.key, { status: 'failed', error: err instanceof Error ? err.message : 'Upload failed.' })
        )
        .finally(() => {
          runningRef.current -= 1
          pump()
        })
    }
  }, [wedding, patch])

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return
    try {
      window.localStorage.setItem(NAME_KEY, name)
    } catch {
      // not remembered; fine
    }
    const items: QueueItem[] = Array.from(list).map((file) => {
      const problem = albumService.validate(file)
      return {
        key: crypto.randomUUID(),
        file,
        status: problem ? 'failed' : 'waiting',
        error: problem ?? undefined,
      }
    })
    queueRef.current = [...queueRef.current, ...items]
    setQueue(queueRef.current)
    pump()
  }

  function retry(key: string) {
    queueRef.current = queueRef.current.map((q) => (q.key === key ? { ...q, status: 'waiting' as Status, error: undefined } : q))
    setQueue(queueRef.current)
    pump()
  }

  const doneCount = queue.filter((q) => q.status === 'done').length
  const activeCount = queue.filter((q) => q.status === 'waiting' || q.status === 'uploading').length

  // Refresh the grid once a batch finishes.
  const wasActive = useRef(false)
  useEffect(() => {
    if (activeCount > 0) {
      wasActive.current = true
      return
    }
    if (wasActive.current && wedding) {
      wasActive.current = false
      albumService.list(wedding.id, 60).then(setPhotos).catch(() => undefined)
      setMine(albumService.mine())
    }
  }, [activeCount, wedding])

  async function removeMine(photo: AlbumPhoto) {
    if (!window.confirm('Remove this photo from the album? This cannot be undone.')) return
    setRemoving(true)
    setRemoveError(null)
    try {
      await albumService.removeOwn(photo)
      setPhotos((cur) => cur.filter((p) => p.id !== photo.id))
      setMine(albumService.mine())
      setViewing(null)
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : 'Could not remove the photo.')
    } finally {
      setRemoving(false)
    }
  }

  // Warn before leaving mid-upload.
  useEffect(() => {
    if (activeCount === 0) return
    function warn(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [activeCount])

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <header className="flex justify-center px-4 pt-8">
        <Logo />
      </header>

      <main className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-10">
        {state === 'loading' && (
          <p className="flex items-center justify-center gap-2 py-20 text-sm text-ink-soft">
            <Loader2 className="size-4 animate-spin" /> Opening the album&hellip;
          </p>
        )}

        {state === 'missing' && (
          <div className="py-20 text-center">
            <h1 className="font-display text-3xl text-wine">Album not found</h1>
            <p className="mt-2 text-sm text-ink-soft">Check the link or scan the QR code again.</p>
          </div>
        )}

        {state === 'closed' && (
          <div className="py-20 text-center">
            <h1 className="font-display text-3xl text-wine">This album is closed</h1>
            <p className="mt-2 text-sm text-ink-soft">Photos can no longer be added here. Thank you for celebrating with us.</p>
          </div>
        )}

        {state === 'early' && (
          <div className="py-20 text-center">
            <p className="text-sm text-ink-soft">Shared album for</p>
            <h1 className="mt-1 font-display text-4xl text-wine">{title}</h1>
            <p className="mx-auto mt-4 max-w-sm text-base text-ink">
              The event is still ahead. The album opens on {opensOn ? prettyOpenDate(opensOn) : 'the day of the event'}.
            </p>
            <p className="mt-2 text-sm text-ink-soft">Please come back then to add your photos.</p>
          </div>
        )}

        {state === 'open' && (
          <>
            <div className="text-center">
              <p className="text-sm text-ink-soft">Shared album for</p>
              <h1 className="mt-1 font-display text-4xl text-wine">{title}</h1>
              <p className="mt-3 text-sm text-ink-soft">
                Add the photos you took. They go straight to the hosts, in full quality. No app, no sign-up.
              </p>
            </div>

            <div className="flex flex-col gap-4 rounded-md border border-ink/10 bg-white p-5">
              <label className="flex flex-col gap-1 text-sm text-ink-soft">
                Your name (optional)
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 60))}
                  placeholder="So the hosts know who took them"
                  className="rounded-xs border border-ink/15 bg-white px-3 py-2.5 text-base text-ink outline-none focus:border-wine"
                />
              </label>

              <label className="block">
                <span className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-wine px-6 py-4 text-base font-medium text-ivory transition-colors hover:bg-wine-soft">
                  <Camera className="size-5" /> Add photos
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    addFiles(e.target.files)
                    e.target.value = ''
                  }}
                />
              </label>

              {activeCount > 0 && (
                <p role="status" className="flex items-center gap-2 text-sm text-ink-soft">
                  <Loader2 className="size-4 animate-spin text-wine" />
                  Uploading {activeCount} {activeCount === 1 ? 'photo' : 'photos'}. Please keep this page open.
                </p>
              )}
              {activeCount === 0 && doneCount > 0 && (
                <p role="status" className="flex items-center gap-2 text-sm text-success">
                  <Check className="size-4" /> {doneCount} {doneCount === 1 ? 'photo' : 'photos'} added. Thank you! Added one by mistake? Tap it below to remove it.
                </p>
              )}

              {queue.some((q) => q.status !== 'done') && (
                <ul className="flex flex-col gap-2">
                  {queue
                    .filter((q) => q.status !== 'done')
                    .map((q) => (
                      <li key={q.key} className="flex items-center gap-3 text-sm">
                        <span className="min-w-0 flex-1 truncate text-ink">{q.file.name}</span>
                        {q.status === 'failed' ? (
                          <button
                            type="button"
                            onClick={() => retry(q.key)}
                            className="flex shrink-0 items-center gap-1 text-danger"
                            title={q.error}
                          >
                            <RotateCw className="size-3.5" /> Try again
                          </button>
                        ) : (
                          <span className="shrink-0 text-ink-soft">{q.status === 'uploading' ? 'Uploading…' : 'Waiting'}</span>
                        )}
                      </li>
                    ))}
                </ul>
              )}
              {queue.filter((q) => q.status === 'failed' && q.error).slice(0, 1).map((q) => (
                <p key="err" className="text-xs text-danger">{q.error}</p>
              ))}
            </div>

            {photos.length > 0 && (
              <section>
                <h2 className="mb-1 font-display text-xl text-wine">The album so far</h2>
                {mine.size > 0 && <p className="mb-3 text-xs text-ink-soft">Photos marked &ldquo;Yours&rdquo; can be removed by you. Tap one to open it.</p>}
                <div className="grid grid-cols-3 gap-1.5">
                  {photos.map((p) => (
                    <button key={p.id} type="button" onClick={() => { setRemoveError(null); setViewing(p) }} className="relative aspect-square overflow-hidden rounded-xs bg-ivory-deep">
                      <img src={p.thumbUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                      {mine.has(p.id) && (
                        <span className="absolute bottom-1 left-1 rounded-full bg-wine px-2 py-0.5 text-[10px] font-medium text-ivory">Yours</span>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {viewing && (
        <div
          role="dialog"
          aria-label="Photo"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-ink/90 p-4"
          onClick={() => setViewing(null)}
        >
          <img src={viewing.url} alt="" className="max-h-[80vh] max-w-full rounded-sm object-contain" />
          {removeError && <p className="max-w-sm text-center text-sm text-white">{removeError}</p>}
          <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
            {mine.has(viewing.id) && (
              <Button variant="danger" size="sm" disabled={removing} icon={<Trash2 className="size-4" />} onClick={() => removeMine(viewing)}>
                {removing ? 'Removing…' : 'Remove my photo'}
              </Button>
            )}
            <Button variant="light" size="sm" onClick={() => setViewing(null)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  )
}
