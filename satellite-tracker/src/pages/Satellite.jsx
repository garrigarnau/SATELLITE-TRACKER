import { useEffect, useMemo, useState } from 'react'
import { useSeo } from '../lib/seo'
import { prettySatName, satelliteMeta } from '../lib/seo-data'
import { Link, useParams } from 'react-router-dom'
import { getTle, getVisualPasses, isQuotaError } from '../lib/api'
import { lookAngles, positionAt, skyPath, toSatrec } from '../lib/orbit'
import { useObserver, observerQuery } from '../lib/observer'
import { useNow } from '../lib/useNow'
import { compass } from '../lib/format'
import LiveTracker from '../components/LiveTracker'
import { TIANGONG_ID } from '../lib/tiangong'
import PassCard from '../components/PassCard'
import { passCloud, sky, useCloudForecast } from '../lib/weather'
import SkyChart from '../components/SkyChart'
import LocationSearch from '../components/LocationSearch'
import { track } from '../lib/track'
import { Notice, Skeleton } from '../components/Status'

export default function Satellite() {
  const { id } = useParams()
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

  useSeo(satelliteMeta(id, prettySatName(id, tle.name), observer?.name))

  if (tle.status === 'error') {
    return (
      <div className="wrap page">
        <Notice tone="error" title="Satellite not found" action={<Link className="btn btn--ghost" to={`/${observerQuery(observer)}`}>Back to tonight</Link>}>
          {tle.message}. Check the NORAD ID ({id}).
        </Notice>
      </div>
    )
  }

  const up = look && look.elevation > 0

  return (
    <div className="wrap page">
      <Link to={`/${observerQuery(observer)}`} className="back">← Tonight</Link>

      <header className="sat-head">
        <div>
          <p className="eyebrow">NORAD {id}</p>
          <h1 className="sat-head__title">{tle.name || <span className="skeleton skeleton--text" />}</h1>
        </div>
        {look && (
          <span className={up ? 'badge badge--up' : 'badge'}>
            {up ? `Above your horizon · ${compass(look.azimuth)}` : 'Below your horizon'}
          </span>
        )}
      </header>

      <LiveTracker satrec={satrec} name={tle.name} pos={pos} look={look} observer={observer} now={now} />
      {Number(id) === TIANGONG_ID && (
        <p className="sat-crosslink">
          <Link to={`/tiangong${observerQuery(observer)}`}>Open the Tiangong page: facts, Tiangong vs ISS and where to see it →</Link>
        </p>
      )}

      {observer ? (
        <Passes id={id} observer={observer} satrec={satrec} now={now} look={look} />
      ) : (
        <section className="section">
          <h2 className="section__title">When can you see it?</h2>
          <p className="section__note">Set your location to get visible passes and a sky chart.</p>
          <LocationSearch onSelect={setObserver} />
        </section>
      )}
    </div>
  )
}

// Also used by the Tiangong page.
export function Passes({ id, observer, satrec, now, look }) {
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
          <p className="eyebrow">From {observer.name}</p>
          <h2 id="sat-passes" className="section__title">Visible passes</h2>
        </div>
        <p className="section__note">Next 10 days. Pick a pass to see its path across your sky.</p>
      </div>

      {state.status === 'loading' && <div className="passes"><Skeleton rows={2} /></div>}
      {state.status === 'error' && (
        <Notice tone="error">
          {state.quota
            ? 'The free pass-prediction quota for this hour is used up. Predictions will be back within the hour.'
            : 'Couldn’t load passes for this satellite.'}
        </Notice>
      )}
      {state.status === 'ready' && !passes.length && (
        <Notice title="No naked-eye passes in the next 10 days">
          It may be too faint, or only crosses your sky in daylight or Earth&rsquo;s shadow. You can still follow it live above.
        </Notice>
      )}

      {pass && (
        <div className="pass-detail">
          <div className="sky-card">
            <SkyChart path={path} pass={pass} current={during ? look : null} />
            <p className="sky-card__caption">
              Face <strong>{pass.startAzCompass}</strong>, it rises to <strong>{Math.round(pass.maxEl)}°</strong> in the {pass.maxAzCompass} and sets in the {pass.endAzCompass}.
              {passSky && <> Forecast: {passSky.phrase} ({Math.round(passCloudPct)}% cloud).</>}
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
                  Show more passes ({passes.length - limit})
                </button>
              </li>
            )}
          </ol>
        </div>
      )}
    </section>
  )
}
