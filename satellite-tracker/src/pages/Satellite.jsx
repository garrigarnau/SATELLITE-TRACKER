import { useEffect, useMemo, useState } from 'react'
import { useSeo } from '../lib/seo'
import { META, prettySatNameFor } from '../lib/seo-data'
import { useT } from '../lib/i18n'
import { Link, useParams } from 'react-router-dom'
import { getTle, getVisualPasses, isQuotaError } from '../lib/api'
import { lookAngles, periodMinutes, positionAt, skyPath, toSatrec } from '../lib/orbit'
import { useObserver, observerQuery } from '../lib/observer'
import { useNow } from '../lib/useNow'
import { compass, dir } from '../lib/format'
import LiveTracker from '../components/LiveTracker'
import { TIANGONG_ID } from '../lib/tiangong'
import PassCard from '../components/PassCard'
import { CLOUDED_OUT, passCloud, sky, useCloudForecast } from '../lib/weather'
import SkyChart from '../components/SkyChart'
import LocationSearch from '../components/LocationSearch'
import { track } from '../lib/track'
import { Notice, Skeleton } from '../components/Status'
import { FACTS, factRows, factSummary, genericSummary, sourceLabel } from '../lib/satellite-facts'
import satcatFallback from '../data/satcat-fallback.json'
import '../lib/satellite-facts.css'

export default function Satellite() {
  const { id } = useParams()
  const t = useT()
  const [observer, setObserver] = useObserver()
  const now = useNow(1000)
  const [tle, setTle] = useState({ status: 'loading' })

  useEffect(() => {
    let alive = true
    setTle({ status: 'loading' })
    getTle(id)
      .then((t) => alive && setTle({ status: 'ready', ...t, satrec: toSatrec(t) }))
      .catch((e) => alive && setTle({ status: 'error', message: e.message }))
    return () => { alive = false }
  }, [id])

  const satrec = tle.satrec
  const pos = satrec ? positionAt(satrec, now) : null
  const look = satrec && observer ? lookAngles(satrec, now, observer) : null

  useSeo(META[t.locale].satellite(id, prettySatNameFor(t.locale, id, tle.name), observer?.name))

  if (tle.status === 'error') {
    return (
      <div className="wrap page">
        <Notice tone="error" title={t('sat.notFound')} action={<Link className="btn btn--ghost" to={t.lp(`/${observerQuery(observer)}`)}>{t('common.backTonight')}</Link>}>
          {t('sat.checkId', { message: tle.message, id })}
        </Notice>
      </div>
    )
  }

  const up = look && look.elevation > 0

  return (
    <div className="wrap page">
      <Link to={t.lp(`/${observerQuery(observer)}`)} className="back">{t('sat.back')}</Link>

      <header className="sat-head">
        <div>
          <p className="eyebrow">NORAD {id}</p>
          <h1 className="sat-head__title">{tle.name ? (t.locale === 'es' ? prettySatNameFor('es', id, tle.name) : tle.name) : <span className="skeleton skeleton--text" />}</h1>
        </div>
        {look && (
          <span className={up ? 'badge badge--up' : 'badge'}>
            {up ? t('sat.above', { dir: compass(look.azimuth) }) : t('sat.below')}
          </span>
        )}
      </header>

      <LiveTracker satrec={satrec} name={tle.name} pos={pos} look={look} observer={observer} now={now} />
      {Number(id) === TIANGONG_ID && (
        <p className="sat-crosslink">
          <Link to={t.lp(`/tiangong${observerQuery(observer)}`)}>{t('sat.tiangongLink')}</Link>
        </p>
      )}

      <SatelliteFacts id={id} name={prettySatNameFor(t.locale, id, tle.name)} satrec={satrec} />

      {observer ? (
        <Passes id={id} observer={observer} satrec={satrec} now={now} look={look} />
      ) : (
        <section className="section">
          <h2 className="section__title">{t('sat.whenTitle')}</h2>
          <p className="section__note">{t('sat.whenNote')}</p>
          <LocationSearch onSelect={setObserver} />
        </section>
      )}
    </div>
  )
}

// Citable "About this satellite" block. Spotlight satellites get hand-checked
// facts plus the CelesTrak SATCAT record the build fetched (/data/satcat.json,
// falling back to the committed snapshot); others get only what the TLE tells us.
let satcatPromise
const loadSatcat = () =>
  (satcatPromise ??= fetch('/data/satcat.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no satcat'))))
    .catch(() => satcatFallback))

