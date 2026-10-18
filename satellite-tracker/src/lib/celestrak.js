// Who owns what is overhead, from CelesTrak's SATCAT (free, no key).
// Reached through /api/celestrak/*, where nginx caches each answer for a day
// so every visitor shares one upstream request. CelesTrak updates the SATCAT
// daily and blocks clients that hammer it, so we ask once per category view:
// one small group file (2-15 KB), plus a capped handful of single lookups for
// satellites N2YO lists that the CelesTrak group doesn't.
import { useEffect, useState } from 'react'

const BASE = '/api/celestrak'
const DAY = 86_400_000

// N2YO "above" category -> CelesTrak SATCAT group.
const GROUPS = { 2: 'stations', 1: 'visual', 3: 'weather', 20: 'gps-ops', 18: 'amateur' }
// Every one of the ~11k Starlink records is owned by the US (checked against
// GROUP=starlink), so skip that ~1 MB download.
const FIXED_OWNER = { 52: 'US' }
// Most single lookups per view, made two at a time; the rest count as unknown.
const MAX_LOOKUPS = 10

const memo = new Map()
function cached(key, ttlMs, load) {
  const hit = memo.get(key)
  if (hit && Date.now() - hit.at < ttlMs) return hit.promise
  const promise = load()
  memo.set(key, { at: Date.now(), promise })
  promise.catch(() => memo.delete(key))
  return promise
}

async function getText(path) {
  const res = await fetch(`${BASE}/${path}`)
  if (!res.ok) throw new Error(`CelesTrak request failed (${res.status})`)
  return res.text()
}

// Minimal CSV reader: CelesTrak quotes names that contain commas.
function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2 || !lines[0].includes(',')) return []
  const split = (line) => {
    const out = []
    let cur = ''
    let quoted = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (quoted && line[i + 1] === '"') { cur += '"'; i++ } else quoted = !quoted
      } else if (ch === ',' && !quoted) { out.push(cur); cur = '' } else cur += ch
    }
    out.push(cur)
    return out
  }
  const head = split(lines[0])
  return lines.slice(1).map((l) => {
    const cells = split(l)
    return Object.fromEntries(head.map((h, i) => [h, cells[i]]))
  })
}

// NORAD id -> owner code, shared by group files and single lookups.
const ownerById = new Map()

function groupOwners(group) {
  return cached(`group:${group}`, DAY, async () => {
    const rows = parseCsv(await getText(`satcat/records.php?GROUP=${group}&FORMAT=CSV`))
    for (const r of rows) ownerById.set(Number(r.NORAD_CAT_ID), r.OWNER)
    return rows.length
  })
}

function singleOwner(id) {
  return cached(`sat:${id}`, DAY, async () => {
    const text = await getText(`satcat/records.php?CATNR=${id}&FORMAT=JSON`)
    let owner = null
    try { owner = JSON.parse(text)?.[0]?.OWNER || null } catch { /* "No SATCAT records found" */ }
    ownerById.set(id, owner)
    return owner
  })
}

// NORAD ids in CelesTrak's "military" GP group (~45 objects, ~7 KB). It is
// their miscellaneous-military list, not every military satellite in orbit.
export function getMilitaryIds() {
  return cached('military', DAY, async () => {
    const rows = parseCsv(await getText('NORAD/elements/gp.php?GROUP=military&FORMAT=csv'))
    return new Set(rows.map((r) => Number(r.NORAD_CAT_ID)))
  })
}

export async function getOwners(category, ids) {
  const owners = new Map()
  if (FIXED_OWNER[category]) {
    for (const id of ids) owners.set(id, FIXED_OWNER[category])
    return owners
  }
  if (GROUPS[category]) await groupOwners(GROUPS[category]).catch(() => {})
  const missing = ids.filter((id) => !ownerById.has(id)).slice(0, MAX_LOOKUPS)
  for (let i = 0; i < missing.length; i += 2) {
    await Promise.allSettled(missing.slice(i, i + 2).map(singleOwner))
  }
  for (const id of ids) if (ownerById.get(id)) owners.set(id, ownerById.get(id))
  return owners
}

