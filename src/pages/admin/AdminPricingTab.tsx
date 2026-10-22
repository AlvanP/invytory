import { useState, useSyncExternalStore } from 'react'
import { planService } from '@/services/planService'
import { pricingPlans } from '@/data/pricingPlans'
import { Button } from '@/components/ui/Button'
import { formatNumber } from '@/utils/format'

/** Admin: change what each plan costs. The website and the payment check both use these prices. */
export function AdminPricingTab() {
  useSyncExternalStore(planService.subscribe, planService.getVersion)
  const [values, setValues] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  async function save(id: 'silver' | 'gold') {
    const raw = (values[id] ?? '').replace(/[, ]/g, '')
    const price = Number(raw)
    if (!raw || !Number.isInteger(price) || price < 0 || price > 10_000_000) {
      setMessage({ ok: false, text: 'Enter a whole number of naira, for example 25000.' })
      return
    }
    setBusy(id)
    setMessage(null)
    try {
      await planService.setPrice(id, price)
      setValues((v) => ({ ...v, [id]: '' }))
      setMessage({ ok: true, text: 'Saved. The new price shows on the website and is what Paystack is checked against.' })
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : 'Could not save.' })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <p className="text-sm text-ink-soft">
        Change what each plan costs, in naira. New prices apply to invitations paid for from now on; invitations already paid for are not affected.
      </p>
      {pricingPlans.map((plan) => (
        <section key={plan.id} className="flex flex-col gap-3 rounded-md border border-ink/10 bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl text-ink">{plan.name}</h2>
            <span className="text-sm text-ink-soft">Now ₦{formatNumber(plan.price)} · up to {formatNumber(plan.maxGuests)} guests</span>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm text-ink-soft">
              New price (₦)
              <input
                inputMode="numeric"
                value={values[plan.id] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [plan.id]: e.target.value }))}
                placeholder={String(plan.price)}
                className="w-44 rounded-xs border border-ink/15 bg-white px-3 py-2 text-base text-ink focus:border-gold focus:outline-none sm:text-sm"
              />
            </label>
            <Button onClick={() => save(plan.id)} isLoading={busy === plan.id} disabled={busy !== null}>
              Save price
            </Button>
          </div>
        </section>
      ))}
      {message && <p className={message.ok ? 'text-sm text-ink' : 'text-sm text-danger'}>{message.text}</p>}
    </div>
  )
}
