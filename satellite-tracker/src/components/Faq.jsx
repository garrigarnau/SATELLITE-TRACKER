import { FAQ, faqJsonLd } from '../lib/faq'
import { useJsonLd } from '../lib/seo'
import './faq.css'

// Build date injected by Vite (see vite.config.js); shown as a freshness line.
const UPDATED = typeof __BUILD_DATE__ === 'string' ? __BUILD_DATE__ : null
const fmtDate = (iso) => new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${iso}T00:00:00Z`))

export default function Faq({ id = 'faq' }) {
  useJsonLd('faq-jsonld', faqJsonLd())
  return (
    <section className="faq" aria-labelledby={`${id}-title`}>
      <div className="faq__head">
        <h2 id={`${id}-title`} className="section__title">Questions about spotting satellites</h2>
        {UPDATED && (
          <p className="faq__updated">
            Last updated <time dateTime={UPDATED}>{fmtDate(UPDATED)}</time> · orbital data refreshed every few hours
          </p>
        )}
      </div>
      <div className="faq__list">
        {FAQ.map(({ q, a, sources }) => (
          <details key={q} className="faq__item">
            <summary>{q}</summary>
            <p>{a}</p>
            {sources?.length > 0 && (
              <p className="faq__sources">
                Source{sources.length > 1 ? 's' : ''}:{' '}
                {sources.map((s, i) => (
                  <span key={s}>
                    {i > 0 && ', '}
                    <a href={s} target="_blank" rel="noreferrer">{new URL(s).hostname.replace(/^www\./, '')}</a>
                  </span>
                ))}
              </p>
            )}
          </details>
        ))}
      </div>
    </section>
  )
}