function SatelliteFacts({ id, name, satrec }) {
  const t = useT()
  const [catalog, setCatalog] = useState(null)
  useEffect(() => {
    let alive = true
    loadSatcat().then((c) => alive && setCatalog(c))
    return () => { alive = false }
  }, [])

  const rec = catalog?.records?.[id] || null
  const facts = FACTS[id]
  const live = useMemo(() => {
    if (!satrec) return null
    const p = positionAt(satrec, new Date())
    return p && { altKm: p.altKm, periodMin: periodMinutes(satrec), inclination: (satrec.inclo * 180) / Math.PI }
  }, [satrec])

  const rows = factRows(id, rec, live, t.locale)
  const summary = factSummary(id, t.locale) || genericSummary(name, live, t.locale)
  if (!rows.length && !summary) return null

  return (
    <section className="facts" aria-labelledby="facts-title">
      <h2 id="facts-title" className="facts__title">{t('facts.title')}</h2>
      {summary && <p className="facts__summary">{summary}</p>}
      <dl className="facts__list">
        {rows.map(([k, v]) => (
          <div className="facts__row" key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <p className="facts__meta">
        {rec ? t('facts.meta', { date: catalog.fetched }) : t('sat.computed')}
      </p>
      {facts?.sources && (
        <ul className="facts__sources">
          {facts.sources.map((s) => (
            <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{sourceLabel(s, t.locale)}</a></li>
          ))}
        </ul>
      )}
    </section>
  )
}

// Also used by the Tiangong page.
export function Passes({ id, observer, satrec, now, look }) {
  const t = useT()
  const [state, setState] = useState({ status: 'loading', passes: [] })
  const [selected, setSelected] = useState(0)
  const [limit, setLimit] = useState(6)

  useEffect(() => {
    let alive = true
    setState({ status: 'loading', passes: [] })
    setSelected(0)
    getVisualPasses(id, observer)
      .then((r) => alive && setState({ status: 'ready', passes: r.passes }))
      .catch((e) => alive && setState({ status: 'error', passes: [], quota: isQuotaError(e) }))
    return () => { alive = false }
  }, [id, observer.lat, observer.lon]) // eslint-disable-line react-hooks/exhaustive-deps

  const passes = state.passes.filter((p) => p.endUTC * 1000 > now.getTime())
  const pass = passes[selected] || passes[0]
  const path = useMemo(
    () => (satrec && pass ? skyPath(satrec, observer, pass.startUTC, pass.endUTC) : []),
    [satrec, pass?.startUTC, observer.lat, observer.lon], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const during = pass && now.getTime() >= pass.startUTC * 1000 && now.getTime() <= pass.endUTC * 1000
  const weather = useCloudForecast(observer)
  const passCloudPct = pass ? passCloud(weather, pass) : undefined
  const passSky = typeof passCloudPct === 'number' ? sky(passCloudPct) : null

  return (
    <section className="section" aria-labelledby="sat-passes">
      <div className="section__head">
        <div>
          <p className="eyebrow">{t('sat.from', { city: observer.name })}</p>
          <h2 id="sat-passes" className="section__title">{t('sat.passesTitle')}</h2>
        </div>
        <p className="section__note">{t('sat.passesNote')}</p>
      </div>

      {state.status === 'loading' && <div className="passes"><Skeleton rows={2} /></div>}
      {state.status === 'error' && (
        <Notice tone="error">
          {state.quota ? t('passes.quota') : t('sat.passesError')}
        </Notice>
      )}
      {state.status === 'ready' && !passes.length && (
        <Notice title={t('sat.noneTitle')}>{t('sat.noneBody')}</Notice>
      )}

      {pass && (
        <div className="pass-detail">
          <div className="sky-card">
            <SkyChart path={path} pass={pass} current={during ? look : null} />
            <p className="sky-card__caption">
              {t('sat.caption', { start: dir(pass.startAzCompass), el: Math.round(pass.maxEl), max: dir(pass.maxAzCompass), end: dir(pass.endAzCompass) })}
              {passSky && <> {t('sat.forecast', { phrase: skyPhrase(t, passSky, passCloudPct), pct: Math.round(passCloudPct) })}</>}
            </p>
          </div>
          <ol className="pass-list">
            {passes.slice(0, limit).map((p, i) => (
              <li key={p.startUTC}>
                <PassCard pass={p} now={now.getTime()} showName={false} selected={p === pass} onSelect={() => { track('pass_selected', { id }); setSelected(i) }} cloud={passCloud(weather, p)} />
              </li>
            ))}
            {passes.length > limit && (
              <li>
                <button type="button" className="btn btn--ghost" onClick={() => { track('show_more_passes', { page: 'satellite' }); setLimit((l) => l + 6) }}>
                  {t('passes.more', { n: passes.length - limit })}
                </button>
              </li>
            )}
          </ol>
        </div>
      )}
    </section>
  )
}

// Forecast phrase for the sky-card caption, e.g. "clear skies".
function skyPhrase(t, s, pct) {
  if (s.level === 'cloudy' && pct >= CLOUDED_OUT) return t('skyPhrase.cloudedOut')
  return t(`skyPhrase.${s.level}`)
}
