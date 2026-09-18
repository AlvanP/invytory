import { Link, useNavigate } from 'react-router-dom'
import { pricingPlans, wholesaleTiers } from '@/data/pricingPlans'
import { PlanCard } from '@/components/pricing/PlanCard'

export function PricingPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="text-center">
        <p className="text-xs tracking-[0.2em] text-gold">Pricing</p>
        <h1 className="mt-2 font-display text-4xl text-ink">Simple, one-time pricing</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-ink-soft">
          Every plan includes the full Evermore experience. Choose based on how many guests
          you're inviting and how long you'd like your invitation hosted.
        </p>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {pricingPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            highlight={plan.id === 'gold'}
            ctaLabel="Start Your Invitation"
            onSelect={() => navigate('/create')}
          />
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-ink-soft/60">
        You'll choose your plan and pay at the end of the invitation-creation process.
      </p>

      <div className="mt-20 rounded-md border border-ink/10 bg-ivory-deep p-8 sm:p-10">
        <p className="text-xs tracking-[0.2em] text-gold">For Wedding Planners</p>
        <h2 className="mt-2 font-display text-2xl text-ink">Wholesale Pricing</h2>
        <p className="mt-2 max-w-lg text-sm text-ink-soft">
          Wedding planners can create invitations for multiple clients at discounted wholesale rates.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink-soft/70">
                <th className="py-3 font-medium">Monthly Weddings</th>
                <th className="py-3 font-medium">Price Per Event</th>
              </tr>
            </thead>
            <tbody>
              {wholesaleTiers.map((tier) => (
                <tr key={tier.range} className="border-b border-ink/8 last:border-0">
                  <td className="py-4 text-ink">{tier.range}</td>
                  <td className="py-4 text-ink-soft">&#8358;{tier.pricePerEvent.toLocaleString()} per event</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-sm text-ink-soft">
          Interested in wholesale pricing?{' '}
          <Link to="/create" className="text-gold hover:underline">
            Start creating your first invitation
          </Link>{' '}
          and reach out to us to set up your planner account.
        </p>
      </div>
    </div>
  )
}