// Orbit maths on top of satellite.js. Everything here runs locally from a TLE,
// so the live position updates every second without spending API calls.
import * as sat from 'satellite.js'

const EARTH_RADIUS_KM = 6371

export const toSatrec = ({ line1, line2 }) => sat.twoline2satrec(line1, line2)

// Orbital period in minutes (satrec.no is the mean motion in rad/min).
export const periodMinutes = (satrec) => (2 * Math.PI) / satrec.no

export function positionAt(satrec, date) {
  const pv = sat.propagate(satrec, date)
  if (!pv.position) return null
  const geo = sat.eciToGeodetic(pv.position, sat.gstime(date))
  const v = pv.velocity
  return {
    lat: sat.degreesLat(geo.latitude),
    lon: sat.degreesLong(geo.longitude),
    altKm: geo.height,
    speedKmS: Math.hypot(v.x, v.y, v.z),
    eci: pv.position,
  }
}

export function lookAngles(satrec, date, observer) {
  const pv = sat.propagate(satrec, date)
  if (!pv.position) return null
  const ecf = sat.eciToEcf(pv.position, sat.gstime(date))
  const look = sat.ecfToLookAngles(
    {
      latitude: sat.degreesToRadians(observer.lat),
      longitude: sat.degreesToRadians(observer.lon),
      height: (observer.alt || 0) / 1000,
    },
    ecf,
  )
  return {
    azimuth: (sat.radiansToDegrees(look.azimuth) + 360) % 360,
    elevation: sat.radiansToDegrees(look.elevation),
    rangeKm: look.rangeSat,
  }
}

// Ground track around `center`, split wherever it crosses the antimeridian so
// Leaflet doesn't draw a line across the whole map.
export function groundTrack(satrec, center, minutesBefore, minutesAfter, stepSeconds = 30) {
  const segments = [[]]
  for (let s = -minutesBefore * 60; s <= minutesAfter * 60; s += stepSeconds) {
    const p = positionAt(satrec, new Date(center.getTime() + s * 1000))
    if (!p) continue
    const seg = segments[segments.length - 1]
    const prev = seg[seg.length - 1]
    if (prev && Math.abs(prev[1] - p.lon) > 180) segments.push([])
    segments[segments.length - 1].push([p.lat, p.lon])
  }
  return segments.filter((s) => s.length > 1)
}

// Radius (km) of the area on the ground from which the satellite is above the horizon.
export const footprintKm = (altKm) => EARTH_RADIUS_KM * Math.acos(EARTH_RADIUS_KM / (EARTH_RADIUS_KM + altKm))

// Sampled sky path (azimuth/elevation) between two unix timestamps.
export function skyPath(satrec, observer, startUTC, endUTC, steps = 60) {
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const t = startUTC + ((endUTC - startUTC) * i) / steps
    const look = lookAngles(satrec, new Date(t * 1000), observer)
    if (look) pts.push(look)
  }
  return pts
}
