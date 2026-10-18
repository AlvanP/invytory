import { useNavigate } from 'react-router-dom'
import { pricingPlans } from '@/data/pricingPlans'
import { PlanCard } from '@/components/pricing/PlanCard'

export function PricingSection() {
  const navigate = useNavigate()
  return (
    <section id="pricing" className="bg-gradient-to-b from-ivory-deep via-amber/10 to-ivory-deep">
      <div className="mx-auto max-w-4xl px-6 py-20 lg:py-28">
        <div className="text-center">
          <h2 className="font-brand text-4xl text-wine sm:text-5xl">Pay once, per invitation</h2>
          <p className="mx-auto mt-4 max-w-md text-base text-ink-soft">Design it first. You only pay when you publish.</p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {pricingPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} highlight={plan.id === 'gold'} ctaLabel="Create your invitation" onSelect={() => navigate('/create')} />
          ))}
        </div>
      </div>
    </section>
  )
}
