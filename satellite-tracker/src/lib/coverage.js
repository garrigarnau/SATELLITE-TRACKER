// How many satellites are high enough in the sky over a set of places.
// Pure maths on top of satellite.js, shared by the coverage worker (and easy
// to benchmark in Node). Elevation is computed from ECF positions with a dot
// product against each place's local "up", which is ~3x cheaper than calling
// ecfToLookAngles for every satellite/place pair.
import * as sat from 'satellite.js'

const RAD = Math.PI / 180
const EARTH_RADIUS_KM = 6371

// Elevation thresholds the page can show. 25° is the lowest angle Starlink's
// first-generation dishes were filed to use; 40° is a comfortable margin.
export const THRESHOLDS = [25, 40]

// Ground distance (km) from a place within which a satellite at `altKm` is at
// least `minElDeg` above the horizon.
export function coverageRadiusKm(minElDeg, altKm = 550) {
  const e = minElDeg * RAD
  const central = Math.acos((EARTH_RADIUS_KM * Math.cos(e)) / (EARTH_RADIUS_KM + altKm)) - e
  return EARTH_RADIUS_KM * central
}

// OMM JSON records (CelesTrak GP/SupGP) -> satrecs. Records SGP4 can't
// initialise are dropped.
export function buildCatalog(omm) {
  const recs = []
  for (const o of omm) {
    try {
      const satrec = sat.json2satrec(o)
      if (satrec.error) continue
      recs.push({ id: Number(o.NORAD_CAT_ID), name: o.OBJECT_NAME, satrec, epoch: Date.parse(o.EPOCH.endsWith('Z') ? o.EPOCH : `${o.EPOCH}Z`) })
    } catch {
      /* malformed record */
    }
  }
  return recs
}

// Observer position and unit "up" vector in ECF, once per place.
export function preparePlaces(places) {
  return places.map((p) => {
    const lat = p.lat * RAD
    const lon = p.lon * RAD
    const pos = sat.geodeticToEcf({ latitude: lat, longitude: lon, height: (p.alt || 0) / 1000 })
    const up = { x: Math.cos(lat) * Math.cos(lon), y: Math.cos(lat) * Math.sin(lon), z: Math.sin(lat) }
    return { id: p.id, pos, up }
  })
}

const SIN = THRESHOLDS.map((t) => Math.sin(t * RAD))

// One instant. Returns, per threshold, the count for each place; optionally
// the ground position of every satellite (Float32Array [lat, lon, ...]) and
// the satellites above the lowest threshold for one place.
export function snapshot(catalog, places, date, { positions = false, detailFor = -1 } = {}) {
  const gmst = sat.gstime(date)
  const counts = THRESHOLDS.map(() => new Array(places.length).fill(0))
  const pos = positions ? new Float32Array(catalog.length * 2).fill(NaN) : null
  const detail = []

  for (let i = 0; i < catalog.length; i++) {
    const pv = sat.propagate(catalog[i].satrec, date)
    if (!pv?.position) continue
    const e = sat.eciToEcf(pv.position, gmst)
    if (pos) {
      // Geocentric latitude: within ~0.2° of geodetic, plenty for a world map.
      pos[i * 2] = Math.atan2(e.z, Math.hypot(e.x, e.y)) / RAD
      pos[i * 2 + 1] = Math.atan2(e.y, e.x) / RAD
    }
    for (let k = 0; k < places.length; k++) {
      const p = places[k]
      const dx = e.x - p.pos.x
      const dy = e.y - p.pos.y
      const dz = e.z - p.pos.z
      const along = dx * p.up.x + dy * p.up.y + dz * p.up.z
      if (along <= 0) continue
      const sinEl = along / Math.sqrt(dx * dx + dy * dy + dz * dz)
      for (let t = 0; t < SIN.length; t++) if (sinEl >= SIN[t]) counts[t][k]++
      if (k === detailFor && sinEl >= SIN[0]) {
        const r = Math.hypot(e.x, e.y, e.z)
        detail.push({
          i,
          el: Math.asin(sinEl) / RAD,
          lat: Math.atan2(e.z, Math.hypot(e.x, e.y)) / RAD,
          lon: Math.atan2(e.y, e.x) / RAD,
          altKm: r - EARTH_RADIUS_KM,
        })
      }
    }
  }
  return { counts, positions: pos, detail }
}

// Counts over time: series[threshold][place] = [count at each step].
export function forecast(catalog, places, from, { minutes = 90, stepMin = 2 } = {}) {
  const steps = Math.floor(minutes / stepMin) + 1
  const series = THRESHOLDS.map(() => places.map(() => new Array(steps)))
  for (let s = 0; s < steps; s++) {
    const { counts } = snapshot(catalog, places, new Date(from + s * stepMin * 60_000))
    for (let t = 0; t < THRESHOLDS.length; t++) for (let k = 0; k < places.length; k++) series[t][k][s] = counts[t][k]
  }
  return { from, stepMin, steps, series }
}
