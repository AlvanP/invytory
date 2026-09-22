import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, Copy, Check, ExternalLink, LayoutDashboard } from 'lucide-react'
import type { WeddingInvitation, Wedding } from '@/types'
import { invitationService } from '@/services/invitationService'
import { weddingService } from '@/services/weddingService'
import { getPlanById } from '@/data/pricingPlans'
import { getQrCodeUrl } from '@/utils/qrCode'
import { formatDate } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { InvitationPreviewSkeleton } from '@/components/ui/Skeleton'

type ResultState =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'wedding'; wedding: Wedding; ceremonies: WeddingInvitation[] }
  | { status: 'legacy'; invitation: WeddingInvitation }

export function PublishSuccessPage() {
  const { slug } = useParams<{ slug: string }>()
  const [result, setResult] = useState<ResultState>({ status: 'loading' })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!slug) return
    let cancelled = false

    async function load() {
      const weddingResult = await weddingService.getBySlugWithCeremonies(slug!)
      if (cancelled) return
      if (weddingResult) {
        setResult({ status: 'wedding', wedding: weddingResult.wedding, ceremonies: weddingResult.ceremonies })
        return
      }
      const legacy = await invitationService.getBySlug(slug!)
      if (cancelled) return
      setResult(legacy ? { status: 'legacy', invitation: legacy } : { status: 'notFound' })
    }

    load()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (result.status === 'loading') return <InvitationPreviewSkeleton />
  if (result.status === 'notFound') return null

  const resolvedSlug = result.status === 'wedding' ? result.wedding.slug : result.invitation.slug
  const brideName = result.status === 'wedding' ? result.ceremonies[0]?.brideName : result.invitation.brideName
  const groomName = result.status === 'wedding' ? result.ceremonies[0]?.groomName : result.invitation.groomName
  const planId = result.status === 'wedding' ? result.wedding.plan : result.invitation.plan
  const createdAt = result.status === 'wedding' ? result.wedding.createdAt : result.invitation.createdAt
  const ceremonyCount = result.status === 'wedding' ? result.ceremonies.length : 1

  const url = `${window.location.origin}/invitation/${resolvedSlug}`
  const plan = planId ? getPlanById(planId) : undefined

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
        {brideName} &amp; {groomName}'s invitation is live and ready to share
        {ceremonyCount > 1 ? ` — all ${ceremonyCount} ceremonies included` : ''}.
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

      <img
        src={getQrCodeUrl(url, 160)}
        alt={`QR code linking to ${url}`}
        width={120}
        height={120}
        className="mt-6 rounded-sm border border-ink/10"
      />

      <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
        <Link to="/dashboard" className="flex-1">
          <Button variant="outline" className="w-full" icon={<LayoutDashboard className="size-4" />}>
            Go to Dashboard
          </Button>
        </Link>
        <Link to={`/invitation/${resolvedSlug}`} className="flex-1">
          <Button className="w-full" icon={<ExternalLink className="size-4" />}>
            View Invitation
          </Button>
        </Link>
      </div>

      <p className="mt-8 text-xs text-ink-soft/60">
        Created {formatDate(createdAt.slice(0, 10))}
      </p>
    </div>
  )
}