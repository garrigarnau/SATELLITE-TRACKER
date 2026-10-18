import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Circle, Marker, Polyline, Tooltip, useMap } from 'react-leaflet'
import { getTle, getVisualPasses } from '../lib/api'
import { footprintKm, groundTrack, lookAngles, periodMinutes, positionAt, toSatrec } from '../lib/orbit'
import { useObserver, observerQuery } from '../lib/observer'
import { useNow } from '../lib/useNow'
import { compass, dir, fmtCoord, fmtNum } from '../lib/format'
import { useJsonLd, useSeo } from '../lib/seo'
import { META, SITE } from '../lib/seo-data'
import { useT } from '../lib/i18n'
import { localizePath } from '../lib/paths'
import { passCloud, useCloudForecast } from '../lib/weather'
import {
  STATIONS, STATIONS_COPY, groundDistanceKm, spaceDistanceKm, stationsCompare, stationsJsonLd,
} from '../lib/stations'
import { track } from '../lib/track'
import WorldMap, { dotIcon, trackedIcon } from '../components/WorldMap'
import PassCard from '../components/PassCard'
import LocationSearch from '../components/LocationSearch'
import { Notice, Skeleton, Term } from '../components/Status'
import './tiangong.css'
import './stations.css'

// Track colours per station: the ISS in white, Tiangong in magenta.
const TRACK = {
  iss: { past: '#9a9a9a', future: '#ffffff', footprint: '#ffffff' },
  tg: { past: '#b06ab8', future: '#f700ff', footprint: '#f700ff' },
}

