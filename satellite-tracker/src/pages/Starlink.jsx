import { useEffect, useMemo, useState } from 'react'
import { useSeo } from '../lib/seo'
import { META } from '../lib/seo-data'
import { intlLocale, regionText, useT } from '../lib/i18n'
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

// Day-first dates in both languages ("17 Feb 2026" / "17 feb 2026").
const dateLocale = (locale) => intlLocale(locale) || 'en-GB'
const monthFmt = (l) => new Intl.DateTimeFormat(dateLocale(l), { month: 'short', year: 'numeric', timeZone: 'UTC' })
const dayFmt = (l) => new Intl.DateTimeFormat(dateLocale(l), { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const utcFmt = (l) => new Intl.DateTimeFormat(dateLocale(l), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
// "2026-02-17" -> "17 Feb 2026", "2024-02" -> "Feb 2024".
const fmtAsOf = (s, l) => (s.length <= 7 ? monthFmt(l).format(new Date(`${s}-01T00:00Z`)) : dayFmt(l).format(new Date(`${s}T00:00Z`)))
const mean = (v) => (v?.length ? v.reduce((a, b) => a + b, 0) / v.length : null)

export default function Starlink() {
  const t = useT()
  const L = t.locale
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

  useSeo(META[L].starlink)

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
          <p className="eyebrow">{t('sl.eyebrow')}</p>
          <h1 className="sl-head__title">{t('sl.title')}</h1>
        </div>
        <div className="sl-head__side">
          <div className="chips" role="radiogroup" aria-label={t('sl.minElevation')}>
            {THRESHOLDS.map((t, i) => (
              <button key={t} type="button" role="radio" aria-checked={i === tIndex} className="chip" onClick={() => setTIndex(i)}>
                ≥{t}°
              </button>
            ))}
          </div>
          <p className="sl-head__meta">
            {meta
              ? t('sl.dataFull', { n: fmtNum(meta.count), date: utcFmt(L).format(meta.newestEpoch) })
              : t('sl.data')}
          </p>
        </div>
      </header>

      <p className="sl-lede">{t('sl.lede')}</p>
      <p className="sl-banner">
        <strong>{t('sl.bannerStrong')}</strong> {t('sl.banner')}
      </p>

      {cov.status === 'error' && (
        <Notice tone="error" title={t('sl.errorTitle')}>{t('sl.error', { error: cov.error })}</Notice>
      )}
      {stale && (
        <Notice title={t('sl.staleTitle')}>{t('sl.stale', { date: utcFmt(L).format(meta.newestEpoch) })}</Notice>
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
                <Tooltip>{t('sl.satTip', { name: s.name, el: Math.round(s.el) })}</Tooltip>
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
                <Tooltip>{regionText(r, 'label', L)}</Tooltip>
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

        <section className="sl-cards" aria-label={t('sl.regions')}>
          <div className="sl-grid">
            {REGIONS.filter((r) => r.kind !== 'control').map((r) => (
              <RegionCard key={r.id} region={r} index={REGIONS.indexOf(r)} {...{ counts, series, sharedMax, selectedId, select, loading }} />
            ))}
          </div>
          <p className="sl-cards__label">{t('sl.reference')}</p>
          <div className="sl-grid sl-grid--ref">
            {REGIONS.filter((r) => r.kind === 'control').map((r) => (
              <RegionCard key={r.id} region={r} index={REGIONS.indexOf(r)} {...{ counts, series, sharedMax, selectedId, select, loading }} />
            ))}
          </div>
        </section>
      </div>

      <section className="sl-notes">
        <div className="sl-note">
          <h2 className="sl-note__title">{t('sl.howTitle')}</h2>
          <p>{t('sl.how1')}</p>
          <p>
            {t('sl.how2')}
            {cov.plan.lite && t('sl.lite')}
          </p>
        </div>
        <div className="sl-note">
          <h2 className="sl-note__title">{t('sl.sources')}</h2>
          <ul className="sl-sources">
            {REGIONS.filter((r) => r.sources?.length).map((r) => (
              <li key={r.id}>
                <span>{regionText(r, 'label', L)}:</span>{' '}
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
            {t('sl.attrib1')} <a href="https://celestrak.org/NORAD/elements/" target="_blank" rel="noreferrer">CelesTrak</a>{' '}
            {t('sl.attrib2', { date: fmtAsOf(data.reviewed, L) })}
            {reviewedDays > REVIEW_MAX_DAYS && t('sl.outdated')}
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
  const t = useT()
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
        <span className="rcard__name">{regionText(region, 'label', t.locale)}</span>
        <span className="rcard__country">{regionText(region, 'country', t.locale)}</span>
      </span>
      <span className="rcard__row">
        <span className="rcard__count">{loading || counts == null ? <span className="skeleton skeleton--text rcard__skel" /> : counts[index]}</span>
        <Sparkline values={values} max={sharedMax} />
      </span>
      <span className="rcard__meta">{avg != null ? t('sl.avg', { n: Math.round(avg) }) : t('sl.forecasting')}</span>
      {!control && <span className="rcard__ctx">{regionText(region, 'context', t.locale)}</span>}
    </button>
  )
}

function Detail({ region, count, values, stepMin, max, threshold, above, loading, q }) {
  const t = useT()
  const L = t.locale
  const lo = values ? Math.min(...values) : null
  const hi = values ? Math.max(...values) : null
  const avg = mean(values)
  return (
    <aside className="panel sl-detail" aria-labelledby="sl-detail-title">
      <p className="eyebrow">{t('sl.selected', { t: threshold })}</p>
      <h2 id="sl-detail-title" className="sl-detail__name">
        {regionText(region, 'label', L)} <span>{regionText(region, 'country', L)}</span>
      </h2>
      <p className="sl-detail__count" aria-live="polite">
        {loading || count == null ? <span className="skeleton skeleton--text" /> : <strong>{count}</strong>}
        <span>
          {t('sl.countText', { t: threshold })}{' '}
          <Term hint={t('sl.nowHint')}>{t('sl.now')}</Term>
        </span>
      </p>
      <Sparkline values={values} max={max} stepMin={stepMin} width={260} height={56} interactive />
      <dl className="stats sl-detail__stats">
        <div className="stat"><dt>{t('sl.min')}</dt><dd>{lo ?? '—'}</dd></div>
        <div className="stat"><dt>{t('sl.max')}</dt><dd>{hi ?? '—'}</dd></div>
        <div className="stat"><dt>{t('sl.average')}</dt><dd>{avg != null ? Math.round(avg) : '—'}</dd></div>
        <div className="stat"><dt>{t('sl.window')}</dt><dd>90 min</dd></div>
      </dl>

      {region.context && (
        <div className="sl-detail__ctx">
          <p>{regionText(region, 'context', L)}</p>
          {region.sources?.length > 0 && (
            <p className="sl-detail__src">
              {region.asOf && <>{t('sl.asOf', { date: fmtAsOf(region.asOf, L) })} · </>}
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
          <p className="sl-detail__label">{t('sl.highest')}</p>
          <ul className="sats">
            {above.slice(0, 3).map((s) => {
              const body = (
                <>
                  <span className="sat__name">{s.name}</span>
                  <span className="sat__meta">{t('sl.satMeta', { id: s.id, alt: fmtNum(s.altKm) })}</span>
                  <span className="sat__alt">{Math.round(s.el)}°</span>
                </>
              )
              return (
                <li key={s.id}>
                  {hasDetailPage(s.id) ? <Link className="sat" to={t.lp(`/satellite/${s.id}${q}`)} onClick={() => track('satellite_opened', { id: s.id, from: 'starlink' })}>{body}</Link> : <span className="sat sat--static">{body}</span>}
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
  const t = useT()
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
      {[1, 2, 3, 4, 5].map((i) => (
        <li key={i}><strong>{t(`sl.c${i}s`)}</strong> {t(`sl.c${i}`)}</li>
      ))}
    </ul>
  )
  if (wide) {
    return (
      <section className="panel sl-caveats" aria-labelledby="sl-caveats-title">
        <h2 id="sl-caveats-title" className="sl-caveats__title">{t('sl.caveatsTitle')}</h2>
        {body}
      </section>
    )
  }
  return (
    <details className="panel sl-caveats">
      <summary className="sl-caveats__title">{t('sl.caveatsTitle')}</summary>
      {body}
    </details>
  )
}
