import { supabase } from './supabaseClient'
import { pricingPlans } from '@/data/pricingPlans'

/**
 * Plan prices live in the `plans` table so the admin can change them. The static
 * `pricingPlans` list is the fallback; this module overwrites its prices in place once the
 * real ones are known, and tells the app to redraw. The server (activate-payment) reads the
 * same table, so what the page shows is what it checks.
 */
const CACHE_KEY = 'invytory:plan-prices:v1'
const listeners = new Set<() => void>()
let version = 0

function apply(prices: Record<string, number>): boolean {
  let changed = false
  for (const plan of pricingPlans) {
    const next = prices[plan.id]
    if (typeof next === 'number' && Number.isFinite(next) && next >= 0 && next !== plan.price) {
      plan.price = next
      changed = true
    }
  }
  if (changed) {
    version++
    listeners.forEach((l) => l())
  }
  return changed
}

export const planService = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  getVersion: () => version,

  /** Applies the remembered prices straight away, then refreshes from the database. */
  async init() {
    try {
      const cached = window.localStorage.getItem(CACHE_KEY)
      if (cached) apply(JSON.parse(cached) as Record<string, number>)
    } catch {
      // storage blocked: fine
    }
    await planService.refresh()
  },

  async refresh() {
    try {
      const { data, error } = await supabase.from('plans').select('id, price_naira')
      if (error || !data) return
      const prices: Record<string, number> = {}
      for (const row of data as { id: string; price_naira: number }[]) prices[row.id] = Number(row.price_naira)
      apply(prices)
      try {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(prices))
      } catch {
        // ignore
      }
    } catch {
      // keep the built-in prices
    }
  },

  /** Admin only (the database refuses anyone else). */
  async setPrice(id: 'silver' | 'gold', priceNaira: number) {
    const { data, error } = await supabase
      .from('plans')
      .update({ price_naira: priceNaira, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id')
    if (error) throw new Error(error.message)
    if (!data || data.length === 0) throw new Error('The price was not saved. Run docs/sql/plans.sql in Supabase first, and check you are signed in as an admin.')
    await planService.refresh()
  },
}
