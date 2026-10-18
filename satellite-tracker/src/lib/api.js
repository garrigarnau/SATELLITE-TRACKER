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
// The first is the default: Starlink is the one category that is never empty.
export const CATEGORIES = [
  { id: 52, label: 'Starlink' },
  { id: 2, label: 'Space stations' },
  { id: 1, label: 'Brightest' },
  { id: 3, label: 'Weather' },
  { id: 20, label: 'GPS' },
  { id: 18, label: 'Amateur radio' },
]

// Objects bright enough to spot with the naked eye; their passes fill the home page.
export const SPOTLIGHT = [25544, 48274, 20580, 27386, 25994, 27424]

export async function geocode(query) {
  const data = await getJson(`/api/geocode?q=${encodeURIComponent(query)}&limit=5&no_annotations=1`, { ttlMs: 86_400_000 })
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

export async function getVisualPasses(id, { lat, lon }, days = 10, minVisibility = 60) {
  // Rounded to ~1 km and at sea level: pass times barely change, and nearby
  // visitors then share nginx's cached answer instead of each spending quota.
  const data = await getJson(
    n2yo(`visualpasses/${id}/${fix(lat, 2)}/${fix(lon, 2)}/0/${days}/${minVisibility}/`),
    { ttlMs: 30 * 60_000 },
  )
  return {
    name: data.info?.satname,
    passes: (data.passes || []).map((p) => ({ ...p, satid: id, satname: data.info?.satname })),
  }
}

export async function getTle(id) {
  const data = await getJson(n2yo(`tle/${id}`), { ttlMs: 6 * 3_600_000 })
  const [line1, line2] = (data.tle || '').split(/\r?\n/)
  if (!line1 || !line2) throw new Error('No orbital data for this satellite')
  return { name: data.info?.satname, id: data.info?.satid, line1, line2 }
}