// Owner codes are CelesTrak's (celestrak.org/satcat/sources.php), shortened.
const OWNER_NAMES = {
  US: 'United States', PRC: 'China', CIS: 'Russia / CIS', ESA: 'ESA', ESRO: 'ESA',
  ISS: 'ISS partners', JPN: 'Japan', IND: 'India', ISRO: 'India', FR: 'France', GER: 'Germany',
  UK: 'United Kingdom', IT: 'Italy', SPN: 'Spain', CA: 'Canada', AUS: 'Australia', ISRA: 'Israel',
  SKOR: 'South Korea', NKOR: 'North Korea', ROC: 'Taiwan', TURK: 'Türkiye', UAE: 'UAE',
  SAUD: 'Saudi Arabia', BRAZ: 'Brazil', ARGN: 'Argentina', MEX: 'Mexico', NETH: 'Netherlands',
  BEL: 'Belgium', SWED: 'Sweden', NOR: 'Norway', FIN: 'Finland', DEN: 'Denmark', POL: 'Poland',
  SWTZ: 'Switzerland', ASRA: 'Austria', LUXE: 'Luxembourg', UKR: 'Ukraine', KAZ: 'Kazakhstan',
  INDO: 'Indonesia', MALA: 'Malaysia', THAI: 'Thailand', VTNM: 'Vietnam', SING: 'Singapore',
  ALG: 'Algeria', MA: 'Morocco', TUN: 'Tunisia', KEN: 'Kenya', GHA: 'Ghana', ETH: 'Ethiopia', ANG: 'Angola',
  CHLE: 'Chile', COL: 'Colombia', PERU: 'Peru', ECU: 'Ecuador', URY: 'Uruguay', VENZ: 'Venezuela', BOL: 'Bolivia',
  CZCH: 'Czechia', HUN: 'Hungary', ROM: 'Romania', BUL: 'Bulgaria', GREC: 'Greece', POR: 'Portugal', IRL: 'Ireland',
  EST: 'Estonia', LTU: 'Lithuania', SVN: 'Slovenia', HRV: 'Croatia', BELA: 'Belarus', AZER: 'Azerbaijan',
  BGD: 'Bangladesh', NPL: 'Nepal', LKA: 'Sri Lanka', RP: 'Philippines', MNG: 'Mongolia', QAT: 'Qatar', BHR: 'Bahrain',
  IRAQ: 'Iraq', MCO: 'Monaco', SGJP: 'Singapore / Japan', USBZ: 'United States / Brazil', CHTU: 'China / Türkiye',
  EGYP: 'Egypt', SAFR: 'South Africa', NIG: 'Nigeria', IRAN: 'Iran', PAKI: 'Pakistan', NZ: 'New Zealand',
  EUME: 'EUMETSAT', EUTE: 'Eutelsat', ITSO: 'Intelsat', IM: 'Inmarsat', SES: 'SES', O3B: 'SES (O3b)',
  IRID: 'Iridium', GLOB: 'Globalstar', ORB: 'Orbcomm', NATO: 'NATO', AB: 'Arabsat', AC: 'AsiaSat',
  CHBZ: 'China / Brazil', FGER: 'France / Germany', FRIT: 'France / Italy', PRES: 'China / ESA',
}
const UNKNOWN = new Set(['TBD', 'UNK', ''])

export const ownerName = (code) => OWNER_NAMES[code] || code

// Group the list by owner: the biggest `max` owners, then everything else
// (including owners we couldn't resolve) as "Other / unknown".
export function ownershipBreakdown(list, owners, max = 4) {
  const byName = new Map()
  const other = { key: 'other', label: 'Other / unknown', ids: new Set() }
  for (const s of list) {
    const code = owners.get(s.satid) || ''
    if (UNKNOWN.has(code)) { other.ids.add(s.satid); continue }
    const label = ownerName(code)
    if (!byName.has(label)) byName.set(label, { key: label, label, ids: new Set() })
    byName.get(label).ids.add(s.satid)
  }
  const named = [...byName.values()].sort((a, b) => b.ids.size - a.ids.size)
  const keep = named.length > max + 1 ? named.slice(0, max) : named
  for (const b of named.slice(keep.length)) b.ids.forEach((id) => other.ids.add(id))
  const buckets = other.ids.size ? [...keep, other] : keep
  const total = list.length || 1
  return buckets.map((b) => ({ ...b, count: b.ids.size, pct: (b.ids.size / total) * 100 }))
}

// Owners for the satellites currently listed, plus CelesTrak's military ids.
export function useOwnership(list, category) {
  const [state, setState] = useState({ status: 'idle', owners: new Map(), military: null })
  const ids = list.map((s) => s.satid)
  const key = `${category}:${ids.join(',')}`

  useEffect(() => {
    if (!ids.length) return setState({ status: 'idle', owners: new Map(), military: null })
    let alive = true
    setState((s) => ({ ...s, status: 'loading' }))
    Promise.all([getOwners(category, ids), getMilitaryIds().catch(() => null)])
      .then(([owners, military]) => alive && setState({ status: 'ready', owners, military }))
      .catch(() => alive && setState({ status: 'error', owners: new Map(), military: null }))
    return () => { alive = false }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  return state
}
