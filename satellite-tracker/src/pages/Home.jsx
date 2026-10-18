import { useEffect, useMemo, useState } from 'react'
import { useSeo } from '../lib/seo'
import { DEFAULT_META, homeMetaFor, prettySatName } from '../lib/seo-data'
import { Link, useSearchParams } from 'react-router-dom'
import { Marker, Polyline, Tooltip } from 'react-leaflet'
import { CATEGORIES, SPOTLIGHT, getAbove, getTle, getVisualPasses, isQuotaError } from '../lib/api'
import { groundTrack, periodMinutes, positionAt, toSatrec } from '../lib/orbit'
import { useObserver, observerQuery } from '../lib/observer'
import { useNow } from '../lib/useNow'
import { fmtDay, fmtNum, fmtTime } from '../lib/format'
import LocationSearch from '../components/LocationSearch'
import HeroSky from '../components/HeroSky'
import PassCard from '../components/PassCard'
import { CLOUDED_OUT, passCloud, useCloudForecast } from '../lib/weather'
import WorldMap, { dotIcon, trackedIcon } from '../components/WorldMap'
import { Notice, Skeleton } from '../components/Status'
import Ownership from '../components/Ownership'
import { ownershipBreakdown, useOwnership } from '../lib/celestrak'

export default function Home() {
  const [observer, setObserver] = useObserver()
  useSeo(observer ? homeMetaFor(observer.name) : DEFAULT_META)

  if (!observer) {
    return (
      <section className="hero">
        <HeroSky />
        <div className="wrap hero__inner">
          <p className="eyebrow">Look up tonight</p>
          <h1 className="hero__title">See what&rsquo;s flying over you.</h1>
          <p className="hero__lede">
            Find the next time the ISS and other bright satellites cross your sky, and track anything in orbit live.
          </p>
          <LocationSearch onSelect={setObserver} autoFocus />

          <div className="hero__sep" role="separator" aria-hidden="true"><span>Also on Satellite Tracker</span></div>

          <aside className="promo" aria-labelledby="promo-title">
            <div className="promo__text">
              <p className="eyebrow">New · Starlink over contested regions</p>
              <p id="promo-title" className="promo__title">Who&rsquo;s overhead in Kyiv, Tehran or Caracas?</p>
              <p className="promo__body">
                Starlink has become part of wars and politics, from Ukraine&rsquo;s front line to Iran&rsquo;s ban. We count how
                many of its satellites are above these places right now, and explain why coverage isn&rsquo;t the same as service.
              </p>
            </div>
            <Link to="/starlink" className="btn promo__cta">Open the Starlink page →</Link>
          </aside>
        </div>
      </section>
    )
  }

  return (
    <div className="wrap page">
      <h1 className="sr-only">ISS and satellite passes over {observer.name}</h1>
      <Passes observer={observer} />
      <Overhead observer={observer} />
    </div>
  )
}

const PAGE = 6

