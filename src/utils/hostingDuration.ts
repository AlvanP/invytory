import type { CeremonyDraft } from '@/types'

const DAY_MS = 24 * 60 * 60 * 1000
const GRACE_DAYS = 7 // invitation stays live this long after the last ceremony
const SILVER_HOSTING_DAYS = 30
const GOLD_BASE_HOSTING_DAYS = 90
const GOLD_MAX_HOSTING_DAYS = 150 // 5 months — Gold's hard cap

/**
 * How many days of hosting a wedding actually needs, counting from
 * today until its last ceremony, plus a short grace window afterward.
 * Returns 0 if there are no dated ceremonies yet.
 */
export function requiredHostingDays(ceremonies: CeremonyDraft[], from: Date = new Date()): number {
  const dates = ceremonies
    .map((c) => c.weddingDate)
    .filter((d): d is string => !!d)
    .map((d) => new Date(`${d}T00:00:00`))

  if (dates.length === 0) return 0

  const latest = new Date(Math.max(...dates.map((d) => d.getTime())))
  const daysUntilLatest = Math.ceil((latest.getTime() - from.getTime()) / DAY_MS)
  return Math.max(0, daysUntilLatest) + GRACE_DAYS
}

export interface PlanHostingCheck {
  /** Whether this plan can actually cover every ceremony's date. */
  fits: boolean
  /** The hosting length (in days) that will actually be used. */
  hostingDays: number
  /** Set when the plan can't fully cover the last ceremony — e.g. Gold
   * capped at 150 days but ceremonies span longer than that. */
  warning?: string
}

/**
 * Implements the plan's hosting rule:
 * - Silver: fixed 30 days — only "fits" if that's enough to cover every ceremony.
 * - Gold: 90 days minimum, stretches to cover the last ceremony, capped at 150.
 */
export function checkPlanHosting(planId: 'silver' | 'gold', ceremonies: CeremonyDraft[]): PlanHostingCheck {
  const needed = requiredHostingDays(ceremonies)

  if (planId === 'silver') {
    if (needed > SILVER_HOSTING_DAYS) {
      return {
        fits: false,
        hostingDays: SILVER_HOSTING_DAYS,
        warning: `Silver hosts for ${SILVER_HOSTING_DAYS} days, but your ceremonies need about ${needed} days of coverage. Please choose Gold.`,
      }
    }
    return { fits: true, hostingDays: SILVER_HOSTING_DAYS }
  }

  const hostingDays = Math.min(Math.max(needed, GOLD_BASE_HOSTING_DAYS), GOLD_MAX_HOSTING_DAYS)
  if (needed > GOLD_MAX_HOSTING_DAYS) {
    const cutoff = new Date(Date.now() + GOLD_MAX_HOSTING_DAYS * DAY_MS)
    return {
      fits: true,
      hostingDays: GOLD_MAX_HOSTING_DAYS,
      warning: `Your ceremonies span more than Gold's 5-month maximum. Hosting will end on ${cutoff.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}, which may be before your last ceremony. Consider spacing ceremonies closer together.`,
    }
  }
  return { fits: true, hostingDays }
}