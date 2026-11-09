import { fetchSourceBeers, getCurrentBeers, syncBeers, type D1Database } from './tracker.ts'

const SOURCE_URL = 'https://www.standyck.com/chucks/drafts.json'

interface Env {
  DB: D1Database
  ASSETS: { fetch(request: Request): Promise<Response> }
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void
}

async function track(env: Env): Promise<void> {
  const beers = await fetchSourceBeers(SOURCE_URL)
  await syncBeers(env.DB, beers, new Date().toISOString())
}

export default {
  // Cron trigger: records which beers arrived or left since the last run.
  async scheduled(_controller: unknown, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      track(env).catch((error) => {
        console.error('Tracking run failed', error)
      }),
    )
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url)

    if (pathname === '/api/freshness' && request.method === 'GET') {
      const beers = await getCurrentBeers(env.DB)
      return Response.json(beers, { headers: { 'Cache-Control': 'public, max-age=60' } })
    }

    return env.ASSETS.fetch(request)
  },
}