function Passes({ observer }) {
  const now = useNow(1000).getTime()
  const [state, setState] = useState({ status: 'loading', passes: [] })
  const [limit, setLimit] = useState(PAGE)
  const q = observerQuery(observer)

  useEffect(() => {
    let alive = true
    setState({ status: 'loading', passes: [] })
    setLimit(PAGE)
    Promise.allSettled(SPOTLIGHT.map((id) => getVisualPasses(id, observer))).then((results) => {
      if (!alive) return
      const ok = results.filter((r) => r.status === 'fulfilled')
      if (!ok.length) return setState({ status: 'error', passes: [], quota: results.some((r) => isQuotaError(r.reason)) })
      const passes = ok.flatMap((r) => r.value.passes).sort((a, b) => a.startUTC - b.startUTC)
      setState({ status: 'ready', passes })
    })
    return () => { alive = false }
  }, [observer.lat, observer.lon]) // eslint-disable-line react-hooks/exhaustive-deps

  const weather = useCloudForecast(observer)
  const [hideCloudy, setHideCloudy] = useState(false)
  const future = useMemo(() => state.passes.filter((p) => p.endUTC * 1000 > now), [state.passes, now])
  const isCloudy = (p) => { const c = passCloud(weather, p); return typeof c === 'number' && c >= CLOUDED_OUT }
  const cloudyCount = future.filter(isCloudy).length
  const upcoming = hideCloudy ? future.filter((p) => !isCloudy(p)) : future

  // Once passes are known, the page description names the next one.
  const next = future[0]
  const nextDay = next && fmtDay(next.startUTC)
  useSeo(
    homeMetaFor(
      observer.name,
      next && `${prettySatName(next.satid, next.satname)}, ${/^(Tonight|Tomorrow)$/.test(nextDay) ? nextDay.toLowerCase() : `on ${nextDay}`} at ${fmtTime(next.startUTC)}`,
    ),
  )

  return (
    <section className="section" aria-labelledby="passes-title">
      <div className="section__head">
        <div>
          <p className="eyebrow">Next 10 days</p>
          <h2 id="passes-title" className="section__title">Visible passes from {observer.name}</h2>
        </div>
        <div>
          <p className="section__note">
            Bright satellites you can spot with the naked eye. Passes cluster around dusk and dawn, when your sky is dark but the satellite is still in sunlight.
          </p>
          {(cloudyCount > 0 || hideCloudy) && (
            <label className="sky-toggle">
              <input type="checkbox" checked={hideCloudy} onChange={(e) => setHideCloudy(e.target.checked)} />
              Hide cloudy passes ({cloudyCount})
            </label>
          )}
        </div>
      </div>

      {state.status === 'loading' && <div className="passes"><Skeleton rows={3} /></div>}
      {state.status === 'error' && (
        <Notice tone="error" title="Couldn't load passes">
          {state.quota
            ? 'The free pass-prediction quota for this hour is used up. Predictions will be back within the hour.'
            : "The satellite data service didn't respond. Try again in a few minutes."}
        </Notice>
      )}
      {future.length > 0 && !upcoming.length && <Notice>Every pass in the forecast window looks clouded out.</Notice>}
      {state.status === 'ready' && !future.length && (
        <Notice title="No visible passes in the next 10 days">
          That happens around midsummer at high latitudes, when the sky never gets dark enough. Check what&rsquo;s overhead below instead.
        </Notice>
      )}
      {upcoming.length > 0 && (
        <>
          <div className="passes">
            {upcoming.slice(0, limit).map((p) => (
              <PassCard key={`${p.satid}-${p.startUTC}`} pass={p} now={now} to={`/satellite/${p.satid}${q}`} cloud={passCloud(weather, p)} />
            ))}
          </div>
          {upcoming.length > limit && (
            <button type="button" className="btn btn--ghost" onClick={() => setLimit((l) => l + PAGE)}>
              Show more passes ({upcoming.length - limit})
            </button>
          )}
        </>
      )}
    </section>
  )
}

