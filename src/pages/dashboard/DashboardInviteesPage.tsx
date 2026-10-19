import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Copy, Download, MessageCircle, Plus, Trash2 } from 'lucide-react'
import type { WeddingInvitation } from '@/types'
import { invitationService } from '@/services/invitationService'
import { weddingService } from '@/services/weddingService'
import { inviteeService, inviteUrl, type InviteLink } from '@/services/inviteeService'
import { namesTitle } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState, ErrorState } from '@/components/ui/State'
import { InvitationPreviewSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'

function whatsappLink(name: string, title: string, url: string): string {
  const text = `Dear ${name}, you are specially invited to ${title}. Please open your personal invitation here: ${url}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

export function DashboardInviteesPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const [invitation, setInvitation] = useState<WeddingInvitation | null | undefined>(undefined)
  const [links, setLinks] = useState<InviteLink[] | null>(null)
  const [answers, setAnswers] = useState<Record<string, 'confirmed' | 'declined'>>({})
  const [names, setNames] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) return
    invitationService.getById(eventId).then((found) => setInvitation(found ?? null))
  }, [eventId])

  const weddingId = invitation?.weddingId
  // Guests open the wedding's own page, so links use the wedding's address, not a ceremony's.
  const hinted = (useLocation().state as { slug?: string } | null)?.slug ?? null
  const [fetchedSlug, setPageSlug] = useState<string | null>(null)
  const pageSlug = hinted ?? fetchedSlug
  useEffect(() => {
    if (!invitation || hinted) return
    if (!invitation.weddingId) {
      setPageSlug(invitation.slug)
      return
    }
    weddingService.getSlugById(invitation.weddingId).then(setPageSlug)
  }, [invitation, hinted])

  const load = useCallback(async () => {
    if (!weddingId) return
    try {
      const list = await inviteeService.list(weddingId)
      setLinks(list)
      setAnswers(await inviteeService.rsvpByCode(list.map((l) => l.code)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your special guests.')
      setLinks([])
    }
  }, [weddingId])

  useEffect(() => {
    void load()
  }, [load])

  if (invitation === undefined) return <InvitationPreviewSkeleton />
  if (invitation === null) return <ErrorState title="Invitation not found" description="It may have been removed, or the link may be incorrect." />

  const title = namesTitle(invitation.brideName, invitation.groomName)
  const list = links ?? []

  async function create() {
    if (!weddingId) return
    const lines = names.split(/\r?\n|;/)
    setBusy(true)
    setError(null)
    try {
      const added = await inviteeService.add(weddingId, lines)
      if (added.length === 0) setError('Type at least one name first. Use one line for each person.')
      else {
        setNames('')
        await load()
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setError(/invite_links|relation|does not exist/i.test(msg) ? 'Personal links are not switched on yet. Run docs/sql/invitees.sql in Supabase first.' : msg || 'Could not create the links.')
    } finally {
      setBusy(false)
    }
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      // clipboard unavailable
    }
  }

  async function remove(link: InviteLink) {
    if (!window.confirm(`Delete the link for ${link.guestName}? It will stop working.`)) return
    setError(null)
    try {
      await inviteeService.remove(link.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete.')
    }
  }

  function downloadCsv() {
    const rows = [['Name', 'Link', 'Opened', 'RSVP'], ...list.map((l) => [l.guestName, inviteUrl(pageSlug ?? '', l.code), String(l.openedCount), answers[l.code] ?? ''])]
    const blob = new Blob([rows.map((r) => r.map(csvCell).join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `special-guests-${pageSlug ?? 'event'}.csv`
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(a.href), 5000)
  }

  return (
    <div className="max-w-3xl">
      <Link to={`/dashboard/events/${invitation.id}`} className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" /> Back to invitation
      </Link>
      <p className="mt-4 text-xs tracking-[0.2em] text-gold">Special guests</p>
      <h1 className="mt-2 font-display text-3xl text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Type the names of the people you want to honour. Each gets their own link. When they open it, they see
        &ldquo;<span className="italic">their name</span> is specially invited to&hellip;&rdquo; on the invitation. Everyone else can keep using your normal link.
      </p>

      {!weddingId ? (
        <Card className="mt-8 p-6 text-sm text-ink-soft">This invitation was made before personal links existed, so it cannot have them.</Card>
      ) : (
        <>
          <Card className="mt-8 flex flex-col gap-3 p-6">
            <label className="text-sm font-medium text-ink" htmlFor="invitee-names">Names, one on each line</label>
            <textarea
              id="invitee-names"
              value={names}
              onChange={(e) => setNames(e.target.value)}
              rows={5}
              placeholder={'Chief Emeka Okonkwo\nBarr. & Mrs Adeyemi\nPastor Grace Bello'}
              className="rounded-xs border border-ink/15 bg-white p-3 text-sm text-ink outline-none focus:border-wine"
            />
            <div>
              <Button size="sm" icon={<Plus className="size-4" />} isLoading={busy} onClick={create}>Create personal links</Button>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
          </Card>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-soft">{links === null ? 'Loading…' : `${list.length} special ${list.length === 1 ? 'guest' : 'guests'}`}</p>
            {list.length > 0 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={copied === 'all' ? <Check className="size-4" /> : <Copy className="size-4" />}
                  onClick={() => copy(list.map((l) => `${l.guestName}: ${inviteUrl(pageSlug ?? '', l.code)}`).join('\n'), 'all')}
                >
                  Copy all links
                </Button>
                <Button size="sm" variant="outline" icon={<Download className="size-4" />} onClick={downloadCsv}>Download list</Button>
              </div>
            )}
          </div>

          {links && list.length === 0 && !error && (
            <EmptyState title="No special guests yet" description="Add a name above and its link appears here, ready to send." />
          )}

          {!pageSlug && list.length > 0 && (
            <p role="alert" className="mt-4 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
              Working out this invitation&rsquo;s web address. If your links do not appear in a few seconds, go back to My Invitations and open Special guests again.
            </p>
          )}
          <ul className="mt-4 flex flex-col gap-3">
            {pageSlug && list.map((l) => {
              const url = inviteUrl(pageSlug!, l.code)
              const answer = answers[l.code]
              return (
                <li key={l.id} className="rounded-md border border-ink/10 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-xl text-ink">{l.guestName}</p>
                      <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft">
                        <span>{l.openedCount > 0 ? `Opened ${l.openedCount} ${l.openedCount === 1 ? 'time' : 'times'}` : 'Not opened yet'}</span>
                        {answer && (
                          <span className={cn('font-medium', answer === 'confirmed' ? 'text-success' : 'text-danger')}>
                            {answer === 'confirmed' ? 'Coming' : 'Declined'}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <a href={whatsappLink(l.guestName, title, url)} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline" icon={<MessageCircle className="size-4" />}>WhatsApp</Button>
                      </a>
                      <Button size="sm" variant="outline" icon={copied === l.id ? <Check className="size-4" /> : <Copy className="size-4" />} onClick={() => copy(url, l.id)}>
                        {copied === l.id ? 'Copied' : 'Copy link'}
                      </Button>
                      <Button size="sm" variant="ghost" aria-label={`Delete ${l.guestName}`} onClick={() => remove(l)}><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                  <p className="mt-2 truncate text-xs text-ink-soft/70">{url}</p>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
