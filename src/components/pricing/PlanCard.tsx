import { Check } from 'lucide-react'
import type { PricingPlan } from '@/data/pricingPlans'
import { sharedPlanFeatures } from '@/data/pricingPlans'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

export function PlanCard({
  plan,
  highlight,
  ctaLabel,
  onSelect,
  isLoading,
}: {
  plan: PricingPlan
  highlight?: boolean
  ctaLabel?: string
  onSelect?: (plan: PricingPlan) => void
  isLoading?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 rounded-md border bg-white p-8',
        highlight ? 'border-gold shadow-lift' : 'border-ink/10'
      )}
    >
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-display text-2xl text-ink">{plan.name}</h3>
          {highlight && <Badge tone="premium">Most Popular</Badge>}
        </div>
        <p className="mt-1 text-sm text-ink-soft">{plan.description}</p>
      </div>

      <div>
        <span className="font-display text-4xl text-ink">&#8358;{plan.price.toLocaleString()}</span>
        <span className="text-sm text-ink-soft"> / invitation</span>
      </div>

      <div className="flex flex-col gap-2 text-sm text-ink-soft">
        <p><span className="text-ink">{plan.maxGuests.toLocaleString()}</span> guest capacity</p>
        <p><span className="text-ink">{plan.hostingDays}</span> days of hosting</p>
      </div>

      <ul className="flex flex-col gap-2.5 text-sm text-ink-soft">
        {sharedPlanFeatures.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-gold" />
            {feature}
          </li>
        ))}
      </ul>

      {onSelect && (
        <Button
          variant={highlight ? 'primary' : 'outline'}
          isLoading={isLoading}
          onClick={() => onSelect(plan)}
          className="mt-auto"
        >
          {ctaLabel ?? `Choose ${plan.name}`}
        </Button>
      )}
    </div>
  )
}