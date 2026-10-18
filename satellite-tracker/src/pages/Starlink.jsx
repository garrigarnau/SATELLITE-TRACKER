import { useEffect, useMemo, useState } from 'react'
import { useSeo } from '../lib/seo'
import { STARLINK_META } from '../lib/seo-data'
import { Link, useSearchParams } from 'react-router-dom'
import { Circle, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import WorldMap from '../components/WorldMap'
import SatDots from '../components/SatDots'
import Sparkline from '../components/Sparkline'
import { Notice, Skeleton, Term } from '../components/Status'
import { useObserver, observerQuery } from '../lib/observer'
import { useCoverage } from '../lib/useCoverage'
import { THRESHOLDS, coverageRadiusKm } from '../lib/coverage'
import { hasDetailPage } from '../lib/starlink'
import { fmtNum } from '../lib/format'
import data from '../data/regions.json'
import './starlink.css'
import { track } from '../lib/track'

const REGIONS = data.regions
const DEFAULT_REGION = REGIONS[0].id
const STALE_MS = 12 * 3_600_000
const REVIEW_MAX_DAYS = 90
const NOMINAL_ALT_KM = 550

if (import.meta.env.DEV) {
  for (const r of REGIONS) {
    if (r.kind === 'region' && !r.sources?.length) console.warn(`regions.json: "${r.id}" has a context note without sources`)
  }
}

const monthFmt = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })
const dayFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const utcFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
// "2026-02-17" -> "17 Feb 2026", "2024-02" -> "Feb 2024".
const fmtAsOf = (s) => (s.length <= 7 ? monthFmt.format(new Date(`${s}-01T00:00Z`)) : dayFmt.format(new Date(`${s}T00:00Z`)))
const mean = (v) => (v?.length ? v.reduce((a, b) => a + b, 0) / v.length : null)

