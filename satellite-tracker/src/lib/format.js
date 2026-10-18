import { getLocale, intlLocale, localCompass, tr } from './i18n'

// Formatters per active locale (see i18n.setLocale), built once each.
const cache = new Map()
function fmt(key, make) {
  const k = `${getLocale()}:${key}`
  if (!cache.has(k)) cache.set(k, make(intlLocale()))
  return cache.get(k)
}
const timeFmt = () => fmt('time', (l) => new Intl.DateTimeFormat(l, { hour: '2-digit', minute: '2-digit' }))
const dayFmt = () => fmt('day', (l) => new Intl.DateTimeFormat(l, { weekday: 'short', day: 'numeric', month: 'short' }))
const num = (d) => fmt(`num${d}`, (l) => new Intl.NumberFormat(l, { maximumFractionDigits: d, minimumFractionDigits: d }))

export const fmtTime = (unix) => timeFmt().format(new Date(unix * 1000))

export function fmtDay(unix) {
  const d = new Date(unix * 1000)
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 86_400_000)
  if (d.toDateString() === today.toDateString()) return tr('day.tonight')
  if (d.toDateString() === tomorrow.toDateString()) return tr('day.tomorrow')
  return dayFmt().format(d)
}

export function fmtCountdown(unix, now = Date.now()) {
  const s = Math.round(unix - now / 1000)
  if (s <= 0) return tr('count.now')
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return tr('count.d', { d, h })
  if (h > 0) return tr('count.h', { h, m })
  if (m > 0) return tr('count.m', { m })
  return tr('count.s', { s })
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
  if (mag == null || mag >= 100000) return { label: tr('bright.unknown'), level: 0 }
  if (mag <= -2) return { label: tr('bright.veryBright'), level: 4 }
  if (mag <= 1) return { label: tr('bright.bright'), level: 3 }
  if (mag <= 3) return { label: tr('bright.visible'), level: 2 }
  return { label: tr('bright.faint'), level: 1 }
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
export const compass = (deg) => localCompass(COMPASS[Math.round(((deg % 360) + 360) % 360 / 45) % 8])

// Translates the 16-point compass labels that pass predictions carry ("SSW").
export const dir = (label) => localCompass(label)
