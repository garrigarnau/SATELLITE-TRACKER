const timeFmt = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' })
const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
const num = (d) => new Intl.NumberFormat(undefined, { maximumFractionDigits: d, minimumFractionDigits: d })

export const fmtTime = (unix) => timeFmt.format(new Date(unix * 1000))

export function fmtDay(unix) {
  const d = new Date(unix * 1000)
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 86_400_000)
  if (d.toDateString() === today.toDateString()) return 'Tonight'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return dayFmt.format(d)
}

export function fmtCountdown(unix, now = Date.now()) {
  const s = Math.round(unix - now / 1000)
  if (s <= 0) return 'now'
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `in ${d}d ${h}h`
  if (h > 0) return `in ${h}h ${m}m`
  if (m > 0) return `in ${m}m`
  return `in ${s}s`
}

export function fmtDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`
}

export const fmtNum = (n, d = 0) => num(d).format(n)

export function fmtCoord(value, pos, neg) {
  return `${num(2).format(Math.abs(value))}° ${value >= 0 ? pos : neg}`
}

// Visual magnitude: lower is brighter. N2YO uses 100000 when it is unknown.
export function brightness(mag) {
  if (mag == null || mag >= 100000) return { label: 'Unknown', level: 0 }
  if (mag <= -2) return { label: 'Very bright', level: 4 }
  if (mag <= 1) return { label: 'Bright', level: 3 }
  if (mag <= 3) return { label: 'Visible', level: 2 }
  return { label: 'Faint', level: 1 }
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
export const compass = (deg) => COMPASS[Math.round(((deg % 360) + 360) % 360 / 45) % 8]
