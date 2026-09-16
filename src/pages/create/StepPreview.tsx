import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, PartyPopper, Smartphone, Monitor } from 'lucide-react'
import { useWizard } from '@/hooks/useWizard'
import { templateService } from '@/services/templateService'
import { invitationService } from '@/services/invitationService'
import type { InvitationTemplate } from '@/types'
import { draftToPreviewInvitation } from '@/utils/draftToPreviewInvitation'
import { InvitationRenderer } from '@/components/invitation/InvitationRenderer'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/utils/cn'

type PublishStage = 'idle' | 'paying' | 'published'

export function StepPreview() {
  const { draft, reset } = useWizard()
  const navigate = useNavigate()
  const [template, setTemplate] = useState<InvitationTemplate | undefined>()
  const [device, setDevice] = useState<'desktop' | 'mobile'>('mobile')
  const [stage, setStage] = useState<PublishStage>('idle')
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null)

  useEffect(() => {
    if (draft.templateId) templateService.getById(draft.templateId).then(setTemplate)
  }, [draft.templateId])

  const previewInvitation = draftToPreviewInvitation(draft)

  async function handlePublish() {
    setStage('paying')
    // Simulated payment step — replace with real Paystack flow later.
    await new Promise((r) => setTimeout(r, 1400))
    const published = await invitationService.publish(draft)
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
        <Button size="sm" icon={<CreditCard className="size-4" />} onClick={handlePublish}>
          Publish Invitation
        </Button>
      </div>

      <Modal
        isOpen={stage !== 'idle'}
        onClose={() => { if (stage === 'published') setStage('idle') }}
        title={stage === 'paying' ? 'Processing payment' : 'Published'}
      >
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
