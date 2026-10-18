import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTle } from '../lib/api'
import { lookAngles, positionAt, toSatrec } from '../lib/orbit'
import { useObserver, observerQuery } from '../lib/observer'
import { useNow } from '../lib/useNow'
import { compass } from '../lib/format'
import { useSeo } from '../lib/seo'
import { META } from '../lib/seo-data'
import { useT } from '../lib/i18n'
import { TIANGONG_COPY, TIANGONG_ID, tiangongFaqJsonLd } from '../lib/tiangong'
import { track } from '../lib/track'
import LiveTracker from '../components/LiveTracker'
import LocationSearch from '../components/LocationSearch'
import { Notice } from '../components/Status'
import { Passes } from './Satellite'
import './tiangong.css'

// Landing page for people searching for China's space station: what it is,
// where it is right now, when to see it, and how it compares with the ISS.
export default function Tiangong() {
  const tr = useT()
  const t = TIANGONG_COPY[tr.locale] || TIANGONG_COPY.en
  const [observer, setObserver] = useObserver()
  const now = useNow(1000)
  const [tle, setTle] = useState({ status: 'loading' })

  useSeo(META[tr.locale].tiangong)

  useEffect(() => {
    track('tiangong_opened')
  }, [])

  useEffect(() => {
    let alive = true
    getTle(TIANGONG_ID)
      .then((d) => alive && setTle({ status: 'ready', ...d, satrec: toSatrec(d) }))
      .catch((e) => alive && setTle({ status: 'error', message: e.message }))
    return () => { alive = false }
  }, [])

  const satrec = tle.satrec
  const pos = satrec ? positionAt(satrec, now) : null
  const look = satrec && observer ? lookAngles(satrec, now, observer) : null
  const up = look && look.elevation > 0

  return (
    <div className="wrap page tiangong">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tiangongFaqJsonLd(t)) }} />
      <Link to={tr.lp(`/${observerQuery(observer)}`)} className="back">{tr('sat.back')}</Link>

      <header className="sat-head">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="sat-head__title">{t.title}</h1>
        </div>
        {look && (
          <span className={up ? 'badge badge--up' : 'badge'}>
            {up ? tr('sat.above', { dir: compass(look.azimuth) }) : tr('sat.below')}
          </span>
        )}
      </header>

      <div className="tiangong__intro">
        {t.intro.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
      </div>

      {tle.status === 'error' ? (
        <Notice tone="error" title={tr('tg.unavailable')}>{tle.message}</Notice>
      ) : (
        <LiveTracker satrec={satrec} name="Tiangong" pos={pos} look={look} observer={observer} now={now} />
      )}

      {observer ? (
        <Passes id={TIANGONG_ID} observer={observer} satrec={satrec} now={now} look={look} />
      ) : (
        <section className="section">
          <h2 className="section__title">{t.noLocationTitle}</h2>
          <p className="section__note">{t.noLocationNote}</p>
          <LocationSearch onSelect={setObserver} />
        </section>
      )}

      <section className="section" aria-labelledby="tg-compare">
        <div className="section__head">
          <h2 id="tg-compare" className="section__title">{t.compareTitle}</h2>
          <p className="section__note">{t.compareNote}</p>
        </div>
        <div className="compare">
          <table>
            <thead>
              <tr>{t.compareHead.map((h, i) => (i ? <th key={h} scope="col">{h}</th> : <td key="corner" />))}</tr>
            </thead>
            <tbody>
              {t.compare.map(([label, tg, iss]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <td>{tg}</td>
                  <td>{iss}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="compare__note">{t.compareFootnote}</p>
      </section>

      <section className="section" aria-labelledby="tg-faq">
        <div className="section__head">
          <h2 id="tg-faq" className="section__title">{t.faqTitle}</h2>
        </div>
        <div className="faq">
          {t.faq.map(({ q, a }) => (
            <details key={q} className="faq__item">
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section tiangong__sources" aria-labelledby="tg-sources">
        <h2 id="tg-sources" className="eyebrow">{t.sourcesTitle}</h2>
        <ul>
          {t.sources.map((s) => (
            <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>
          ))}
        </ul>
      </section>
    </div>
  )
}
