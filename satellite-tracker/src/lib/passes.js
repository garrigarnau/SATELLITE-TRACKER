// Naked-eye pass prediction, computed locally from a TLE (no API quota).
// A satellite is visible when it is above the horizon threshold, lit by the
// sun (outside Earth's shadow) and the observer's sky is dark enough.
import * as sat from 'satellite.js'

const EARTH_RADIUS_KM = 6378.137
const AU_KM = 149_597_870.7
const RAD = Math.PI / 180

const MIN_ELEVATION = 10 // degrees above the horizon
const MAX_SUN_ELEVATION = -6 // civil twilight: sky dark enough to spot it
const STEP_S = 30 // coarse search step; passes shorter than a minute are dropped anyway

// Standard magnitudes (at 1000 km, half lit) for the spotlight satellites;
// others get no brightness estimate.
const STD_MAG = { 25544: -1.8, 48274: -0.8, 20580: 2.2, 27386: 3.7, 25994: 3.0, 27424: 3.0 }

const COMPASS16 = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
const compass16 = (deg) => COMPASS16[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16]

// Low-precision solar position (Astronomical Almanac), ECI in km. Good to ~0.01°.
function sunEci(date) {
  const n = date.getTime() / 86_400_000 + 2440587.5 - 2451545.0
  const L = 280.46 + 0.9856474 * n
  const g = (357.528 + 0.9856003 * n) * RAD
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD
  const eps = (23.439 - 0.0000004 * n) * RAD
  const r = (1.00014 - 0.01671 * Math.cos(g) - 0.00014 * Math.cos(2 * g)) * AU_KM
  return { x: r * Math.cos(lambda), y: r * Math.cos(eps) * Math.sin(lambda), z: r * Math.sin(eps) * Math.sin(lambda) }
}

const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z })
const norm = (a) => Math.sqrt(dot(a, a))

// Cylindrical shadow model: in shadow if behind Earth relative to the sun
// and within one Earth radius of the Earth-sun axis.
function inShadow(r, sun) {
  const s = norm(sun)
  const proj = dot(r, sun) / s
  if (proj > 0) return false
  const perp = Math.sqrt(Math.max(dot(r, r) - proj * proj, 0))
  return perp < EARTH_RADIUS_KM
}

// Lambertian sphere phase function, normalised to 1 at a 90° phase angle.
const phase = (a) => Math.sin(a) + (Math.PI - a) * Math.cos(a)

function makeState(satrec, observer) {
  const gd = { latitude: observer.lat * RAD, longitude: observer.lon * RAD, height: (observer.alt || 0) / 1000 }
  const obsEcf = sat.geodeticToEcf(gd)

  return function state(t, full = false) {
    const date = new Date(t * 1000)
    const pv = sat.propagate(satrec, date)
    if (!pv.position) return null
    const gmst = sat.gstime(date)
    const look = sat.ecfToLookAngles(gd, sat.eciToEcf(pv.position, gmst))
    const el = look.elevation / RAD
    const res = { t, el, az: ((look.azimuth / RAD) % 360 + 360) % 360, range: look.rangeSat, visible: false }
    if (el < MIN_ELEVATION && !full) return res

    const sun = sunEci(date)
    const sunLook = sat.ecfToLookAngles(gd, sat.eciToEcf(sun, gmst))
    const sunEl = sunLook.elevation / RAD
    const lit = !inShadow(pv.position, sun)
    res.visible = el >= MIN_ELEVATION && lit && sunEl <= MAX_SUN_ELEVATION

    if (full) {
      // Phase angle at the satellite between the sun and the observer.
      const obsEci = sat.ecfToEci(obsEcf, gmst)
      const toSun = sub(sun, pv.position)
      const toObs = sub(obsEci, pv.position)
      res.phase = Math.acos(Math.min(1, Math.max(-1, dot(toSun, toObs) / (norm(toSun) * norm(toObs)))))
    }
    return res
  }
}

// Narrow the visibility edge between a non-visible and a visible time to ~1 s.
function refine(state, a, b, wantVisible) {
  while (b - a > 1) {
    const m = (a + b) / 2
    const s = state(m)
    if (s && s.visible === wantVisible) b = m
    else a = m
  }
  return b
}

export function predictPasses({ line1, line2, id }, observer, { days = 10, minVisibility = 60, from = Date.now() / 1000 - 900 } = {}) {
  const satrec = sat.twoline2satrec(line1, line2)
  const state = makeState(satrec, observer)
  const stdMag = STD_MAG[id]
  const passes = []
  const end = from + days * 86_400

  let prev = state(from)
  let segStart = prev?.visible ? from : null

  for (let t = from + STEP_S; t <= end; t += STEP_S) {
    const cur = state(t)
    if (!cur) { prev = null; segStart = null; continue }
    const was = prev?.visible
    if (!was && cur.visible) segStart = prev ? refine(state, t - STEP_S, t, true) : t
    if (was && !cur.visible && segStart != null) {
      const segEnd = refine(state, t - STEP_S, t, false) - 1
      const p = describe(state, segStart, segEnd, stdMag)
      if (p && p.duration >= minVisibility) passes.push(p)
      segStart = null
    }
    prev = cur
  }
  return passes
}

function describe(state, startUTC, endUTC, stdMag) {
  let max = null
  for (let t = startUTC; t <= endUTC; t += 5) {
    const s = state(t)
    if (s && (!max || s.el > max.el)) max = s
  }
  const start = state(startUTC)
  const stop = state(endUTC)
  if (!start || !stop || !max) return null
  const peak = state(max.t, true)

  let mag = 100000 // N2YO's "unknown" sentinel, understood by brightness()
  if (stdMag != null && peak.phase != null) {
    mag = stdMag + 5 * Math.log10(peak.range / 1000) - 2.5 * Math.log10(Math.max(phase(peak.phase), 1e-3))
    mag = Math.round(mag * 10) / 10
  }

  const deg = (s) => Math.round(s.el * 10) / 10
  return {
    startUTC: Math.round(startUTC), startAz: Math.round(start.az), startAzCompass: compass16(start.az), startEl: deg(start),
    maxUTC: Math.round(peak.t), maxAz: Math.round(peak.az), maxAzCompass: compass16(peak.az), maxEl: deg(peak),
    endUTC: Math.round(endUTC), endAz: Math.round(stop.az), endAzCompass: compass16(stop.az), endEl: deg(stop),
    duration: Math.round(endUTC - startUTC),
    mag,
  }
}
