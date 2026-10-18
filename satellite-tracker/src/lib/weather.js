import { useEffect, useState } from 'react'

// Hourly cloud cover from Open-Meteo (free, no key, CORS-enabled).
// One request per observer location, shared by every page for ~30 minutes.
const TTL = 30 * 60_000
const cache = new Map() // key -> { at, promise }

const keyFor = (lat, lon) => `${lat.toFixed(2)},${lon.toFixed(2)}`

export function getCloudForecast(lat, lon) {
  const key = keyFor(lat, lon)
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL) return hit.promise

  const params = new URLSearchParams({
    latitude: lat.toFixed(2),
    longitude: lon.toFixed(2),
    hourly: 'cloud_cover',
    timeformat: 'unixtime',
    timezone: 'UTC',
    forecast_days: '11', // passes cover 10 days; Open-Meteo allows up to 16
  })
  const promise = fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
    .then((r) => {
      if (!r.ok) throw new Error(`Open-Meteo ${r.status}`)
      return r.json()
    })
    .then((d) => ({ times: d.hourly.time, cloud: d.hourly.cloud_cover }))
  promise.catch(() => cache.delete(key)) // let a later render retry
  cache.set(key, { at: Date.now(), promise })
  return promise
}

// Cloud cover (%) at the hour nearest `unix`, or null beyond the forecast.
export function cloudAt(forecast, unix) {
  const { times, cloud } = forecast
  if (!times?.length || unix < times[0] - 1800 || unix > times[times.length - 1] + 1800) return null
  const i = Math.min(times.length - 1, Math.max(0, Math.round((unix - times[0]) / 3600)))
  return cloud[i] ?? null
}

export const CLOUDED_OUT = 80

export function sky(pct) {
  if (pct == null) return null
  if (pct < 25) return { level: 'clear', label: 'Clear', phrase: 'clear skies' }
  if (pct < 70) return { level: 'partly', label: 'Partly', phrase: 'partly cloudy' }
  return { level: 'cloudy', label: 'Cloudy', phrase: pct >= CLOUDED_OUT ? 'likely clouded out' : 'mostly cloudy' }
}

// { status: 'loading' | 'ready' | 'error', forecast }
export function useCloudForecast(observer) {
  const [state, setState] = useState({ status: 'loading', forecast: null })
  useEffect(() => {
    let alive = true
    setState({ status: 'loading', forecast: null })
    getCloudForecast(observer.lat, observer.lon)
      .then((forecast) => alive && setState({ status: 'ready', forecast }))
      .catch(() => alive && setState({ status: 'error', forecast: null }))
    return () => { alive = false }
  }, [observer.lat, observer.lon])
  return state
}

// What PassCard's `cloud` prop expects: undefined hides the stat (error),
// 'loading' shows a dash, null means no forecast yet, a number is the %.
export function passCloud(weather, pass) {
  if (weather.status === 'error') return undefined
  if (weather.status === 'loading') return 'loading'
  return cloudAt(weather.forecast, pass.maxUTC ?? (pass.startUTC + pass.endUTC) / 2)
}
