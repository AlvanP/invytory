import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarClock, Download, ImagePlus, Loader2, Mail, RefreshCw, Share2 } from 'lucide-react'
import type { WeddingInvitation } from '@/types'
import { invitationService } from '@/services/invitationService'
import { weddingService } from '@/services/weddingService'
import { albumService, type AlbumPhoto } from '@/services/albumService'
import { getDesign } from '@/templates/designs'
import { albumHasOpened, earliestEventDate, prettyOpenDate } from '@/utils/albumDate'
import { namesTitle } from '@/utils/format'
import {
  CARD_DESIGNS,
  KICKERS,
  cardToFile,
  drawCard,
  loadCardFonts,
  loadCardImage,
  messageCount,
  messageFor,
  type CardContent,
  type CardDesignId,
} from '@/utils/thankYouCards'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/State'
import { InvitationPreviewSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'

const PRESET_COLOURS = ['#B0587A', '#B08D57', '#2F5D50', '#1F3A6B', '#6B2F3A', '#7C68A8', '#C2701B', '#3A3A3A']

interface PhotoChoice {
  key: string
  url: string
  label: string
}

/** A small live picture of one design. */
function Thumb({ design, content, active, onPick }: { design: (typeof CARD_DESIGNS)[number]; content: CardContent | null; active: boolean; onPick: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!content || !ref.current) return
    drawCard(ref.current, design.id, content, 0.22)
  }, [content, design.id])
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn('flex flex-col gap-1.5 rounded-sm border p-1.5 text-left transition', active ? 'border-wine ring-2 ring-wine/25' : 'border-ink/10 hover:border-ink/30')}
    >
      <canvas ref={ref} className="h-auto w-full rounded-xs bg-ink/5" style={{ aspectRatio: '4 / 5' }} />
      <span className="px-0.5 text-xs font-medium text-ink">{design.name}</span>
    </button>
  )
}

