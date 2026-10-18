// The Starlink catalogue: every Starlink's orbital elements in OMM JSON, from
// CelesTrak's GP group "starlink" (about 11,000 records, ~600 KB gzipped).
// Reached through /api/starlink, where nginx keeps one shared copy for 2 h
// (CelesTrak updates every ~2 h and refuses repeat downloads in between). In
// dev, vite.config.js serves a saved fixture instead.
// OMM rather than TLE: catalogue numbers above 99999 (every object launched
// since July 2026) can't be written in the TLE format.
export const STARLINK_URL = '/api/starlink'

// Fields json2satrec needs, plus the name.
const KEEP = [
  'OBJECT_NAME', 'OBJECT_ID', 'EPOCH', 'MEAN_MOTION', 'ECCENTRICITY', 'INCLINATION', 'RA_OF_ASC_NODE',
  'ARG_OF_PERICENTER', 'MEAN_ANOMALY', 'EPHEMERIS_TYPE', 'CLASSIFICATION_TYPE', 'NORAD_CAT_ID',
  'ELEMENT_SET_NO', 'REV_AT_EPOCH', 'BSTAR', 'MEAN_MOTION_DOT', 'MEAN_MOTION_DDOT',
]

export async function getStarlinkCatalog(url = STARLINK_URL) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Orbital data request failed (${res.status})`)
  const data = await res.json()
  if (!Array.isArray(data) || !data.length) throw new Error('No orbital data in the response')
  return {
    fetchedAt: Date.now(),
    records: data.map((o) => Object.fromEntries(KEEP.filter((k) => k in o).map((k) => [k, o[k]]))),
  }
}

// Satellite detail pages fetch a TLE; that only exists for 5-digit ids.
export const hasDetailPage = (id) => id > 0 && id <= 99999
