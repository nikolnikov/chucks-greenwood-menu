import type { Draft } from '../types/draft'
import { draftKey } from '../shared/draftKey'

const DAY_MS = 24 * 60 * 60 * 1000

export const MAX_FRESHNESS = 5

/** Tracking record served by /api/freshness. */
export interface TrackedBeer {
  key: string
  firstSeen: string
  baseline: boolean
}

/** Attaches tracking data to each draft; drafts with no record are left as-is. */
export function attachTracking(drafts: Draft[], tracked: TrackedBeer[]): Draft[] {
  const byKey = new Map(tracked.map((beer) => [beer.key, beer]))

  return drafts.map((draft) => {
    const match = byKey.get(draftKey(draft))
    if (!match) return draft
    return { ...draft, firstSeen: match.firstSeen, baseline: match.baseline }
  })
}

/**
 * 5: on tap within 3 days, 4: within a week, 3: within 2 weeks,
 * 2: within 4 weeks, 1: 4 weeks or older. Never lower than 1: beers whose start
 * date is unknown (on tap before tracking began, or no record) rate 1.
 */
export function getFreshness(draft: Draft, now: number = Date.now()): number {
  if (!draft.firstSeen || draft.baseline) return 1
  const time = Date.parse(draft.firstSeen)
  if (Number.isNaN(time)) return 1

  const ageDays = (now - time) / DAY_MS
  if (ageDays <= 3) return 5
  if (ageDays <= 7) return 4
  if (ageDays <= 14) return 3
  if (ageDays < 28) return 2
  return 1
}