export default function Starlink() {
  const [params, setParams] = useSearchParams()
  const [observer] = useObserver()
  const q = observerQuery(observer)
  const selectedId = REGIONS.some((r) => r.id === params.get('region')) ? params.get('region') : DEFAULT_REGION
  const selected = REGIONS.find((r) => r.id === selectedId)
  const selectedIndex = REGIONS.indexOf(selected)
  const [tIndex, setTIndex] = useState(0)
  const threshold = THRESHOLDS[tIndex]

  const cov = useCoverage(REGIONS, selectedId)
  const live = cov.live
  const counts = live?.counts[tIndex]
  const series = cov.forecast?.series[tIndex]
  const sharedMax = useMemo(() => (series ? Math.max(...series.flat()) : 0), [series])

  useSeo(STARLINK_META)

  const select = (id) =>
    setParams((prev) => {
      const p = new URLSearchParams(prev)
      p.set('region', id)
      return p
    }, { replace: true })

  // Satellites above the selected region, with longitudes moved next to it so
  // they draw on the same world copy as its footprint.
  const above = useMemo(() => {
    if (!live || live.selected !== selectedId) return []
    return live.visible
      .filter((s) => s.el >= threshold)
      .map((s) => ({ ...s, lon: s.lon + 360 * Math.round((selected.lon - s.lon) / 360) }))
  }, [live, selectedId, threshold, selected.lon])

  const meta = cov.meta
  const stale = meta && Date.now() - meta.newestEpoch > STALE_MS
  const reviewedDays = (Date.now() - Date.parse(`${data.reviewed}T00:00Z`)) / 86_400_000
  const loading = cov.status === 'loading' || (cov.status === 'ready' && !live)

  return (
    <div className="wrap page starlink">
      <header className="sl-head">
        <div>
          <p className="eyebrow">Right now · computed in your browser</p>
          <h1 className="sl-head__title">Starlink over contested regions</h1>
        </div>
        <div className="sl-head__side">
          <div className="chips" role="radiogroup" aria-label="Minimum elevation">
            {THRESHOLDS.map((t, i) => (
              <button key={t} type="button" role="radio" aria-checked={i === tIndex} className="chip" onClick={() => setTIndex(i)}>
                ≥{t}°
              </button>
            ))}
          </div>
          <p className="sl-head__meta">
            {meta
              ? <>Data: CelesTrak · {fmtNum(meta.count)} satellites · elements to {utcFmt.format(meta.newestEpoch)} UTC</>
              : 'Data: CelesTrak'}
          </p>
        </div>
      </header>

      <p className="sl-lede">
        How many Starlink satellites are high enough in the sky over these places to talk to a dish on the ground — right now and over
        the next 90 minutes. It is a geometry count, computed from public orbital data. It does not tell you whether Starlink service is
        switched on, legal, or being used there.
      </p>
      <p className="sl-banner">
        <strong>Coverage is not service.</strong> SpaceX switches service on or off by location in software; satellites pass over every
        country alike.
      </p>

      {cov.status === 'error' && (
        <Notice tone="error" title="Couldn’t load the Starlink orbits">
          The orbital data service didn&rsquo;t answer ({cov.error}). It refreshes every two hours; try again in a few minutes.
        </Notice>
      )}
      {stale && (
        <Notice title="Orbital data is out of date">
          The newest elements are from {utcFmt.format(meta.newestEpoch)} UTC, so positions may be off by more than usual.
        </Notice>
      )}

      <div className="sl-body">
        <div className="sl-main">
          <WorldMap center={[selected.lat, selected.lon]} zoom={3} follow={[selected.lat, selected.lon]} className="sl-map">
            <FitContainer />
            {cov.plan.allDots && live?.positions && <SatDots positions={live.positions} />}
            <Circle
              center={[selected.lat, selected.lon]}
              radius={coverageRadiusKm(threshold, NOMINAL_ALT_KM) * 1000}
              pathOptions={{ color: '#f700ff', weight: 1.2, opacity: 0.8, dashArray: '4 6', fillColor: '#b06ab8', fillOpacity: 0.06 }}
              interactive={false}
            />
            {above.map((s) => (
              <CircleMarker
                key={s.id}
                center={[s.lat, s.lon]}
                radius={2.6}
                pathOptions={{ color: '#ffffff', weight: 0, fillColor: '#ffffff', fillOpacity: 0.95 }}
              >
                <Tooltip>{`${s.name} · ${Math.round(s.el)}° up`}</Tooltip>
              </CircleMarker>
            ))}
            {REGIONS.map((r) => (
              <CircleMarker
                key={r.id}
                center={[r.lat, r.lon]}
                radius={r.id === selectedId ? 6 : 4}
                pathOptions={
                  r.id === selectedId
                    ? { color: '#000000', weight: 2, fillColor: '#f700ff', fillOpacity: 1 }
                    : { color: '#000000', weight: 1.5, fillColor: r.kind === 'control' ? '#8a8a8a' : '#ffffff', fillOpacity: 1 }
                }
                eventHandlers={{ click: () => select(r.id) }}
              >
                <Tooltip>{r.label}</Tooltip>
              </CircleMarker>
            ))}
          </WorldMap>

          <div className="sl-side">
            <Detail
              region={selected}
              count={counts?.[selectedIndex]}
              values={series?.[selectedIndex]}
              stepMin={cov.forecast?.stepMin}
              max={sharedMax}
              threshold={threshold}
              above={above}
              loading={loading}
              q={q}
            />
            <Caveats />
          </div>
        </div>

        <section className="sl-cards" aria-label="Regions">
          <div className="sl-grid">
            {REGIONS.filter((r) => r.kind !== 'control').map((r) => (
              <RegionCard key={r.id} region={r} index={REGIONS.indexOf(r)} {...{ counts, series, sharedMax, selectedId, select, loading }} />
            ))}
          </div>
          <p className="sl-cards__label">Reference cities</p>
          <div className="sl-grid sl-grid--ref">
            {REGIONS.filter((r) => r.kind === 'control').map((r) => (
              <RegionCard key={r.id} region={r} index={REGIONS.indexOf(r)} {...{ counts, series, sharedMax, selectedId, select, loading }} />
            ))}
          </div>
        </section>
      </div>

      <section className="sl-notes">
        <div className="sl-note">
          <h2 className="sl-note__title">How we count</h2>
          <p>
            We take the public orbital elements of every Starlink satellite (about 11,000, from CelesTrak, refreshed every two hours) and
            calculate, every few seconds, which ones are at least 25° above the horizon from each city listed. 25° is roughly the lowest
            angle a Starlink dish is designed to use. At that angle a satellite 550 km up can be as far as ~940 km away across the ground,
            so a city&rsquo;s count also covers its neighbours.
          </p>
          <p>
            The 90-minute lines share one scale across all cards, so their heights compare directly. Counts at the threshold
            flicker by a few as satellites cross it; read the trend, not single-digit changes.
            {cov.plan.lite && ' To save battery on this device, counts refresh every 10 s and the satellite layer shows only the selected region.'}
          </p>
        </div>
        <div className="sl-note">
          <h2 className="sl-note__title">Sources</h2>
          <ul className="sl-sources">
            {REGIONS.filter((r) => r.sources?.length).map((r) => (
              <li key={r.id}>
                <span>{r.label}:</span>{' '}
                {r.sources.map((s, i) => (
                  <span key={s.url}>
                    {i > 0 && ' · '}
                    <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
                  </span>
                ))}
              </li>
            ))}
          </ul>
          <p className="sl-attrib">
            Orbital data: <a href="https://celestrak.org/NORAD/elements/" target="_blank" rel="noreferrer">CelesTrak</a> (GP, derived from
            18th Space Defense Squadron data). Context notes link to their sources; last reviewed {fmtAsOf(data.reviewed)}.
            {reviewedDays > REVIEW_MAX_DAYS && ' These notes may be out of date.'}
          </p>
        </div>
      </section>
    </div>
  )
}

// The map stretches with the side column, whose content arrives after mount;
// Leaflet only notices window resizes on its own.
function FitContainer() {
  const map = useMap()
  useEffect(() => {
    const ro = new ResizeObserver(() => map.invalidateSize({ pan: false }))
    ro.observe(map.getContainer())
    return () => ro.disconnect()
  }, [map])
  return null
}

