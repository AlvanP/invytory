import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, PartyPopper, Smartphone, Monitor, Mail } from 'lucide-react'
import { useWizard } from '@/hooks/useWizard'
import { useAuth } from '@/hooks/useAuth'
import { templateService } from '@/services/templateService'
import { invitationService } from '@/services/invitationService'
import { authService } from '@/services/authService'
import type { InvitationTemplate } from '@/types'
import { draftToPreviewInvitation } from '@/utils/draftToPreviewInvitation'
import { InvitationRenderer } from '@/components/invitation/InvitationRenderer'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/cn'

type PublishStage = 'idle' | 'signIn' | 'linkSent' | 'paying' | 'published'

export function StepPreview() {
  const { draft, reset } = useWizard()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [template, setTemplate] = useState<InvitationTemplate | undefined>()
  const [device, setDevice] = useState<'desktop' | 'mobile'>('mobile')
  const [stage, setStage] = useState<PublishStage>('idle')
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [wantsToPublish, setWantsToPublish] = useState(false)

  useEffect(() => {
    if (draft.templateId) templateService.getById(draft.templateId).then(setTemplate)
  }, [draft.templateId])

  const previewInvitation = draftToPreviewInvitation(draft)

  // If the guest signs in on another tab (via the magic-link email)
  // while this tab is showing "check your email," pick right back up
  // and continue publishing — the draft never left memory.
  useEffect(() => {
    if (user && wantsToPublish && stage === 'linkSent') {
      runPublish(user.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, wantsToPublish, stage])

  function handlePublishClick() {
    setWantsToPublish(true)
    if (user) {
      runPublish(user.id)
    } else {
      setStage('signIn')
    }
  }

  async function handleSendLink(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    await authService.signInWithMagicLink(email.trim())
    setStage('linkSent')
  }

  async function runPublish(ownerId: string) {
    setStage('paying')
    // Simulated payment step — replace with real Paystack flow later.
    await new Promise((r) => setTimeout(r, 1400))
    const published = await invitationService.publish(draft, ownerId)
    setPublishedSlug(published.slug)
    setStage('published')
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs tracking-[0.2em] text-gold">Step 7 of 7</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Preview your invitation</h1>
        </div>
        <div className="flex items-center gap-1 rounded-xs border border-ink/15 p-1">
          <button
            onClick={() => setDevice('mobile')}
            className={cn('flex items-center gap-1.5 rounded-xs px-3 py-1.5 text-xs', device === 'mobile' ? 'bg-ink text-ivory' : 'text-ink-soft')}
          >
            <Smartphone className="size-3.5" /> Mobile
          </button>
          <button
            onClick={() => setDevice('desktop')}
            className={cn('flex items-center gap-1.5 rounded-xs px-3 py-1.5 text-xs', device === 'desktop' ? 'bg-ink text-ivory' : 'text-ink-soft')}
          >
            <Monitor className="size-3.5" /> Desktop
          </button>
        </div>
      </div>

      <div className="flex justify-center rounded-md bg-ivory-deep p-4 sm:p-10">
        <div
          className={cn(
            'overflow-hidden rounded-md bg-ivory shadow-lift transition-all duration-300',
            device === 'mobile' ? 'w-full max-w-sm' : 'w-full'
          )}
        >
          <div className="max-h-[70vh] overflow-y-auto">
            <InvitationRenderer invitation={previewInvitation} template={template} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-ink/10 pt-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/create/options')}>Back</Button>
        <Button size="sm" icon={<CreditCard className="size-4" />} onClick={handlePublishClick}>
          Publish Invitation
        </Button>
      </div>

      <Modal
        isOpen={stage !== 'idle'}
        onClose={() => { if (stage === 'signIn' || stage === 'linkSent') setStage('idle') }}
        title={
          stage === 'signIn' ? 'Sign in to publish'
          : stage === 'linkSent' ? 'Check your email'
          : stage === 'paying' ? 'Processing payment'
          : 'Published'
        }
      >
        {stage === 'signIn' && (
          <form onSubmit={handleSendLink} className="flex flex-col gap-4">
            <p className="text-sm text-ink-soft">
              Your invitation is ready. Sign in with your email to publish it and save it to your dashboard.
            </p>
            <Input
              type="email"
              label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Button type="submit" icon={<Mail className="size-4" />}>Send Sign-In Link</Button>
          </form>
        )}

        {stage === 'linkSent' && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <Mail className="size-8 text-gold" strokeWidth={1.5} />
            <p className="text-sm text-ink-soft">
              We sent a link to <span className="text-ink">{email}</span>. Open it to sign in —
              this page will pick up right where you left off and publish automatically.
            </p>
          </div>
        )}

        {stage === 'paying' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="size-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            <p className="text-sm text-ink-soft">Simulating payment&hellip; no card will be charged.</p>
          </div>
        )}
        {stage === 'published' && publishedSlug && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <PartyPopper className="size-8 text-gold" strokeWidth={1.5} />
            <p className="text-sm text-ink-soft">
              Your invitation is live at <br />
              <span className="text-ink">/invitation/{publishedSlug}</span>
            </p>
            <div className="flex w-full gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => { reset(); navigate('/dashboard') }}
              >
                Go to Dashboard
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => { reset(); navigate(`/invitation/${publishedSlug}`) }}
              >
                View Invitation
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}