// Both crewed stations live on one map, side by side, with the distance between
// them and the next visible pass of each from the observer.
export default function Stations() {
  const t = useT()
  const c = STATIONS_COPY[t.locale] || STATIONS_COPY.en
  const [observer, setObserver] = useObserver()
  const now = useNow(1000)
  const [tles, setTles] = useState({})
  const [follow, setFollow] = useState('both')
  const q = observerQuery(observer)

  useSeo(META[t.locale].stations)
  useJsonLd('ld-stations', stationsJsonLd(t.locale, `${SITE}${localizePath('/stations', t.locale)}`))

  useEffect(() => {
    let alive = true
    for (const s of STATIONS) {
      getTle(s.id)
        .then((d) => alive && setTles((prev) => ({ ...prev, [s.key]: { status: 'ready', satrec: toSatrec(d) } })))
        .catch((e) => alive && setTles((prev) => ({ ...prev, [s.key]: { status: 'error', message: e.message } })))
    }
    return () => { alive = false }
  }, [])

  const live = STATIONS.map((s) => {
    const satrec = tles[s.key]?.satrec
    return {
      ...s,
      satrec,
      error: tles[s.key]?.status === 'error' ? tles[s.key].message : null,
      pos: satrec ? positionAt(satrec, now) : null,
      look: satrec && observer ? lookAngles(satrec, now, observer) : null,
    }
  })
  const [iss, tg] = live

  const setMode = (mode) => {
    setFollow(mode)
    track('stations_follow', { mode })
  }

  return (
    <div className="wrap page stations">
      <Link to={t.lp(`/${q}`)} className="back">{t('sat.back')}</Link>

      <header className="sat-head">
        <div>
          <p className="eyebrow">{c.eyebrow}</p>
          <h1 className="sat-head__title">{c.title}</h1>
        </div>
      </header>

      <div className="tiangong__intro">
        {c.intro.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
      </div>

      <div className="stations__follow chips" role="radiogroup" aria-label={c.follow}>
        <span className="stations__follow-label" aria-hidden="true">{c.follow}</span>
        {[['both', c.followBoth], ['iss', 'ISS'], ['tiangong', 'Tiangong']].map(([mode, label]) => (
          <button key={mode} type="button" role="radio" aria-checked={follow === mode} className="chip" onClick={() => setMode(mode)}>
            {label}
          </button>
        ))}
      </div>

      <section aria-label={c.mapLabel}>
        <WorldMap center={[20, 40]} zoom={2} className="stations__map">
          {live.map((s) => <StationLayer key={s.key} station={s} now={now} />)}
          {observer && (
            <Marker position={[observer.lat, observer.lon]} icon={dotIcon('you')}>
              <Tooltip>{t('common.you')}</Tooltip>
            </Marker>
          )}
          <Follow mode={follow} iss={iss.pos} tg={tg.pos} />
        </WorldMap>
      </section>

      <section className="stations__distance" aria-labelledby="st-distance">
        <h2 id="st-distance" className="panel__title">{c.distanceTitle}</h2>
        <dl className="stats stations__distance-stats">
          <div className="stat">
            <dt><Term hint={c.distanceGroundHint}>{c.distanceGround}</Term></dt>
            <dd>{iss.pos && tg.pos ? `${fmtNum(groundDistanceKm(iss.pos, tg.pos))} km` : '—'}</dd>
          </div>
          <div className="stat">
            <dt><Term hint={c.distanceSpaceHint}>{c.distanceSpace}</Term></dt>
            <dd>{iss.pos && tg.pos ? `${fmtNum(spaceDistanceKm(iss.pos, tg.pos))} km` : '—'}</dd>
          </div>
        </dl>
      </section>

      <div className="stations__panels">
        {live.map((s) => <StationPanel key={s.key} station={s} copy={c} q={q} />)}
      </div>

      {observer ? (
        <NextPasses observer={observer} now={now} copy={c} q={q} />
      ) : (
        <section className="section">
          <h2 className="section__title">{c.noLocationTitle}</h2>
          <p className="section__note">{c.noLocationNote}</p>
          <LocationSearch onSelect={setObserver} />
        </section>
      )}

      <Compare locale={t.locale} title={c.compareTitle} />
    </div>
  )
}

// One station on the map: footprint, last half orbit, next orbit and the marker.
function StationLayer({ station, now }) {
  const { satrec, pos, variant, short } = station
  const colours = TRACK[variant]
  const trackKey = Math.floor(now.getTime() / 30_000)
  const track = useMemo(() => {
    if (!satrec) return null
    const period = periodMinutes(satrec)
    return { past: groundTrack(satrec, now, period * 0.5, 0), future: groundTrack(satrec, now, 0, period) }
  }, [satrec, trackKey]) // eslint-disable-line react-hooks/exhaustive-deps
  // Built once so the halo animation isn't restarted every tick.
  const icon = useMemo(() => trackedIcon(short, variant), [short, variant])
  if (!pos) return null
  return (
    <>
      {track?.past.map((seg, i) => <Polyline key={`p${i}`} positions={seg} pathOptions={{ color: colours.past, weight: 1.5, opacity: 0.55 }} />)}
      {track?.future.map((seg, i) => <Polyline key={`f${i}`} positions={seg} pathOptions={{ color: colours.future, weight: 1.5, opacity: 0.85, dashArray: '3 6' }} />)}
      <Circle center={[pos.lat, pos.lon]} radius={footprintKm(pos.altKm) * 1000} pathOptions={{ color: colours.footprint, weight: 1, opacity: 0.3, fillColor: colours.footprint, fillOpacity: 0.05 }} />
      <Marker position={[pos.lat, pos.lon]} icon={icon} zIndexOffset={1000} />
    </>
  )
}

// Keeps the map on both stations (refitting every 30 s) or pans with one of them.
function Follow({ mode, iss, tg }) {
  const map = useMap()
  const ready = Boolean(iss && tg)
  const fitKey = Math.floor(Date.now() / 30_000)
  useEffect(() => {
    if (mode !== 'both' || !ready) return
    map.fitBounds([[iss.lat, iss.lon], [tg.lat, tg.lon]], { padding: [60, 60], maxZoom: 4, animate: true })
  }, [map, mode, ready, fitKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const target = mode === 'iss' ? iss : mode === 'tiangong' ? tg : null
  useEffect(() => {
    if (target) map.panTo([target.lat, target.lon], { animate: true })
  }, [map, target?.lat, target?.lon]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

function StationPanel({ station, copy, q }) {
  const t = useT()
  const { pos, look, satrec, error, key, variant } = station
  const name = station.name[t.locale] || station.name.en
  const up = look && look.elevation > 0
  return (
    <article className={`panel stations__panel stations__panel--${variant}`} aria-labelledby={`st-${key}`}>
      <div className="panel__head">
        <h2 id={`st-${key}`} className="stations__name">{name}</h2>
        {look && (
          <span className={up ? 'badge badge--up' : 'badge'}>
            {up ? t('sat.above', { dir: compass(look.azimuth) }) : t('sat.below')}
          </span>
        )}
      </div>
      {error ? (
        <Notice tone="error" title={copy.unavailable}>{error}</Notice>
      ) : pos ? (
        <dl className="stats">
          <Stat label={t('sat.alt')} value={`${fmtNum(pos.altKm)} km`} />
          <Stat label={t('sat.speed')} value={`${fmtNum(pos.speedKmS, 2)} km/s`} />
          <Stat label={t('sat.lat')} value={fmtCoord(pos.lat, 'N', 'S')} />
          <Stat label={t('sat.lon')} value={fmtCoord(pos.lon, 'E', dir('W'))} />
          <Stat label={t('sat.orbit')} value={`${fmtNum(periodMinutes(satrec))} min`} />
          <Stat label={copy.crew} value={station.crew[t.locale] || station.crew.en} />
          {look && (
            <>
              <Stat label={<Term hint={t('sat.azimuthHint')}>{t('sat.azimuth')}</Term>} value={`${fmtNum(look.azimuth)}° ${compass(look.azimuth)}`} />
              <Stat label={<Term hint={t('sat.elevationHint')}>{t('sat.elevation')}</Term>} value={`${fmtNum(look.elevation)}°`} />
            </>
          )}
        </dl>
      ) : (
        <div className="stats"><Skeleton rows={4} className="stat" /></div>
      )}
      <p className="stations__operator">
        <span>{copy.operator}:</span> {station.operator[t.locale] || station.operator.en}
      </p>
      <p className="sat-crosslink">
        <Link to={t.lp(`${station.page}${q}`)}>{copy.openPage[key]}</Link>
      </p>
    </article>
  )
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

// Next naked-eye pass of each station, predicted locally (no API quota).
function NextPasses({ observer, now, copy, q }) {
  const t = useT()
  const weather = useCloudForecast(observer)
  const [state, setState] = useState({})

  useEffect(() => {
    let alive = true
    setState({})
    for (const s of STATIONS) {
      getVisualPasses(s.id, observer)
        .then((r) => alive && setState((prev) => ({ ...prev, [s.key]: { status: 'ready', passes: r.passes } })))
        .catch(() => alive && setState((prev) => ({ ...prev, [s.key]: { status: 'error', passes: [] } })))
    }
    return () => { alive = false }
  }, [observer.lat, observer.lon]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="section" aria-labelledby="st-passes">
      <div className="section__head">
        <div>
          <p className="eyebrow">{observer.name}</p>
          <h2 id="st-passes" className="section__title">{copy.passesTitle}</h2>
        </div>
        <p className="section__note">{copy.passesNote}</p>
      </div>
      <div className="passes">
        {STATIONS.map((s) => {
          const st = state[s.key]
          if (!st) return <Skeleton key={s.key} rows={1} />
          const next = st.passes.find((p) => p.endUTC * 1000 > now.getTime())
          if (!next) {
            return (
              <div key={s.key} className="pass stations__nopass">
                <span className="pass__name">{s.name[t.locale] || s.name.en}</span>
                <span className="section__note">{copy.noPass}</span>
              </div>
            )
          }
          return (
            <PassCard
              key={s.key}
              pass={{ ...next, satname: s.name[t.locale] || s.name.en }}
              now={now.getTime()}
              to={t.lp(`${s.page}${q}`)}
              cloud={passCloud(weather, next)}
            />
          )
        })}
      </div>
    </section>
  )
}

function Compare({ locale, title }) {
  const cmp = stationsCompare(locale)
  return (
    <section className="section" aria-labelledby="st-compare">
      <div className="section__head">
        <h2 id="st-compare" className="section__title">{title}</h2>
        <p className="section__note">{cmp.note}</p>
      </div>
      <div className="compare">
        <table>
          <thead>
            <tr>{cmp.head.map((h, i) => (i ? <th key={h} scope="col">{h}</th> : <td key="corner" />))}</tr>
          </thead>
          <tbody>
            {cmp.rows.map(([label, a, b]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{a}</td>
                <td>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="compare__note">{cmp.footnote}</p>
      <ul className="stations__sources">
        {cmp.sources.map((s) => (
          <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>
        ))}
      </ul>
    </section>
  )
}
