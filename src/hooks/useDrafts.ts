import { useEffect, useRef, useState } from 'react'
import type { Draft } from '../types/draft'
import { attachTracking, type TrackedBeer } from '../utils/freshness'

const DRAFTS_URL = 'https://www.standyck.com/chucks/drafts.json'
const TRACKING_URL = '/api/freshness'
const POLL_INTERVAL_MS = 30 * 60 * 1000

// Optional: only used for freshness, so a failure must not break the list
// (beers without tracking data simply rate 1).
async function fetchTracking(): Promise<TrackedBeer[]> {
  try {
    const response = await fetch(TRACKING_URL, { cache: 'no-store' })
    return response.ok ? ((await response.json()) as TrackedBeer[]) : []
  } catch {
    return []
  }
}

interface UseDraftsResult {
  drafts: Draft[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useDrafts(): UseDraftsResult {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const previousPayload = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchDrafts() {
      try {
        const [response, tracked] = await Promise.all([
          fetch(DRAFTS_URL, { cache: 'no-store' }),
          fetchTracking(),
        ])
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        const text = await response.text()
        if (cancelled) return

        const payload = text + JSON.stringify(tracked)
        if (payload !== previousPayload.current) {
          previousPayload.current = payload
          const parsed = JSON.parse(text) as Draft[]
          setDrafts(attachTracking(parsed, tracked))
        }
        setLastUpdated(new Date())
        setError(null)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load drafts')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchDrafts()
    const intervalId = setInterval(fetchDrafts, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [])

  return { drafts, loading, error, lastUpdated }
}
