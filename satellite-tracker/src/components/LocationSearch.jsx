import { useEffect, useRef, useState } from 'react'
import { geocode } from '../lib/api'
import { track } from '../lib/track'
import { useT } from '../lib/i18n'

// City search with suggestions, plus "use my location". Calls onSelect({lat, lon, alt, name}).
export default function LocationSearch({ onSelect, compact = false, autoFocus = false }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [active, setActive] = useState(0)
  const [status, setStatus] = useState('idle') // idle | searching | locating
  const [error, setError] = useState('')
  const seq = useRef(0)
  const t = useT()

  useEffect(() => {
    const q = query.trim()
    if (q.length < 3) {
      setResults([])
      return
    }
    const id = ++seq.current
    const timer = setTimeout(async () => {
      setStatus('searching')
      try {
        const r = await geocode(q, t.locale)
        if (id !== seq.current) return
        setResults(r)
        setActive(0)
        setError(r.length ? '' : t('search.noResults'))
      } catch {
        if (id === seq.current) setError(t('search.unavailable'))
      } finally {
        if (id === seq.current) setStatus('idle')
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [query, t])

  const pick = (r) => {
    setQuery('')
    setResults([])
    // Country only (last part of the place name), never the coordinates.
    track('location_set', { method: 'search', country: r.name.split(',').pop().trim() })
    onSelect(r)
  }

  const locate = () => {
    if (!navigator.geolocation) {
      setError(t('search.noGeo'))
      return
    }
    setStatus('locating')
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus('idle')
        track('location_set', { method: 'gps' })
        onSelect({ lat: pos.coords.latitude, lon: pos.coords.longitude, alt: pos.coords.altitude || 0, name: t('common.myLocation') })
      },
      () => {
        setStatus('idle')
        setError(t('search.denied'))
      },
      { enableHighAccuracy: false, timeout: 10_000 },
    )
  }

  const onKeyDown = (e) => {
    if (!results.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % results.length) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + results.length) % results.length) }
    if (e.key === 'Enter') { e.preventDefault(); pick(results[active]) }
    if (e.key === 'Escape') setResults([])
  }

  return (
    <div className={compact ? 'search search--compact' : 'search'}>
      <div className="search__bar">
        <svg className="search__icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('search.placeholder')}
          aria-label={t('search.label')}
          aria-autocomplete="list"
          aria-controls="search-results"
          autoComplete="off"
          spellCheck="false"
          autoFocus={autoFocus}
        />
        {status === 'searching' && <span className="spinner" aria-label={t('search.searching')} />}
        <button type="button" className="search__locate" onClick={locate} disabled={status === 'locating'}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="7" /></svg>
          <span>{status === 'locating' ? t('search.locating') : t('search.useLocation')}</span>
        </button>
      </div>

      {results.length > 0 && (
        <ul className="search__results" id="search-results" role="listbox">
          {results.map((r, i) => (
            <li key={`${r.lat},${r.lon}`} role="option" aria-selected={i === active}>
              <button type="button" onMouseEnter={() => setActive(i)} onClick={() => pick(r)}>
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="search__error" role="status">{error}</p>}
    </div>
  )
}