function RegionCard({ region, index, counts, series, sharedMax, selectedId, select, loading }) {
  const values = series?.[index]
  const avg = mean(values)
  const control = region.kind === 'control'
  const active = region.id === selectedId
  return (
    <button
      type="button"
      className={`rcard${control ? ' rcard--ref' : ''}${active ? ' is-active' : ''}`}
      aria-pressed={active}
      onClick={() => select(region.id)}
    >
      <span className="rcard__head">
        <span className="rcard__name">{region.label}</span>
        <span className="rcard__country">{region.country}</span>
      </span>
      <span className="rcard__row">
        <span className="rcard__count">{loading || counts == null ? <span className="skeleton skeleton--text rcard__skel" /> : counts[index]}</span>
        <Sparkline values={values} max={sharedMax} />
      </span>
      <span className="rcard__meta">{avg != null ? `avg ${Math.round(avg)} · next 90 min` : 'forecasting…'}</span>
      {!control && <span className="rcard__ctx">{region.context}</span>}
    </button>
  )
}

function Detail({ region, count, values, stepMin, max, threshold, above, loading, q }) {
  const lo = values ? Math.min(...values) : null
  const hi = values ? Math.max(...values) : null
  const avg = mean(values)
  return (
    <aside className="panel sl-detail" aria-labelledby="sl-detail-title">
      <p className="eyebrow">Selected · ≥{threshold}° elevation</p>
      <h2 id="sl-detail-title" className="sl-detail__name">
        {region.label} <span>{region.country}</span>
      </h2>
      <p className="sl-detail__count" aria-live="polite">
        {loading || count == null ? <span className="skeleton skeleton--text" /> : <strong>{count}</strong>}
        <span>
          Starlinks at least {threshold}° above the horizon{' '}
          <Term hint="Counted from one point in the city. The dashed circle on the map is the ground area those satellites sit over.">now</Term>
        </span>
      </p>
      <Sparkline values={values} max={max} stepMin={stepMin} width={260} height={56} interactive />
      <dl className="stats sl-detail__stats">
        <div className="stat"><dt>Min</dt><dd>{lo ?? '—'}</dd></div>
        <div className="stat"><dt>Max</dt><dd>{hi ?? '—'}</dd></div>
        <div className="stat"><dt>Average</dt><dd>{avg != null ? Math.round(avg) : '—'}</dd></div>
        <div className="stat"><dt>Window</dt><dd>90 min</dd></div>
      </dl>

      {region.context && (
        <div className="sl-detail__ctx">
          <p>{region.context}</p>
          {region.sources?.length > 0 && (
            <p className="sl-detail__src">
              {region.asOf && <>As of {fmtAsOf(region.asOf)} · </>}
              {region.sources.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && ' · '}
                  <a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a>
                </span>
              ))}
            </p>
          )}
        </div>
      )}

      {above.length > 0 && (
        <div className="sl-detail__sats">
          <p className="sl-detail__label">Highest right now</p>
          <ul className="sats">
            {above.slice(0, 3).map((s) => {
              const body = (
                <>
                  <span className="sat__name">{s.name}</span>
                  <span className="sat__meta">#{s.id} · {fmtNum(s.altKm)} km up</span>
                  <span className="sat__alt">{Math.round(s.el)}°</span>
                </>
              )
              return (
                <li key={s.id}>
                  {hasDetailPage(s.id) ? <Link className="sat" to={`/satellite/${s.id}${q}`} onClick={() => track('satellite_opened', { id: s.id, from: 'starlink' })}>{body}</Link> : <span className="sat sat--static">{body}</span>}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </aside>
  )
}

// Always open on desktop; collapsible on phones.
function Caveats() {
  const query = '(min-width: 900px)'
  const [wide, setWide] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setWide(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  const body = (
    <ul className="sl-caveats__list">
      <li><strong>Coverage is not service.</strong> SpaceX turns service on or off by location in software (geofencing). Satellites pass over every country, including ones where Starlink is not licensed or has been switched off.</li>
      <li><strong>No usage data.</strong> Nothing here measures how many dishes are active or who uses them.</li>
      <li><strong>Military satellites aren&rsquo;t included.</strong> SpaceX&rsquo;s Starshield satellites for governments are a separate system and largely absent from public catalogues.</li>
      <li><strong>Latitude, not politics.</strong> The numbers mostly reflect how far a place is from the equator. Compare with Madrid and Quito, shown for reference.</li>
      <li><strong>Predictions drift.</strong> Positions come from orbital models that are accurate to a few kilometres for a day or two; satellites that manoeuvre can be off by more.</li>
    </ul>
  )
  if (wide) {
    return (
      <section className="panel sl-caveats" aria-labelledby="sl-caveats-title">
        <h2 id="sl-caveats-title" className="sl-caveats__title">What this doesn&rsquo;t show</h2>
        {body}
      </section>
    )
  }
  return (
    <details className="panel sl-caveats">
      <summary className="sl-caveats__title">What this doesn&rsquo;t show</summary>
      {body}
    </details>
  )
}
