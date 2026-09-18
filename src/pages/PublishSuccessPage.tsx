import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, Copy, Check, ExternalLink, LayoutDashboard } from 'lucide-react'
import type { WeddingInvitation } from '@/types'
import { invitationService } from '@/services/invitationService'
import { getPlanById } from '@/data/pricingPlans'
import { formatDate } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { InvitationPreviewSkeleton } from '@/components/ui/Skeleton'

export function PublishSuccessPage() {
  const { slug } = useParams<{ slug: string }>()
  const [invitation, setInvitation] = useState<WeddingInvitation | null | undefined>(undefined)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!slug) return
    invitationService.getBySlug(slug).then((found) => setInvitation(found ?? null))
  }, [slug])

  if (invitation === undefined) return <InvitationPreviewSkeleton />
  if (invitation === null) return null

  const url = `${window.location.origin}/invitation/${invitation.slug}`
  const plan = invitation.plan ? getPlanById(invitation.plan) : undefined

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be unavailable — not critical, the link is shown as text too.
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center">
      <CheckCircle2 className="size-12 text-success" strokeWidth={1.25} />
      <p className="mt-6 text-xs tracking-[0.2em] text-gold">Payment Successful</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Your invitation is published</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {invitation.brideName} &amp; {invitation.groomName}'s invitation is live and ready to share.
      </p>

      {plan && (
        <div className="mt-4 flex items-center gap-2">
          <Badge tone="premium">{plan.name} Plan</Badge>
          <span className="text-xs text-ink-soft/70">
            Up to {plan.maxGuests.toLocaleString()} guests &middot; hosted for {plan.hostingDays} days
          </span>
        </div>
      )}

      <div className="mt-8 flex w-full items-center gap-2 rounded-xs border border-ink/15 bg-white px-3 py-2.5">
        <span className="flex-1 truncate text-left text-sm text-ink-soft">{url}</span>
        <button onClick={handleCopy} aria-label="Copy link" className="rounded-xs p-1.5 text-ink-soft hover:bg-ink/5">
          {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
        </button>
      </div>

      <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
        <Link to="/dashboard" className="flex-1">
          <Button variant="outline" className="w-full" icon={<LayoutDashboard className="size-4" />}>
            Go to Dashboard
          </Button>
        </Link>
        <Link to={`/invitation/${invitation.slug}`} className="flex-1">
          <Button className="w-full" icon={<ExternalLink className="size-4" />}>
            View Invitation
          </Button>
        </Link>
      </div>

      <p className="mt-8 text-xs text-ink-soft/60">
        Created {formatDate(invitation.createdAt.slice(0, 10))}
      </p>
    </div>
  )
}