function Overhead({ observer }) {
  const [params, setParams] = useSearchParams()
  const category = Number(params.get('cat')) || CATEGORIES[0].id
  const [state, setState] = useState({ status: 'loading', list: [] })
  const [selected, setSelected] = useState(null)
  const q = observerQuery(observer)

  const [ownerFilter, setOwnerFilter] = useState(null)
  const ownership = useOwnership(state.status === 'ready' ? state.list : [], category)
  const buckets = useMemo(() => ownershipBreakdown(state.list, ownership.owners), [state.list, ownership.owners])
  const militaryCount = ownership.military ? state.list.filter((s) => ownership.military.has(s.satid)).length : 0
  const filterIds = buckets.find((b) => b.key === ownerFilter)?.ids
  const shown = filterIds ? state.list.filter((s) => filterIds.has(s.satid)) : state.list

  useEffect(() => {
    let alive = true
    setSelected(null)
    setOwnerFilter(null)
    setState((s) => ({ status: 'loading', list: s.list }))
    getAbove(observer, category)
      .then((list) => alive && setState({ status: 'ready', list: [...list].sort((a, b) => a.satalt - b.satalt) }))
      .catch(() => alive && setState({ status: 'error', list: [] }))
    return () => { alive = false }
  }, [observer.lat, observer.lon, category]) // eslint-disable-line react-hooks/exhaustive-deps

  const setCategory = (id) =>
    setParams((prev) => {
      const p = new URLSearchParams(prev)
      p.set('cat', id)
      return p
    }, { replace: true })

  return (
    <section className="section" aria-labelledby="overhead-title">
      <div className="section__head">
        <div>
          <p className="eyebrow">Right now</p>
          <h2 id="overhead-title" className="section__title">Overhead</h2>
        </div>
        <p className="section__note">Satellites currently within 70° of straight up from you. Pick one to follow it live.</p>
      </div>

      <div className="chips" role="radiogroup" aria-label="Satellite category">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={c.id === category}
            className="chip"
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="overhead">
        <WorldMap center={[observer.lat, observer.lon]} zoom={3} className="overhead__map">
          <Marker position={[observer.lat, observer.lon]} icon={dotIcon('you')}>
            <Tooltip>You</Tooltip>
          </Marker>
          {shown.map((s) =>
            s.satid === selected?.satid ? null : (
              <Marker key={s.satid} position={[s.satlat, s.satlng]} icon={dotIcon('sat')} eventHandlers={{ click: () => setSelected(s) }}>
                <Tooltip>{s.satname}</Tooltip>
              </Marker>
            ),
          )}
          {selected && <Trajectory sat={selected} />}
        </WorldMap>

        <div className="overhead__list">
          <p className="overhead__count" aria-live="polite">
            {state.status === 'loading' ? 'Scanning the sky…' : `${state.list.length} above you`}
          </p>
          {category === 52 && (
            <Link className="overhead__more" to={`/starlink${q}`}>How many are over Kyiv, Tehran or Caracas right now? →</Link>
          )}
          {state.status === 'error' && <Notice tone="error">Couldn&rsquo;t reach the satellite data service.</Notice>}
          {state.status === 'ready' && !state.list.length && <Notice>Nothing in this category is above you right now.</Notice>}
          <Ownership
            status={state.status === 'ready' ? ownership.status : 'idle'}
            buckets={buckets}
            total={state.list.length}
            militaryCount={militaryCount}
            filter={ownerFilter}
            onFilter={setOwnerFilter}
          />
          <ul className="sats">
            {shown.map((s) => (
              <li key={s.satid}>
                <button
                  type="button"
                  className={s.satid === selected?.satid ? 'sat is-active' : 'sat'}
                  aria-pressed={s.satid === selected?.satid}
                  onClick={() => setSelected(s.satid === selected?.satid ? null : s)}
                >
                  <span className="sat__name">{s.satname}</span>
                  <span className="sat__meta">#{s.satid}</span>
                  <span className="sat__alt">{fmtNum(s.satalt)} km</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {selected && <SelectedCard sat={selected} to={`/satellite/${selected.satid}${q}`} onClose={() => setSelected(null)} />}
    </section>
  )
}

// Orbit of the satellite picked on the overhead map: where it has been, where
// it is going, and where it is now, all propagated locally from its TLE.
function Trajectory({ sat }) {
  const [satrec, setSatrec] = useState(null)
  const now = useNow(1000)

  useEffect(() => {
    let alive = true
    setSatrec(null)
    getTle(sat.satid)
      .then((t) => alive && setSatrec(toSatrec(t)))
      .catch(() => {})
    return () => { alive = false }
  }, [sat.satid])

  const icon = useMemo(() => trackedIcon(sat.satname), [sat.satname])
  const trackKey = Math.floor(now.getTime() / 30_000)
  const track = useMemo(() => {
    if (!satrec) return null
    const period = periodMinutes(satrec)
    return { past: groundTrack(satrec, now, period * 0.5, 0), future: groundTrack(satrec, now, 0, period) }
  }, [satrec, trackKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const pos = satrec ? positionAt(satrec, now) : null
  const at = pos ? [pos.lat, pos.lon] : [sat.satlat, sat.satlng]

  return (
    <>
      {track?.past.map((seg, i) => <Polyline key={`p${i}`} positions={seg} pathOptions={{ color: '#b06ab8', weight: 1.5, opacity: 0.55 }} />)}
      {track?.future.map((seg, i) => <Polyline key={`f${i}`} positions={seg} pathOptions={{ color: '#ffffff', weight: 1.5, opacity: 0.85, dashArray: '3 6' }} />)}
      <Marker position={at} icon={icon} zIndexOffset={1000} />
    </>
  )
}

function SelectedCard({ sat, to, onClose }) {
  return (
    <div className="picked" role="status">
      <div className="picked__info">
        <p className="eyebrow">Selected · NORAD {sat.satid}</p>
        <p className="picked__name">{sat.satname}</p>
        <p className="picked__meta">
          {fmtNum(sat.satalt)} km up · solid line: last half orbit · dashed: next orbit
        </p>
      </div>
      <div className="picked__actions">
        <Link to={to} className="btn">Track live →</Link>
        <button type="button" className="btn btn--ghost" onClick={onClose}>Clear</button>
      </div>
    </div>
  )
}
