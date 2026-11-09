import { draftKey } from '../src/shared/draftKey.ts'

// Minimal D1 typings so the project doesn't need @cloudflare/workers-types.
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  all<T>(): Promise<{ results: T[] }>
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>
}

export interface SourceBeer {
  number: number
  brewery: string | null
  name: string
}

export interface TrackedBeer {
  key: string
  firstSeen: string
  baseline: boolean
}

/** A list this short is almost certainly a bad fetch, not a real menu. */
const MIN_PLAUSIBLE_BEERS = 10

export async function fetchSourceBeers(url: string): Promise<SourceBeer[]> {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) throw new Error(`Source responded ${response.status}`)
  const data: unknown = await response.json()
  if (!Array.isArray(data)) throw new Error('Source is not a list')

  return data.map((entry) => {
    const { number, brewery, name } = entry as Partial<SourceBeer>
    if (typeof number !== 'number' || typeof name !== 'string') {
      throw new Error('Unexpected source entry shape')
    }
    return { number, brewery: brewery ?? null, name }
  })
}

/**
 * Records arrivals and departures. The very first run seeds every beer as a
 * baseline (start date unknown); after that, anything new gets first_seen = now
 * and anything missing from the list gets removed_at = now.
 */
export async function syncBeers(db: D1Database, beers: SourceBeer[], now: string): Promise<void> {
  if (beers.length < MIN_PLAUSIBLE_BEERS) {
    throw new Error(`Refusing to sync only ${beers.length} beers`)
  }

  const { results: existing } = await db
    .prepare('SELECT key, removed_at FROM beers')
    .all<{ key: string; removed_at: string | null }>()
  const known = new Map(existing.map((row) => [row.key, row.removed_at]))
  const isFirstRun = existing.length === 0

  const insert = (beer: SourceBeer, key: string, baseline: number) =>
    db
      .prepare(
        `INSERT INTO beers (key, tap, brewery, name, first_seen, last_seen, baseline)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(key, beer.number, beer.brewery ?? '', beer.name, now, now, baseline)

  const statements: D1PreparedStatement[] = []
  const currentKeys = new Set<string>()

  for (const beer of beers) {
    const key = draftKey(beer)
    if (currentKeys.has(key)) continue
    currentKeys.add(key)

    if (!known.has(key)) {
      statements.push(insert(beer, key, isFirstRun ? 1 : 0))
    } else if (known.get(key) !== null) {
      // Back on tap after being removed: treat as a new keg.
      statements.push(
        db
          .prepare(
            `UPDATE beers SET first_seen = ?, last_seen = ?, removed_at = NULL, baseline = 0
             WHERE key = ?`,
          )
          .bind(now, now, key),
      )
    } else {
      statements.push(db.prepare('UPDATE beers SET last_seen = ? WHERE key = ?').bind(now, key))
    }
  }

  for (const [key, removedAt] of known) {
    if (removedAt === null && !currentKeys.has(key)) {
      statements.push(db.prepare('UPDATE beers SET removed_at = ? WHERE key = ?').bind(now, key))
    }
  }

  if (statements.length > 0) await db.batch(statements)
}

export async function getCurrentBeers(db: D1Database): Promise<TrackedBeer[]> {
  const { results } = await db
    .prepare('SELECT key, first_seen, baseline FROM beers WHERE removed_at IS NULL')
    .all<{ key: string; first_seen: string; baseline: number }>()

  return results.map((row) => ({
    key: row.key,
    firstSeen: row.first_seen,
    baseline: row.baseline === 1,
  }))
}
