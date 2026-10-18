import { Link } from 'react-router-dom'
import { useT } from '../lib/i18n'
import { CITIES, CITY_LIST_COPY, cityPath } from '../lib/cities'
import './cities.css'

// Compact list of city pages, grouped by country, for the landing page.
export default function CityList() {
  const t = useT()
  const copy = CITY_LIST_COPY[t.locale] || CITY_LIST_COPY.en
  const groups = []
  for (const c of CITIES) {
    const g = groups.find((x) => x.cc === c.cc)
    if (g) g.cities.push(c)
    else groups.push({ cc: c.cc, country: c.country[t.locale], cities: [c] })
  }

  return (
    <section className="section cities" aria-labelledby="cities-title">
      <div className="section__head">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id="cities-title" className="section__title">{copy.title}</h2>
        </div>
        <p className="section__note">{copy.note}</p>
      </div>
      <div className="cities__groups">
        {groups.map((g) => (
          <div key={g.cc} className="cities__group">
            <h3 className="cities__country">{g.country}</h3>
            <ul className="cities__list">
              {g.cities.map((c) => (
                <li key={c.slug}>
                  <Link to={t.lp(cityPath(c.slug))}>{c.name[t.locale]}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
