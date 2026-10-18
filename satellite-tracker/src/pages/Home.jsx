import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Marker, Polyline, Tooltip } from 'react-leaflet'
import { CATEGORIES, SPOTLIGHT, getAbove, getTle, getVisualPasses } from '../lib/api'
import { groundTrack, periodMinutes, positionAt, toSatrec } from '../lib/orbit'
import { useObserver, observerQuery } from '../lib/observer'
import { useNow } from '../lib/useNow'
import { fmtNum } from '../lib/format'
import LocationSearch from '../components/LocationSearch'
import PassCard from '../components/PassCard'
import WorldMap, { dotIcon, trackedIcon } from '../components/WorldMap'
import { Notice, Skeleton } from '../components/Status'

export default function Home() {
  const [observer, setObserver] = useObserver()

  if (!observer) {
    return (
      <section className="hero">
        <div className="wrap hero__inner">
          <p className="eyebrow">Look up tonight</p>
          <h1 className="hero__title">See what&rsquo;s flying over you.</h1>
          <p className="hero__lede">
            Find the next time the ISS and other bright satellites cross your sky, and track anything in orbit live.
          </p>
          <LocationSearch onSelect={setObserver} autoFocus />
        </div>
      </section>
    )
  }

  return (
    <div className="wrap page">
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
      if (!ok.length) return setState({ status: 'error', passes: [] })
      const passes = ok.flatMap((r) => r.value.passes).sort((a, b) => a.startUTC - b.startUTC)
      setState({ status: 'ready', passes })
    })
    return () => { alive = false }
  }, [observer.lat, observer.lon]) // eslint-disable-line react-hooks/exhaustive-deps

  const upcoming = useMemo(() => state.passes.filter((p) => p.endUTC * 1000 > now), [state.passes, now])

  return (
    <section className="section" aria-labelledby="passes-title">
      <div className="section__head">
        <div>
          <p className="eyebrow">Next 10 days</p>
          <h2 id="passes-title" className="section__title">Visible passes from {observer.name}</h2>
        </div>
        <p className="section__note">
          Bright satellites you can spot with the naked eye. Passes cluster around dusk and dawn, when your sky is dark but the satellite is still in sunlight.
        </p>
      </div>

      {state.status === 'loading' && <div className="passes"><Skeleton rows={3} /></div>}
      {state.status === 'error' && (
        <Notice tone="error" title="Couldn't load passes">The satellite data service didn't respond. Try again in a few minutes.</Notice>
      )}
      {state.status === 'ready' && !upcoming.length && (
        <Notice title="No visible passes in the next 10 days">
          That happens around midsummer at high latitudes, when the sky never gets dark enough. Check what&rsquo;s overhead below instead.
        </Notice>
      )}
      {upcoming.length > 0 && (
        <>
          <div className="passes">
            {upcoming.slice(0, limit).map((p) => (
              <PassCard key={`${p.satid}-${p.startUTC}`} pass={p} now={now} to={`/satellite/${p.satid}${q}`} />
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

  useEffect(() => {
    let alive = true
    setSelected(null)
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
          {state.list.map((s) =>
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
          {state.status === 'error' && <Notice tone="error">Couldn&rsquo;t reach the satellite data service.</Notice>}
          {state.status === 'ready' && !state.list.length && <Notice>Nothing in this category is above you right now.</Notice>}
          <ul className="sats">
            {state.list.map((s) => (
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
