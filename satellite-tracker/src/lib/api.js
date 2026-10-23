// Thin client for the N2YO and OpenCage APIs. Both are reached through /api/*,
// where nginx (or the Vite dev proxy) adds the API keys.

const memo = new Map()

async function getJson(url, { ttlMs = 60_000 } = {}) {
  const hit = memo.get(url)
  if (hit && Date.now() - hit.at < ttlMs) return hit.data

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  const data = await res.json()
  // N2YO answers 200 with {error} when the key is wrong or the quota is spent.
  if (data && data.error) throw new Error(data.error)
  memo.set(url, { at: Date.now(), data })
  return data
}

const n2yo = (path) => `/api/n2yo/${path}`

// N2YO's free plan caps some endpoints per hour; worth telling the user plainly.
export const isQuotaError = (e) => /exceeded|transactions allowed/i.test(e?.message || '')
const fix = (n, d = 4) => Number(n).toFixed(d)

// N2YO "above" categories worth exposing as filters.
// The first is the default view. GPS always has several satellites above any
// point on Earth (the constellation is designed that way), so it's never empty.
export const CATEGORIES = [
  { id: 20, label: 'GPS' },
  { id: 18, label: 'Amateur radio' },
  { id: 52, label: 'Starlink' },
  { id: 2, label: 'Space stations' },
  { id: 1, label: 'Brightest' },
  { id: 3, label: 'Weather' },
]

// Objects bright enough to spot with the naked eye; their passes fill the home page.
export const SPOTLIGHT = [25544, 48274, 20580, 27386, 25994, 27424]

export async function geocode(query, language = 'en') {
  const data = await getJson(`/api/geocode?q=${encodeURIComponent(query)}&limit=5&no_annotations=1&language=${language}`, { ttlMs: 86_400_000 })
  return (data.results || []).map((r) => ({
    name: r.formatted,
    lat: r.geometry.lat,
    lon: r.geometry.lng,
  }))
}

export async function getAbove({ lat, lon, alt = 0 }, category, radius = 70) {
  const data = await getJson(n2yo(`above/${fix(lat)}/${fix(lon)}/${Math.round(alt)}/${radius}/${category}/`), { ttlMs: 30_000 })
  return data.above || []
}

// Friendlier names for the spotlight satellites than the catalogue's.
const NAMES = { 25544: 'ISS', 48274: 'Tiangong (CSS)', 20580: 'Hubble', 27386: 'Envisat', 25994: 'Terra', 27424: 'Aqua' }

// Orbital elements from CelesTrak (cached for 2 h by nginx, matching CelesTrak's
// update cadence), with N2YO only as a fallback.
export async function getTle(id) {
  try {
    // Give up quickly so a CelesTrak outage costs seconds, not a minute.
    const res = await fetch(`/api/celestrak/NORAD/elements/gp.php?CATNR=${encodeURIComponent(id)}&FORMAT=TLE`, {
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) throw new Error(`CelesTrak ${res.status}`)
    const [name, line1, line2] = (await res.text()).trim().split(/\r?\n/).map((l) => l.trim())
    if (!line1?.startsWith('1 ') || !line2?.startsWith('2 ')) throw new Error('No elements')
    return { name: NAMES[id] || name, id: Number(id), line1, line2 }
  } catch {
    const data = await getJson(n2yo(`tle/${id}`), { ttlMs: 6 * 3_600_000 })
    const [line1, line2] = (data.tle || '').split(/\r?\n/)
    if (!line1 || !line2) throw new Error('No orbital data for this satellite')
    return { name: NAMES[id] || data.info?.satname, id: Number(id), line1, line2 }
  }
}

// Visible passes, predicted locally in a Web Worker (see lib/passes.js), so
// they cost no API quota. Same shape as N2YO's visualpasses response.
let worker
let jobs = 0
const pending = new Map()

function runWorker(payload) {
  if (!worker) {
    worker = new Worker(new URL('../workers/passes.worker.js', import.meta.url), { type: 'module' })
    worker.onmessage = ({ data }) => {
      const job = pending.get(data.jobId)
      if (!job) return
      pending.delete(data.jobId)
      data.error ? job.reject(new Error(data.error)) : job.resolve(data.passes)
    }
  }
  return new Promise((resolve, reject) => {
    const jobId = ++jobs
    pending.set(jobId, { resolve, reject })
    worker.postMessage({ jobId, ...payload })
  })
}

const passMemo = new Map()

export function getVisualPasses(id, { lat, lon, alt = 0 }, days = 10, minVisibility = 60) {
  const key = `${id}:${lat.toFixed(2)}:${lon.toFixed(2)}:${days}:${minVisibility}`
  const hit = passMemo.get(key)
  if (hit && Date.now() - hit.at < 15 * 60_000) return hit.promise

  const promise = getTle(id).then(async (tle) => {
    const passes = await runWorker({ tle, observer: { lat, lon, alt }, opts: { days, minVisibility } })
    return { name: tle.name, passes: passes.map((p) => ({ ...p, satid: Number(id), satname: tle.name })) }
  })
  passMemo.set(key, { at: Date.now(), promise })
  promise.catch(() => passMemo.delete(key))
  return promise
}
