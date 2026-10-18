import { faqFor, faqJsonLd } from '../lib/faq'
import { intlLocale, useT } from '../lib/i18n'
import { useJsonLd } from '../lib/seo'
import './faq.css'

// Build date injected by Vite (see vite.config.js); shown as a freshness line.
const UPDATED = typeof __BUILD_DATE__ === 'string' ? __BUILD_DATE__ : null
const fmtDate = (iso, locale) => new Intl.DateTimeFormat(intlLocale(locale), { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${iso}T00:00:00Z`))

export default function Faq({ id = 'faq' }) {
  const t = useT()
  const items = faqFor(t.locale)
  useJsonLd('faq-jsonld', faqJsonLd(items))
  return (
    <section className="faq" aria-labelledby={`${id}-title`}>
      <div className="faq__head">
        <h2 id={`${id}-title`} className="section__title">{t('faq.title')}</h2>
        {UPDATED && (
          <p className="faq__updated">
            {t('faq.updated')} <time dateTime={UPDATED}>{fmtDate(UPDATED, t.locale)}</time> · {t('faq.refreshed')}
          </p>
        )}
      </div>
      <div className="faq__list">
        {items.map(({ q, a, sources }) => (
          <details key={q} className="faq__item">
            <summary>{q}</summary>
            <p>{a}</p>
            {sources?.length > 0 && (
              <p className="faq__sources">
                {t(sources.length > 1 ? 'faq.sources' : 'faq.source')}:{' '}
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
