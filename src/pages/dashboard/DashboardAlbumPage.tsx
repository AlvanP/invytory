import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { zipSync } from 'fflate'
import { ArrowLeft, Check, Copy, Download, Loader2, Printer, Trash2 } from 'lucide-react'
import type { WeddingInvitation } from '@/types'
import { invitationService } from '@/services/invitationService'
import { weddingService } from '@/services/weddingService'
import { albumService, type AlbumPhoto } from '@/services/albumService'
import { namesTitle } from '@/utils/format'
import { getQrCodeUrl } from '@/utils/qrCode'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState, ErrorState } from '@/components/ui/State'
import { InvitationPreviewSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'

const ZIP_PART_SIZE = 40

function fileNameFor(photo: AlbumPhoto, index: number): string {
  const ext = photo.path.split('.').pop() || 'jpg'
  const who = (photo.uploaderName ?? 'guest').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'guest'
  return `${String(index + 1).padStart(3, '0')}-${who}.${ext}`
}

function saveBlob(blob: Blob, fileName: string) {
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(href), 10_000)
}

async function fetchBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Could not download a photo (${res.status}).`)
  return new Uint8Array(await res.arrayBuffer())
}

export function DashboardAlbumPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const [invitation, setInvitation] = useState<WeddingInvitation | null | undefined>(undefined)
  const [photos, setPhotos] = useState<AlbumPhoto[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!eventId) return
    invitationService.getById(eventId).then((found) => setInvitation(found ?? null))
  }, [eventId])

  const weddingId = invitation?.weddingId
  const hinted = (useLocation().state as { slug?: string } | null)?.slug ?? null
  // The plan is saved on the event itself (not on each ceremony), so it is read from there.
  const [info, setInfo] = useState<{ slug: string | null; plan: string | null; status: string } | null | undefined>(undefined)
  useEffect(() => {
    if (!weddingId) return
    weddingService.getAlbumInfo(weddingId).then(setInfo)
  }, [weddingId])
  const pageSlug = info?.slug ?? hinted
  const hasAlbum = info?.plan === 'gold' && !!weddingId

  const load = useCallback(async () => {
    if (!weddingId) return
    try {
      setPhotos(await albumService.list(weddingId, 500))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the album.')
      setPhotos([])
    }
  }, [weddingId])

  useEffect(() => {
    if (hasAlbum) void load()
  }, [hasAlbum, load])

  if (invitation === undefined || (invitation?.weddingId && info === undefined)) return <InvitationPreviewSkeleton />
  if (invitation === null) {
    return <ErrorState title="Invitation not found" description="It may have been removed, or the link may be incorrect." />
  }

  const title = namesTitle(invitation.brideName, invitation.groomName)
  const albumUrl = `${window.location.origin}/album/${pageSlug ?? invitation.slug ?? ''}`
  const qrUrl = getQrCodeUrl(albumUrl, 320)
  const list = photos ?? []
  const toDownload = selected.size > 0 ? list.filter((p) => selected.has(p.id)) : list

  function toggle(id: string) {
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(albumUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable
    }
  }

  async function downloadOne(photo: AlbumPhoto) {
    setBusy('Downloading…')
    setError(null)
    try {
      const bytes = await fetchBytes(photo.url)
      saveBlob(new Blob([bytes.buffer as ArrayBuffer]), fileNameFor(photo, list.indexOf(photo)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed.')
    } finally {
      setBusy(null)
    }
  }

  async function downloadMany() {
    setError(null)
    const parts = Math.ceil(toDownload.length / ZIP_PART_SIZE)
    try {
      for (let part = 0; part < parts; part++) {
        const chunk = toDownload.slice(part * ZIP_PART_SIZE, (part + 1) * ZIP_PART_SIZE)
        const files: Record<string, Uint8Array> = {}
        for (let i = 0; i < chunk.length; i++) {
          setBusy(`Preparing part ${part + 1} of ${parts}: photo ${i + 1} of ${chunk.length}`)
          files[fileNameFor(chunk[i], part * ZIP_PART_SIZE + i)] = await fetchBytes(chunk[i].url)
        }
        // level 0: photos are already compressed, so just bundle them.
        const zipped = zipSync(files, { level: 0 })
        saveBlob(new Blob([zipped.buffer as ArrayBuffer], { type: 'application/zip' }), `${title.replace(/[^a-z0-9]+/gi, '-')}-album-part-${part + 1}.zip`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed.')
    } finally {
      setBusy(null)
    }
  }

  async function deleteSelected(only?: AlbumPhoto) {
    const targets = only ? [only] : list.filter((p) => selected.has(p.id))
    if (targets.length === 0) return
    if (!window.confirm(`Delete ${targets.length} ${targets.length === 1 ? 'photo' : 'photos'} for good? This cannot be undone.`)) return
    setBusy('Deleting…')
    setError(null)
    try {
      for (const photo of targets) await albumService.remove(photo)
      setSelected((cur) => {
        const next = new Set(cur)
        for (const t of targets) next.delete(t.id)
        return next
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="max-w-4xl">
      <Link to={`/dashboard/events/${invitation.id}`} className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink print:hidden">
        <ArrowLeft className="size-4" /> Back to invitation
      </Link>
      <p className="mt-4 text-xs tracking-[0.2em] text-gold print:hidden">Guest photo album</p>
      <h1 className="mt-2 font-display text-3xl text-ink print:hidden">{title}</h1>

      {!hasAlbum ? (
        <Card className="mt-8 p-6 print:hidden">
          <h2 className="font-display text-xl text-ink">The photo album is part of the Signature plan</h2>
          <p className="mt-2 text-sm text-ink-soft">
            {weddingId
              ? 'Your guests scan one QR code and add every photo they take, with nothing to install. You download them all in full quality.'
              : 'This invitation was made before shared albums existed, so it cannot have one.'}
          </p>
        </Card>
      ) : (
        <>
          <Card className="mt-8 flex flex-col gap-5 p-6 sm:flex-row print:hidden">
            <img src={qrUrl} alt="QR code for the guest album" width={160} height={160} className="size-40 shrink-0 rounded-sm border border-ink/10" />
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <h2 className="font-display text-xl text-ink">Share the album with guests</h2>
              <p className="text-sm text-ink-soft">Print the QR code on table cards, or send the link. Guests tap once and add photos, no app and no sign-up.</p>
              <div className="flex items-center gap-2 rounded-xs border border-ink/15 bg-white px-3 py-2">
                <span className="flex-1 truncate text-sm text-ink-soft">{albumUrl}</span>
                <button onClick={copyLink} aria-label="Copy link" className="rounded-xs p-1.5 text-ink-soft hover:bg-ink/5">
                  {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" icon={<Printer className="size-4" />} onClick={() => window.print()}>Print table card</Button>
                <a href={qrUrl} download={`album-qr-${pageSlug ?? invitation.slug}.png`}>
                  <Button size="sm" variant="outline" icon={<Download className="size-4" />}>Download QR</Button>
                </a>
              </div>
            </div>
          </Card>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <p className="text-sm text-ink-soft">
              {photos === null ? 'Loading…' : `${list.length} ${list.length === 1 ? 'photo' : 'photos'}`}
              {selected.size > 0 && ` · ${selected.size} selected`}
            </p>
            <div className="flex flex-wrap gap-2">
              {list.length > 0 && (
                <Button size="sm" variant="outline" onClick={() => setSelected(selected.size === list.length ? new Set() : new Set(list.map((p) => p.id)))}>
                  {selected.size === list.length ? 'Clear selection' : 'Select all'}
                </Button>
              )}
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => void load()}>Refresh</Button>
              <Button size="sm" disabled={!!busy || toDownload.length === 0} icon={<Download className="size-4" />} onClick={downloadMany}>
                {selected.size > 0 ? 'Download selected' : 'Download all'}
              </Button>
              {selected.size > 0 && (
                <Button size="sm" variant="danger" disabled={!!busy} icon={<Trash2 className="size-4" />} onClick={() => deleteSelected()}>Delete selected</Button>
              )}
            </div>
          </div>

          {busy && (
            <p role="status" className="mt-3 flex items-center gap-2 text-sm text-ink-soft print:hidden">
              <Loader2 className="size-4 animate-spin text-gold" /> {busy}
            </p>
          )}
          {error && <p className="mt-3 text-sm text-danger print:hidden">{error}</p>}

          {photos && list.length === 0 && !error && (
            <div className="print:hidden">
              <EmptyState title="No photos yet" description="When guests add photos on the day, they appear here." />
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 print:hidden">
            {list.map((p) => (
              <div key={p.id} className="group relative aspect-square overflow-hidden rounded-xs bg-ivory-deep">
                <button type="button" onClick={() => toggle(p.id)} className="h-full w-full" aria-label="Select photo" aria-pressed={selected.has(p.id)}>
                  <img src={p.thumbUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
                <span
                  className={cn(
                    'pointer-events-none absolute left-1.5 top-1.5 flex size-5 items-center justify-center rounded-full border border-white bg-ink/30 text-white',
                    selected.has(p.id) && 'border-wine bg-wine'
                  )}
                >
                  {selected.has(p.id) && <Check className="size-3" />}
                </span>
                <button
                  type="button"
                  onClick={() => deleteSelected(p)}
                  disabled={!!busy}
                  aria-label="Delete this photo"
                  className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-danger shadow-sm hover:bg-white disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => downloadOne(p)}
                  disabled={!!busy}
                  aria-label="Download this photo"
                  className="absolute bottom-1.5 right-1.5 rounded-full bg-white/90 p-1.5 text-ink shadow-sm hover:bg-white disabled:opacity-50"
                >
                  <Download className="size-3.5" />
                </button>
                {p.uploaderName && (
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-ink/60 to-transparent px-2 pb-1 pt-4 pr-9 text-[11px] text-white">
                    {p.uploaderName}
                  </span>
                )}
              </div>
            ))}
          </div>

          <style>{`@media print { body * { visibility: hidden !important; } .album-print, .album-print * { visibility: visible !important; } .album-print { position: fixed; inset: 0; } }`}</style>
          <div className="album-print hidden flex-col items-center justify-center gap-6 bg-white p-12 text-center text-wine print:flex">
            <p className="font-brand text-5xl">{title}</p>
            <img src={qrUrl} alt="" width={360} height={360} className="size-[360px]" />
            <p className="font-display text-3xl">Share your photos with us</p>
            <p className="text-lg text-ink">Scan the code and add the photos you take today.</p>
          </div>
        </>
      )}
    </div>
  )
}
