import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Check, Copy, Link2, Mail, MessageCircle, Trash2, UserPlus } from 'lucide-react'
import { teamService, joinLink, type TeamInvite, type TeamMember } from '@/services/teamService'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

/**
 * The host's "Team" window for ONE event. Two ways to add someone: type their email (we make a link only
 * they can use and open your email app with it written out), or make a link to send by any app.
 */
export function TeamModal({ weddingId, names, isOpen, onClose }: { weddingId: string; names: string; isOpen: boolean; onClose: () => void }) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invites, setInvites] = useState<TeamInvite[]>([])
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fresh, setFresh] = useState<{ token: string; email: string } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const t = await teamService.list(weddingId)
      setMembers(t.members)
      setInvites(t.invites)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the team.')
    }
  }, [weddingId])

  useEffect(() => {
    if (isOpen) void load()
  }, [isOpen, load])

  const message = (token: string) =>
    `Hello! I'd like you to help me manage the invitation for ${names} on Invytory. Open this private link, sign in with your email and tap Join:\n${joinLink(token)}`

  async function make(withEmail: string) {
    setBusy(true)
    setError(null)
    try {
      const token = await teamService.invite(weddingId, withEmail)
      setFresh({ token, email: withEmail })
      setEmail('')
      await load()
      return token
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not make the invite.')
    } finally {
      setBusy(false)
    }
  }

  async function onEmail(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    const addr = email.trim()
    const token = await make(addr)
    if (token) {
      window.location.href = `mailto:${addr}?subject=${encodeURIComponent(`Help manage our invitation: ${names}`)}&body=${encodeURIComponent(message(token))}`
    }
  }

  async function copy(token: string) {
    try {
      await navigator.clipboard.writeText(joinLink(token))
      setCopied(token)
      setTimeout(() => setCopied(null), 1800)
    } catch {
      window.prompt('Copy this link', joinLink(token))
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite a manager">
      <div className="flex flex-col gap-5">
        <p className="text-sm text-ink-soft">
          Managers see and manage <span className="text-ink">only this invitation</span>: its guests, RSVPs, messages, photo album and
          details. They cannot delete it or change the plan.
        </p>

        <form onSubmit={onEmail} className="flex flex-col gap-2">
          <Input type="email" label="Their email address" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          <Button type="submit" disabled={busy || !email.trim()} icon={<Mail className="size-4" />}>Invite by email</Button>
        </form>

        <div className="flex items-center gap-3 text-xs text-ink-soft"><span className="h-px flex-1 bg-ink/10" />or<span className="h-px flex-1 bg-ink/10" /></div>

        <Button variant="outline" disabled={busy} icon={<Link2 className="size-4" />} onClick={() => void make('')}>
          Make a private link to send
        </Button>

        {fresh && (
          <div className="flex flex-col gap-2 rounded-md border border-gold/50 bg-gold/10 p-3">
            <p className="text-xs text-ink-soft">
              {fresh.email ? `Only ${fresh.email} can use this link.` : 'Anyone with this link can join, once.'} It works for 14 days.
            </p>
            <p className="break-all rounded-xs bg-white px-2 py-1.5 text-xs text-ink">{joinLink(fresh.token)}</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => void copy(fresh.token)} icon={copied === fresh.token ? <Check className="size-4" /> : <Copy className="size-4" />}>
                {copied === fresh.token ? 'Copied' : 'Copy link'}
              </Button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(message(fresh.token))}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xs bg-[#25D366] px-3 py-1.5 text-sm font-medium text-white"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex flex-col gap-2">
          <p className="text-xs tracking-[0.15em] text-ink-soft">ON THIS TEAM</p>
          {members.length === 0 && invites.length === 0 && <p className="text-sm text-ink-soft">Nobody yet.</p>}
          {members.map((m) => (
            <div key={m.userId} className="flex items-center justify-between gap-2 rounded-sm border border-ink/10 px-3 py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-ink"><UserPlus className="size-4 shrink-0 text-gold" /><span className="truncate">{m.email ?? 'Manager'}</span></span>
              <button
                type="button"
                className="text-xs text-danger underline-offset-2 hover:underline"
                onClick={async () => {
                  if (!window.confirm(`Remove ${m.email ?? 'this manager'}? They lose access straight away.`)) return
                  try {
                    await teamService.remove(weddingId, m.userId)
                    await load()
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Could not remove.')
                  }
                }}
              >
                Remove
              </button>
            </div>
          ))}
          {invites.map((v) => (
            <div key={v.token} className="flex items-center justify-between gap-2 rounded-sm border border-dashed border-ink/20 px-3 py-2 text-sm">
              <span className="min-w-0 truncate text-ink-soft">Waiting: {v.email ?? 'link not used yet'}</span>
              <span className="flex shrink-0 items-center gap-3">
                <button type="button" onClick={() => void copy(v.token)} className="text-xs text-ink-soft underline-offset-2 hover:underline">{copied === v.token ? 'Copied' : 'Copy'}</button>
                <button
                  type="button"
                  aria-label="Cancel invite"
                  onClick={async () => {
                    await teamService.revoke(v.token).catch(() => {})
                    await load()
                  }}
                >
                  <Trash2 className="size-4 text-danger" />
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
