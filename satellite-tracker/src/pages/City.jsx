import { useEffect, useMemo } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { useSeo, useJsonLd } from '../lib/seo'
import { useT } from '../lib/i18n'
import { cityBySlug, cityCopy, cityJsonLd, cityMeta, cityPath, cityQuery, nearbyCities } from '../lib/cities'
import { track } from '../lib/track'
import { enCitySlug, localizePath } from '../lib/paths'
import { Passes } from './Home'
import '../components/cities.css'
import '../components/faq.css'

// Landing page for "ISS tonight over {city}" searches: why and how the city can
// see the stations, its live visible passes, and links to nearby cities.
export default function City() {
  const { slug } = useParams()
  const t = useT()
  const { search } = useLocation()
  const locale = t.locale
  // Either language's slug finds the city; a non-canonical one is redirected below
  // (e.g. the old /es/esta-noche/london → /es/esta-noche/londres).
  const city = cityBySlug(enCitySlug(slug))
  const canonicalPath = city ? localizePath(cityPath(city.slug), locale) : null

  useSeo(city ? cityMeta(city, locale) : {})
  useJsonLd('ld-city', city ? cityJsonLd(city, locale) : {})

  useEffect(() => {
    if (city) track('city_page', { city: city.slug })
  }, [city])

  const observer = useMemo(
    () => (city ? { lat: city.lat, lon: city.lon, alt: 0, name: city.name[locale] } : null),
    [city, locale],
  )

  if (city && !canonicalPath.endsWith(`/${slug}`)) {
    return <Navigate replace to={canonicalPath + search} />
  }

  if (!city) {
    return (
      <div className="wrap page">
        <h1 className="section__title">{t('notFound.title')}</h1>
        <p className="section__note">{t('notFound.body')}</p>
        <Link className="btn" to={t.lp('/')}>{t('common.backTonight')}</Link>
      </div>
    )
  }

  const copy = cityCopy(city, locale)
  const q = cityQuery(city, locale)

  return (
    <div className="wrap page city">
      <header className="city__head">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 className="sat-head__title">{copy.h1}</h1>
      </header>

      <div className="city__intro">
        {copy.intro.map((p) => <p key={p.slice(0, 32)}>{p}</p>)}
      </div>

      <p className="city__links">
        <Link className="btn" to={t.lp(`/${q}`)}>{copy.openFull}</Link>
        <span className="city__stations">
          {copy.stations}: <Link to={t.lp(`/satellite/25544${q}`)}>{copy.issLink}</Link> · <Link to={t.lp(`/tiangong${q}`)}>{copy.tgLink}</Link>
        </span>
      </p>

      <Passes observer={observer} seo={false} />
      <p className="section__note city__live">{copy.passesNote}</p>

      <section className="section" aria-labelledby="city-faq">
        <div className="section__head">
          <h2 id="city-faq" className="section__title">{copy.faqTitle}</h2>
        </div>
        <div className="faq">
          {copy.faq.map(({ q: question, a }) => (
            <details key={question} className="faq__item">
              <summary>{question}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <nav className="section city__nearby" aria-labelledby="city-nearby">
        <h2 id="city-nearby" className="eyebrow">{copy.nearbyTitle}</h2>
        <ul className="cities__list">
          {nearbyCities(city).map((c) => (
            <li key={c.slug}><Link to={t.lp(cityPath(c.slug))}>{c.name[locale]}</Link></li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