export function DashboardThankYouPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const [invitation, setInvitation] = useState<WeddingInvitation | null | undefined>(undefined)
  const [ceremonies, setCeremonies] = useState<WeddingInvitation[]>([])
  const [info, setInfo] = useState<{ slug: string | null; plan: string | null; status: string } | null | undefined>(undefined)
  const [albumPhotos, setAlbumPhotos] = useState<AlbumPhoto[]>([])
  const [showAlbum, setShowAlbum] = useState(false)

  const [design, setDesign] = useState<CardDesignId>('overlay')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploads, setUploads] = useState<PhotoChoice[]>([])
  const [colour, setColour] = useState('#B0587A')
  const [message, setMessage] = useState('')
  const [messageIndex, setMessageIndex] = useState(0)
  const [from, setFrom] = useState('')
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [fontsReady, setFontsReady] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const main = useRef<HTMLCanvasElement>(null)
  const seeded = useRef(false)

  useEffect(() => {
    if (!eventId) return
    invitationService.getById(eventId).then((found) => setInvitation(found ?? null))
  }, [eventId])

  const weddingId = invitation?.weddingId
  useEffect(() => {
    if (!weddingId) {
      if (invitation) setInfo(null)
      return
    }
    weddingService.getAlbumInfo(weddingId).then(setInfo)
    weddingService.getCeremoniesById(weddingId).then(setCeremonies).catch(() => setCeremonies([]))
  }, [weddingId, invitation])

  const plan = info?.plan ?? invitation?.plan ?? null
  const isSignature = plan === 'gold'
  const dates = (ceremonies.length ? ceremonies : invitation ? [invitation] : []).map((c) => c.weddingDate)
  const eventDay = earliestEventDate(dates)
  const open = albumHasOpened(eventDay)
  const ready = !!invitation && isSignature && open

  useEffect(() => {
    if (ready && isSignature && weddingId) albumService.list(weddingId, 40).then(setAlbumPhotos).catch(() => setAlbumPhotos([]))
  }, [ready, isSignature, weddingId])

  // Start with this invitation's own colour, cover photo and wording.
  useEffect(() => {
    if (!invitation || seeded.current) return
    seeded.current = true
    setColour(invitation.themeColor?.split(',')[0]?.trim() || getDesign(invitation.templateId).colour)
    setPhotoUrl(invitation.heroImage ?? invitation.galleryImages?.find((g) => g.url)?.url ?? null)
    setMessage(messageFor(invitation.eventType, 0))
    setFrom(invitation.eventType === 'wedding' ? namesTitle(invitation.brideName, invitation.groomName) : invitation.eventType === 'funeral' ? `The family of ${invitation.brideName}` : invitation.brideName)
  }, [invitation])

  useEffect(() => {
    if (!ready) return
    loadCardFonts().then(() => setFontsReady(true))
  }, [ready])

  // The photos the host can pick from: the invitation's own, then the other ceremonies', then uploads.
  const choices = useMemo<PhotoChoice[]>(() => {
    const out: PhotoChoice[] = []
    const seen = new Set<string>()
    const add = (url: string | null | undefined, label: string) => {
      if (url && !seen.has(url)) {
        seen.add(url)
        out.push({ key: url, url, label })
      }
    }
    const all = ceremonies.length ? ceremonies : invitation ? [invitation] : []
    const first = all.find((c) => c.id === invitation?.id) ?? all[0]
    if (first) {
      add(first.heroImage, 'Cover photo')
      first.galleryImages?.forEach((g, i) => add(g.url, `Photo ${i + 2}`))
    }
    for (const c of all) {
      if (c.id === first?.id) continue
      add(c.heroImage, 'Cover photo')
      c.galleryImages?.forEach((g, i) => add(g.url, `Photo ${i + 2}`))
    }
    uploads.forEach((u) => add(u.url, u.label))
    return out
  }, [ceremonies, invitation, uploads])

  useEffect(() => {
    if (!photoUrl) {
      setImage(null)
      return
    }
    let cancelled = false
    setImageError(null)
    loadCardImage(photoUrl)
      .then((img) => {
        if (!cancelled) setImage(img)
      })
      .catch((err: unknown) => {
        if (!cancelled) setImageError(err instanceof Error ? err.message : 'That photo could not be loaded.')
      })
    return () => {
      cancelled = true
    }
  }, [photoUrl])

  const kind = invitation?.eventType ?? 'wedding'
  const content: CardContent | null = useMemo(
    () => (image && fontsReady ? { image, kicker: KICKERS[kind], message: message.trim() || messageFor(kind, 0), from: from.trim() || ' ', colour } : null),
    [image, fontsReady, kind, message, from, colour]
  )

  // Redraw the big preview, a moment after the last change.
  useEffect(() => {
    if (!content || !main.current) return
    const t = window.setTimeout(() => {
      if (main.current) drawCard(main.current, design, content, 0.62)
    }, 80)
    return () => window.clearTimeout(t)
  }, [content, design])

  if (invitation === undefined || (invitation?.weddingId && info === undefined)) return <InvitationPreviewSkeleton />
  if (invitation === null) {
    return <ErrorState title="Invitation not found" description="It may have been removed, or the link may be incorrect." />
  }

  const title = namesTitle(invitation.brideName, invitation.groomName)
  const fileName = `thank-you-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'card'}.jpg`
  const shareText = `${message.trim()}\n\n${from.trim()}`

  function pickUpload(file: File | undefined) {
    if (!file) return
    const url = URL.createObjectURL(file)
    setUploads((u) => [...u, { key: url, url, label: 'From your device' }])
    setPhotoUrl(url)
  }

  async function makeFile(): Promise<File | null> {
    if (!content) return null
    return cardToFile(design, content, fileName)
  }

  function saveFile(file: File) {
    const href = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = href
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.setTimeout(() => URL.revokeObjectURL(href), 10_000)
  }

  async function download() {
    setBusy(true)
    setStatus(null)
    try {
      const file = await makeFile()
      if (file) {
        saveFile(file)
        setStatus('Saved. Look in your Downloads or Photos.')
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not save the picture.')
    } finally {
      setBusy(false)
    }
  }

  /** Opens the phone's share menu with the card attached. Where that is not possible, saves it and opens WhatsApp or email. */
  async function share(via: 'whatsapp' | 'email') {
    setBusy(true)
    setStatus(null)
    try {
      const file = await makeFile()
      if (!file) return
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
      if (nav.share && nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({ files: [file], title: 'Thank you', text: shareText })
        } catch (err) {
          if (!(err instanceof DOMException && err.name === 'AbortError')) throw err
        }
        return
      }
      saveFile(file)
      if (via === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener')
        setStatus('The card is saved. In WhatsApp, open a chat, tap the attach (+) button, choose Gallery and pick the card.')
      } else {
        window.location.href = `mailto:?subject=${encodeURIComponent('Thank you')}&body=${encodeURIComponent(shareText)}`
        setStatus('The card is saved. Attach it to the email that just opened.')
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not share the card.')
    } finally {
      setBusy(false)
    }
  }

  const field = 'w-full rounded-xs border border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none'
  const allChoices: PhotoChoice[] = showAlbum ? [...choices, ...albumPhotos.map((p) => ({ key: p.id, url: p.url, label: 'Guest album' }))] : choices

  return (
    <div className="max-w-5xl">
      <Link to="/dashboard/events" className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" /> Back to my events
      </Link>
      <p className="mt-4 text-xs tracking-[0.2em] text-gold">After the event</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Thank-you cards</h1>
      <p className="mt-1 text-sm text-ink-soft">{title}</p>

      {!isSignature ? (
        <Card className="mt-8 p-6">
          <h2 className="font-display text-xl text-ink">Thank-you cards are part of the Signature plan</h2>
          <p className="mt-2 text-sm text-ink-soft">
            After your event, make a beautiful thank-you card from your own photos, choose from eight designs, and send it to your guests on WhatsApp or email as a picture.
          </p>
        </Card>
      ) : !open && eventDay ? (
        <Card className="mt-8 flex flex-col gap-3 p-6 sm:flex-row sm:items-center">
          <CalendarClock className="size-10 shrink-0 text-gold" />
          <div>
            <h2 className="font-display text-xl text-ink">Opens on your event day</h2>
            <p className="mt-1 text-sm text-ink-soft">
              You can make and send your thank-you cards from <b>{prettyOpenDate(eventDay)}</b>. Come back then, and we will turn your invitation photo into a card in a few taps.
            </p>
          </div>
        </Card>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
          {/* The card */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-sm border border-ink/10 bg-ink/5 shadow-md">
              {content ? (
                <canvas ref={main} className="block h-auto w-full" style={{ aspectRatio: '4 / 5' }} />
              ) : (
                <div className="grid place-items-center text-sm text-ink-soft" style={{ aspectRatio: '4 / 5' }}>
                  {imageError ? <span className="px-6 text-center text-danger">{imageError} Choose another photo.</span> : <Loader2 className="size-6 animate-spin" />}
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Button icon={<Share2 className="size-4" />} onClick={() => share('whatsapp')} disabled={!content || busy} isLoading={busy}>
                Share on WhatsApp
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" icon={<Mail className="size-4" />} onClick={() => share('email')} disabled={!content || busy}>
                  Email
                </Button>
                <Button variant="outline" size="sm" icon={<Download className="size-4" />} onClick={download} disabled={!content || busy}>
                  Save JPG
                </Button>
              </div>
              <p className="text-xs leading-relaxed text-ink-soft">
                On your phone this opens your share menu with the card attached. Choose WhatsApp, then tick the contacts you want. WhatsApp often limits how many chats you can pick at once, so for a long list send it to a Broadcast list.
              </p>
              {status && <p className="rounded-xs bg-gold/10 px-3 py-2 text-xs text-ink">{status}</p>}
            </div>
          </div>

          {/* The choices */}
          <div className="flex flex-col gap-8">
            <section>
              <h2 className="font-display text-lg text-ink">1. Choose the photo</h2>
              <p className="mt-1 text-sm text-ink-soft">We start with your invitation&rsquo;s cover photo. Tap another one, or add any picture from your phone.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {allChoices.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setPhotoUrl(c.url)}
                    title={c.label}
                    className={cn('relative size-20 overflow-hidden rounded-xs border-2', photoUrl === c.url ? 'border-wine' : 'border-transparent hover:border-ink/30')}
                  >
                    <img src={c.url} alt={c.label} loading="lazy" className="size-full object-cover" />
                  </button>
                ))}
                <label className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xs border-2 border-dashed border-ink/25 text-center text-[11px] text-ink-soft hover:border-ink/50">
                  <ImagePlus className="size-5" />
                  From my phone
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => pickUpload(e.target.files?.[0])} />
                </label>
              </div>
              {albumPhotos.length > 0 && (
                <button type="button" onClick={() => setShowAlbum((v) => !v)} className="mt-3 text-sm text-gold-deep underline underline-offset-2">
                  {showAlbum ? 'Hide guest album photos' : 'Choose from the guest album'}
                </button>
              )}
            </section>

            <section>
              <h2 className="font-display text-lg text-ink">2. Choose a design</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {CARD_DESIGNS.map((d) => (
                  <Thumb key={d.id} design={d} content={content} active={design === d.id} onPick={() => setDesign(d.id)} />
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="font-display text-lg text-ink">3. Write your thanks</h2>
              <label className="flex flex-col gap-1 text-sm text-ink-soft">
                Message
                <textarea className={field} rows={4} maxLength={300} value={message} onChange={(e) => setMessage(e.target.value)} />
              </label>
              <button
                type="button"
                onClick={() => {
                  const next = (messageIndex + 1) % messageCount(kind)
                  setMessageIndex(next)
                  setMessage(messageFor(kind, next))
                }}
                className="inline-flex items-center gap-1.5 self-start text-sm text-gold-deep underline underline-offset-2"
              >
                <RefreshCw className="size-4" /> Try another wording
              </button>
              <label className="flex flex-col gap-1 text-sm text-ink-soft">
                From
                <input className={field} maxLength={60} value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <div>
                <p className="text-sm text-ink-soft">Colour</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {[invitation.themeColor?.split(',')[0]?.trim() || getDesign(invitation.templateId).colour, ...PRESET_COLOURS]
                    .filter((c, i, a) => a.indexOf(c) === i)
                    .map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColour(c)}
                        aria-label={`Use ${c}`}
                        className={cn('size-8 rounded-full border-2', colour.toLowerCase() === c.toLowerCase() ? 'border-ink' : 'border-white shadow')}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  <input type="color" aria-label="Pick any colour" value={colour} onChange={(e) => setColour(e.target.value)} className="size-8 cursor-pointer rounded-full border border-ink/20 bg-transparent p-0.5" />
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
