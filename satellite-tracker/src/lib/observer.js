// The observer's location lives in the URL (?lat=&lon=&name=) so every page,
// including a satellite's detail page, can be refreshed and shared.
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { tr } from './i18n'

export function useObserver() {
  const [params, setParams] = useSearchParams()

  const observer = useMemo(() => {
    const lat = parseFloat(params.get('lat'))
    const lon = parseFloat(params.get('lon'))
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
    return { lat, lon, alt: parseFloat(params.get('alt')) || 0, name: params.get('name') || tr('common.yourLocation') }
  }, [params])

  const setObserver = useCallback(
    (next) =>
      setParams((prev) => {
        const p = new URLSearchParams(prev)
        if (!next) {
          ;['lat', 'lon', 'alt', 'name'].forEach((k) => p.delete(k))
        } else {
          p.set('lat', next.lat.toFixed(4))
          p.set('lon', next.lon.toFixed(4))
          if (next.alt) p.set('alt', Math.round(next.alt)); else p.delete('alt')
          p.set('name', next.name)
        }
        return p
      }),
    [setParams],
  )

  return [observer, setObserver]
}

// Query string carrying the observer, for links between pages.
export function observerQuery(observer) {
  if (!observer) return ''
  const p = new URLSearchParams({ lat: observer.lat.toFixed(4), lon: observer.lon.toFixed(4), name: observer.name })
  if (observer.alt) p.set('alt', Math.round(observer.alt))
  return `?${p}`
}
