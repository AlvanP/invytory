import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Smartphone, Monitor, Mail, AlertCircle } from 'lucide-react'
import { useWizard } from '@/hooks/useWizard'
import { useAuth } from '@/hooks/useAuth'
import { templateService } from '@/services/templateService'
import { invitationService } from '@/services/invitationService'
import { authService } from '@/services/authService'
import { paymentService } from '@/services/paymentService'
import { pricingPlans, type PricingPlan } from '@/data/pricingPlans'
import type { InvitationTemplate } from '@/types'
import { draftToPreviewInvitation } from '@/utils/draftToPreviewInvitation'
import { InvitationRenderer } from '@/components/invitation/InvitationRenderer'
import { PlanCard } from '@/components/pricing/PlanCard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/cn'

type CheckoutStage = 'idle' | 'selectPlan' | 'signIn' | 'linkSent' | 'processing' | 'error'

export function StepPreview() {
  const { draft, reset } = useWizard()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [template, setTemplate] = useState<InvitationTemplate | undefined>()
  const [device, setDevice] = useState<'desktop' | 'mobile'>('mobile')
  const [stage, setStage] = useState<CheckoutStage>('idle')
  const [email, setEmail] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [wantsToCheckout, setWantsToCheckout] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (draft.templateId) templateService.getById(draft.templateId).then(setTemplate)
  }, [draft.templateId])

  const previewInvitation = draftToPreviewInvitation(draft)

  // If the guest signs in on another tab (via the magic-link email)
  // while this tab is showing "check your email," pick right back up
  // and launch Paystack checkout — the draft and chosen plan never left memory.
  useEffect(() => {
    if (user && wantsToCheckout && stage === 'linkSent' && selectedPlan) {
      startCheckout(selectedPlan, user.id, user.email ?? email)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, wantsToCheckout, stage])

  function handlePublishClick() {
    setStage('selectPlan')
  }

  function handleSelectPlan(plan: PricingPlan) {
    setSelectedPlan(plan)
    setWantsToCheckout(true)
    if (user) {
      startCheckout(plan, user.id, user.email ?? email)
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

  async function startCheckout(plan: PricingPlan, ownerId: string, payerEmail: string) {
    setStage('processing')
    try {
      const reference = await paymentService.checkout({
        email: payerEmail,
        amountNaira: plan.price,
        metadata: { plan: plan.id, brideName: draft.brideName, groomName: draft.groomName },
      })

      if (!reference) {
        // Customer closed the Paystack popup without paying — let them try again.
        setStage('selectPlan')
        return
      }

      const verified = await paymentService.verifyPayment(reference, plan.price)
      if (!verified) {
        setErrorMessage('We could not confirm your payment. If you were charged, contact support with this reference: ' + reference)
        setStage('error')
        return
      }

      const published = await invitationService.publish(draft, ownerId, plan, reference)
      reset()
      navigate(`/success/${published.slug}`)
    } catch {
      setErrorMessage('Something went wrong during checkout. Please try again.')
      setStage('error')
    }
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
        onClose={() => { if (stage === 'selectPlan' || stage === 'signIn' || stage === 'linkSent' || stage === 'error') setStage('idle') }}
        title={
          stage === 'selectPlan' ? 'Choose your plan'
          : stage === 'signIn' ? 'Sign in to continue'
          : stage === 'linkSent' ? 'Check your email'
          : stage === 'processing' ? 'Processing'
          : 'Something went wrong'
        }
      >
        {stage === 'selectPlan' && (
          <div className="flex flex-col gap-4">
            {pricingPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                highlight={plan.id === 'gold'}
                ctaLabel={`Pay ₦${plan.price.toLocaleString()} & Publish`}
                onSelect={handleSelectPlan}
              />
            ))}
          </div>
        )}

        {stage === 'signIn' && (
          <form onSubmit={handleSendLink} className="flex flex-col gap-4">
            <p className="text-sm text-ink-soft">
              Sign in with your email to publish your {selectedPlan?.name} invitation and save it to your dashboard.
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
              this page will pick up right where you left off and take you to checkout automatically.
            </p>
          </div>
        )}

        {stage === 'processing' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="size-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            <p className="text-sm text-ink-soft">Processing your payment&hellip;</p>
          </div>
        )}

        {stage === 'error' && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <AlertCircle className="size-8 text-danger" strokeWidth={1.5} />
            <p className="text-sm text-ink-soft">{errorMessage}</p>
            <Button size="sm" onClick={() => setStage('selectPlan')}>Try Again</Button>
          </div>
        )}
      </Modal>
    </div>
  )
}