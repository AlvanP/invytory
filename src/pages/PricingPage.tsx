import { useNavigate } from 'react-router-dom'
import { pricingPlans } from '@/data/pricingPlans'
import { PlanCard } from '@/components/pricing/PlanCard'

export function PricingPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <div className="text-center">
        <h1 className="font-brand text-5xl text-wine sm:text-6xl">Pay once, per invitation</h1>
        <p className="mx-auto mt-4 max-w-md text-base text-ink-soft">
          Every plan includes every template, in every event category. The difference is how many guests you invite, how long
          your invitation stays online, and whether your guests share their photos in one album.
        </p>
      </div>

      <div className="mt-14 grid gap-8 sm:grid-cols-2">
        {pricingPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            highlight={plan.id === 'gold'}
            ctaLabel="Create your invitation"
            onSelect={() => navigate('/create')}
          />
        ))}
      </div>
      <p className="mt-5 text-center text-sm text-ink-soft">
        You choose your plan and pay at the end, once your invitation is ready.
      </p>

      <div className="mt-20 rounded-md bg-ivory-deep p-8 text-center sm:p-10">
        <h2 className="font-brand text-3xl text-wine">Planning events for clients?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          If you make invitations for many clients, we can set up special rates and a planner account for you. Create your first
          invitation, then get in touch.
        </p>
      </div>
    </div>
  )
}
