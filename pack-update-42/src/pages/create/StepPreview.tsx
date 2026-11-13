import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Banknote, CreditCard, Smartphone, Monitor, Mail, AlertCircle } from 'lucide-react'
import { useWizard } from '@/hooks/useWizard'
import { useAuth } from '@/hooks/useAuth'
import { weddingService } from '@/services/weddingService'
import { adminService } from '@/services/adminService'
import { authService } from '@/services/authService'
import { paymentService } from '@/services/paymentService'
import { pricingPlans, type PricingPlan } from '@/data/pricingPlans'
import { checkPlanHosting } from '@/utils/hostingDuration'
import type { CeremonyDraft } from '@/types'
import { ceremonyDisplayName } from '@/types'
import { PhoneMockup } from '@/components/brand/PhoneMockup'
import { ManualPayPanel } from '@/components/pay/ManualPayPanel'
import { PlanCard } from '@/components/pricing/PlanCard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/cn'

type CheckoutStage = 'idle' | 'selectPlan' | 'method' | 'signIn' | 'linkSent' | 'processing' | 'manual' | 'error'

export function StepPreview() {
  const { draft, reset } = useWizard()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [device, setDevice] = useState<'desktop' | 'mobile'>('mobile')
  const [previewCeremony, setPreviewCeremony] = useState<CeremonyDraft>(draft.ceremonies[0])
  const [stage, setStage] = useState<CheckoutStage>('idle')
  const [isAdmin, setIsAdmin] = useState(false)
  const [replay, setReplay] = useState(0)
  useEffect(() => {
    if (!user) return setIsAdmin(false)
    adminService.isAdmin().then(setIsAdmin)
  }, [user])
  const [email, setEmail] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [transferRef, setTransferRef] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // After the sign-in link is opened in this browser, carry on to the choice of how to pay.
  useEffect(() => {
    if (user && stage === 'linkSent' && selectedPlan) setStage('method')
  }, [user, stage, selectedPlan])

  function handlePublishClick() {
    setStage('selectPlan')
  }

  function handleSelectPlan(plan: PricingPlan) {
    setSelectedPlan(plan)
    if (user) {
      setStage('method')
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

  async function startFreePublish(plan: PricingPlan) {
    if (!user) return
    setStage('processing')
    try {
      const saved = await weddingService.createDraft(draft, user.id, plan)
      const reference = `ADMIN-${saved.wedding.id}`
      const activated = await paymentService.activate(reference, saved.wedding.id, plan.id, true)
      if (!activated.ok) {
        setErrorMessage(activated.error ?? 'Could not publish.')
        setStage('error')
        return
      }
      reset()
      navigate(`/success/${saved.wedding.slug}`)
    } catch {
      setErrorMessage('Something went wrong. Please try again.')
      setStage('error')
    }
  }

  /** Saves the invitation as a draft and shows the bank details. An admin publishes it once the payment is confirmed. */
  async function startTransfer(plan: PricingPlan, ownerId: string) {
    setStage('processing')
    try {
      const saved = await weddingService.createDraft(draft, ownerId, plan)
      setTransferRef(`INV-${saved.wedding.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`)
      setStage('manual')
    } catch {
      setErrorMessage('We could not save your invitation. Please try again.')
      setStage('error')
    }
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
        setStage('selectPlan')
        return
      }

      // Save the invitation as a draft, then ask the secure server to confirm the payment and publish it.
      const saved = await weddingService.createDraft(draft, ownerId, plan)
      const activated = await paymentService.activate(reference, saved.wedding.id, plan.id)
      if (!activated.ok) {
        setErrorMessage(
          (activated.error ? activated.error + ' ' : '') +
          'If you were charged, contact support with this reference: ' + reference
        )
        setStage('error')
        return
      }

      reset()
      navigate(`/success/${saved.wedding.slug}`)
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

      {draft.ceremonies.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {draft.ceremonies.map((c) => (
            <button
              key={c.id}
              onClick={() => setPreviewCeremony(c)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs',
                previewCeremony.id === c.id ? 'border-ink bg-ink text-ivory' : 'border-ink/15 text-ink-soft'
              )}
            >
              {ceremonyDisplayName(c)}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-3 rounded-md bg-ivory-deep p-4 sm:p-10">
        <p className="text-center text-xs text-ink-soft">
          This is how your guests will see it. Tap the entrance to open it, and scroll. Your music plays after the tap.
        </p>
        {device === 'mobile' ? (
          <div className="mx-auto w-[17.5rem] sm:w-[20rem]">
            <PhoneMockup
              key={`${previewCeremony.id}-${replay}`}
              src={`/preview-draft?c=${encodeURIComponent(previewCeremony.id)}`}
              interactive
            />
          </div>
        ) : (
          <div className="w-full overflow-hidden rounded-md border border-ink/10 bg-ivory shadow-lift">
            <div className="flex items-center gap-1.5 border-b border-ink/10 bg-white px-3 py-2">
              <span className="size-2.5 rounded-full bg-ink/15" />
              <span className="size-2.5 rounded-full bg-ink/15" />
              <span className="size-2.5 rounded-full bg-ink/15" />
            </div>
            <iframe
              key={`${previewCeremony.id}-${replay}-desktop`}
              title="Invitation preview"
              src={`/preview-draft?c=${encodeURIComponent(previewCeremony.id)}`}
              allow="autoplay"
              className="block h-[75vh] min-h-[32rem] w-full border-0"
            />
          </div>
        )}
        <button type="button" onClick={() => setReplay((n) => n + 1)} className="text-xs text-wine underline-offset-2 hover:underline">
          Replay from the entrance
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-ink/10 pt-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/create/options')}>Back</Button>
        <Button size="sm" icon={<CreditCard className="size-4" />} onClick={handlePublishClick}>
          Publish Invitation
        </Button>
      </div>

      <Modal
        isOpen={stage !== 'idle'}
        onClose={() => { if (stage === 'manual') { reset(); navigate('/dashboard/events'); return } if (stage === 'method' || stage === 'selectPlan' || stage === 'signIn' || stage === 'linkSent' || stage === 'error') setStage('idle') }}
        title={
          stage === 'selectPlan' ? 'Choose your plan'
          : stage === 'method' ? 'How would you like to pay?'
          : stage === 'manual' ? 'Pay by bank transfer'
          : stage === 'signIn' ? 'Sign in to continue'
          : stage === 'linkSent' ? 'Check your email'
          : stage === 'processing' ? 'Processing'
          : 'Something went wrong'
        }
      >
        {stage === 'selectPlan' && (
          <div className="flex flex-col gap-4">
            {draft.ceremonies.length > 1 && (
              <p className="text-xs text-ink-soft">
                One payment covers all {draft.ceremonies.length} ceremonies in this wedding.
              </p>
            )}
            {pricingPlans.map((plan) => {
              const hosting = checkPlanHosting(plan.id, draft.ceremonies)
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  highlight={plan.id === 'gold'}
                  ctaLabel={`Pay ₦${plan.price.toLocaleString()} & Publish`}
                  onSelect={handleSelectPlan}
                  disabled={!hosting.fits}
                  note={hosting.warning}
                />
              )
            })}
            {isAdmin && (
              <div className="flex flex-col gap-2 rounded-md border border-gold/50 bg-gold/10 p-4">
                <p className="text-xs text-ink-soft">Admin only: publish this invitation without payment.</p>
                <div className="flex flex-wrap gap-2">
                  {pricingPlans.map((plan) => (
                    <Button key={plan.id} variant="secondary" onClick={() => startFreePublish(plan)} disabled={!checkPlanHosting(plan.id, draft.ceremonies).fits}>
                      Publish free: {plan.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-ink-soft">
              By paying you agree to our <Link to="/terms" target="_blank" className="text-wine underline">Terms</Link> and{' '}
              <Link to="/privacy" target="_blank" className="text-wine underline">Privacy Policy</Link>.
            </p>
          </div>
        )}

        {stage === 'method' && selectedPlan && user && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-ink-soft">
              {selectedPlan.name} plan: <span className="font-medium text-ink">₦{selectedPlan.price.toLocaleString()}</span>
            </p>
            <button
              type="button"
              onClick={() => startCheckout(selectedPlan, user.id, user.email ?? email)}
              className="flex items-start gap-3 rounded-md border border-ink/15 p-4 text-left hover:border-gold"
            >
              <CreditCard className="mt-0.5 size-5 shrink-0 text-gold" />
              <span>
                <span className="block text-sm font-medium text-ink">Pay online with Paystack</span>
                <span className="block text-xs text-ink-soft">Card, bank or USSD. Your invitation goes live right away.</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => startTransfer(selectedPlan, user.id)}
              className="flex items-start gap-3 rounded-md border border-ink/15 p-4 text-left hover:border-gold"
            >
              <Banknote className="mt-0.5 size-5 shrink-0 text-gold" />
              <span>
                <span className="block text-sm font-medium text-ink">Pay by bank transfer</span>
                <span className="block text-xs text-ink-soft">
                  Transfer from any bank or app (OPay included), then send us your receipt on WhatsApp. We publish it once confirmed.
                </span>
              </span>
            </button>
            <button type="button" onClick={() => setStage('selectPlan')} className="self-start text-xs text-ink-soft underline-offset-2 hover:underline">
              Choose a different plan
            </button>
          </div>
        )}

        {stage === 'manual' && selectedPlan && (
          <div className="flex flex-col gap-4">
            <ManualPayPanel amount={selectedPlan.price} reference={transferRef} planName={selectedPlan.name} email={user?.email ?? email} />
            <Button onClick={() => { reset(); navigate('/dashboard/events') }}>Go to my dashboard</Button>
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
              We sent a link to <span className="text-ink">{email}</span>. Open it to sign in.
              This page will pick up right where you left off and take you to checkout automatically.
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