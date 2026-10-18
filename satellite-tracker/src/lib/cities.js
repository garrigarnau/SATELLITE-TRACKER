// City landing pages (/tonight/{slug}, /es/esta-noche/{slug}): data, copy and
// metadata. Plain JS only, so the prerender script can bake the same text into
// static HTML. Coordinates come from OpenCage (geocoded once, committed).
//
// The visibility sentences are computed from the city's latitude and the two
// stations' orbital inclinations, never hand-written per city.
import CITIES from '../data/cities.json' with { type: 'json' }
import { SITE, SITE_NAME } from './seo-data.js'
import { localizePath } from './paths.js'

export { CITIES }

export const cityBySlug = (slug) => CITIES.find((c) => c.slug === slug)
export const cityPath = (slug) => `/tonight/${slug}`

const ISS_INCLINATION = 51.6
const TIANGONG_INCLINATION = 41.5
// Earth-centre angle between a station's ground point and an observer who sees it
// 10° above the horizon: ~12.5° for the ISS (~420 km up), ~11.8° for Tiangong
// (~385 km). Beyond inclination + this, the station never climbs 10° high.
const ISS_REACH = ISS_INCLINATION + 12.5
const TIANGONG_REACH = TIANGONG_INCLINATION + 11.8

// 'overhead' | 'low' | 'never' for a station, from the observer's latitude.
function band(lat, inclination, reach) {
  const a = Math.abs(lat)
  if (a <= inclination) return 'overhead'
  if (a <= reach) return 'low'
  return 'never'
}

export const issBand = (city) => band(city.lat, ISS_INCLINATION, ISS_REACH)
export const tiangongBand = (city) => band(city.lat, TIANGONG_INCLINATION, TIANGONG_REACH)

const coord = (v, pos, neg, locale) =>
  `${Math.abs(v).toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 2 })}° ${v >= 0 ? pos : neg}`

// Nearest other cities in the same country (then anywhere), for internal links.
export function nearbyCities(city, n = 6) {
  const d = (c) => (c.lat - city.lat) ** 2 + ((c.lon - city.lon) * Math.cos((city.lat * Math.PI) / 180)) ** 2
  const others = CITIES.filter((c) => c.slug !== city.slug)
  const same = others.filter((c) => c.cc === city.cc).sort((a, b) => d(a) - d(b))
  const rest = others.filter((c) => c.cc !== city.cc).sort((a, b) => d(a) - d(b))
  return [...same, ...rest].slice(0, n)
}

export function cityMeta(city, locale) {
  const name = city.name[locale]
  const country = city.country[locale]
  return locale === 'es'
    ? {
        title: `Satélites esta noche sobre ${name}: cuándo ver la ISS · ${SITE_NAME}`,
        description: `Cuándo ver la Estación Espacial Internacional, Tiangong y otros satélites brillantes desde ${name} (${country}): horas de los pasos visibles, dirección y previsión de nubes para los próximos 10 días.`,
        path: cityPath(city.slug),
      }
    : {
        title: `ISS and satellites tonight over ${name}: when to see them · ${SITE_NAME}`,
        description: `When to see the International Space Station, Tiangong and other bright satellites from ${name}, ${country}: naked-eye pass times, directions and cloud forecast for the next 10 days.`,
        path: cityPath(city.slug),
      }
}

// All visible copy for a city page, in one locale.
export function cityCopy(city, locale) {
  const name = city.name[locale]
  const country = city.country[locale]
  const north = city.lat >= 0
  const iss = issBand(city)
  const tg = tiangongBand(city)

  if (locale === 'es') {
    const ISS_INCLINATION = '51,6'
    const TIANGONG_INCLINATION = '41,5'
    const pos = `${coord(city.lat, 'N', 'S', 'es')}, ${coord(city.lon, 'E', 'O', 'es')}`
    const side = north ? 'sur' : 'norte'
    const issText = {
      overhead: `La órbita de la ISS llega hasta los ${ISS_INCLINATION}° de latitud norte y sur, así que desde ${name} puede pasar muy alta, incluso casi en la vertical.`,
      low: `${name} queda fuera de la franja que sobrevuela la ISS (hasta ${ISS_INCLINATION}°), así que nunca pasa justo por encima, pero a menudo se ve más baja, hacia el ${side}.`,
      never: `${name} está demasiado lejos del ecuador: la ISS apenas se eleva sobre el horizonte desde aquí.`,
    }[iss]
    const tgText = {
      overhead: `La estación china Tiangong (órbita hasta ${TIANGONG_INCLINATION}°) también puede pasar alta sobre ${name}.`,
      low: `La estación china Tiangong no vuela más allá de los ${TIANGONG_INCLINATION}° de latitud, así que desde ${name} solo aparece baja sobre el horizonte ${side}.`,
      never: `La estación china Tiangong no vuela más allá de los ${TIANGONG_INCLINATION}° de latitud, así que desde ${name} prácticamente no se ve.`,
    }[tg]
    return {
      eyebrow: `${country} · Pasos visibles`,
      h1: `Satélites esta noche sobre ${name}`,
      intro: [
        `Desde ${name} (${pos}) puedes ver la Estación Espacial Internacional a simple vista cuando cruza tu cielo de noche mientras aún la ilumina el Sol: normalmente en las dos horas después de la puesta de sol o antes del amanecer.`,
        `${issText} ${tgText}`,
        `Las horas de la lista se muestran en la zona horaria de tu dispositivo (en ${name} rige ${city.tz}).`,
      ],
      passesNote: `Calculados en directo para ${name} cada vez que abres la página.`,
      openFull: `Abrir el rastreador completo para ${name}`,
      stations: 'Estaciones espaciales',
      issLink: `La ISS desde ${name}`,
      tgLink: `Tiangong desde ${name}`,
      nearbyTitle: 'Otras ciudades',
      faqTitle: `Preguntas sobre ver satélites desde ${name}`,
      faq: [
        {
          q: `¿Cuándo es el próximo paso de la ISS sobre ${name}?`,
          a: `Las horas de paso cambian cada día y dependen de la órbita más reciente de la estación, así que esta página las calcula en directo para ${name} al abrirla: la lista muestra todos los pasos visibles a simple vista de la ISS, Tiangong y otros satélites brillantes en los próximos 10 días, con dirección, altura, brillo y previsión de nubes.`,
        },
        {
          q: `¿Necesito un telescopio para ver la ISS desde ${name}?`,
          a: `No. La ISS es uno de los objetos más brillantes del cielo nocturno y se ve fácilmente a simple vista, incluso desde una ciudad como ${name}. Parece una estrella que no parpadea y que cruza el cielo en pocos minutos.`,
        },
        { q: `¿Se puede ver Tiangong desde ${name}?`, a: tgText },
      ],
    }
  }

  const pos = `${coord(city.lat, 'N', 'S', 'en')}, ${coord(city.lon, 'E', 'W', 'en')}`
  const side = north ? 'southern' : 'northern'
  const issText = {
    overhead: `The ISS orbit reaches latitudes up to ${ISS_INCLINATION}° north and south, so from ${name} it can pass high overhead.`,
    low: `${name} lies outside the band the ISS flies over (up to ${ISS_INCLINATION}°), so it never passes straight overhead here, but it is often visible lower in the ${side} sky.`,
    never: `${name} is too far from the equator: the ISS barely rises above the horizon here.`,
  }[iss]
  const tgText = {
    overhead: `China’s Tiangong station (orbit up to ${TIANGONG_INCLINATION}°) can also pass high over ${name}.`,
    low: `China’s Tiangong station flies no further from the equator than ${TIANGONG_INCLINATION}°, so from ${name} it only appears low over the ${side} horizon.`,
    never: `China’s Tiangong station flies no further from the equator than ${TIANGONG_INCLINATION}°, so it is practically never visible from ${name}.`,
  }[tg]
  return {
    eyebrow: `${country} · Visible passes`,
    h1: `ISS and satellites tonight over ${name}`,
    intro: [
      `From ${name} (${pos}) you can see the International Space Station with the naked eye whenever it crosses your night sky while still lit by the Sun, usually in the two hours after sunset or before sunrise.`,
      `${issText} ${tgText}`,
      `Times in the list are shown in your device’s time zone (${name} is on ${city.tz}).`,
    ],
    passesNote: `Calculated live for ${name} every time you open this page.`,
    openFull: `Open the full tracker for ${name}`,
    stations: 'Space stations',
    issLink: `The ISS from ${name}`,
    tgLink: `Tiangong from ${name}`,
    nearbyTitle: 'Other cities',
    faqTitle: `Spotting satellites from ${name}`,
    faq: [
      {
        q: `When is the next ISS pass over ${name}?`,
        a: `Pass times change every day and depend on the station’s latest orbit, so this page calculates them live for ${name} when you open it: the list shows every naked-eye pass of the ISS, Tiangong and other bright satellites over the next 10 days, with direction, height, brightness and cloud forecast.`,
      },
      {
        q: `Do I need a telescope to see the ISS from ${name}?`,
        a: `No. The ISS is one of the brightest objects in the night sky and is easy to see with the naked eye, even from a city like ${name}. It looks like a steady, non-blinking star that crosses the sky in a few minutes.`,
      },
      { q: `Can I see Tiangong from ${name}?`, a: tgText },
    ],
  }
}

// Query string that opens the main tracker for this city.
export const cityQuery = (city, locale) =>
  `?${new URLSearchParams({ lat: city.lat.toFixed(4), lon: city.lon.toFixed(4), name: city.name[locale] })}`

// WebPage + Place (with coordinates) + breadcrumbs + FAQ, for one city and locale.
export function cityJsonLd(city, locale) {
  const copy = cityCopy(city, locale)
  const meta = cityMeta(city, locale)
  const url = `${SITE}${localizePath(meta.path, locale)}`
  const home = `${SITE}${localizePath('/', locale)}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: meta.title,
        description: meta.description,
        inLanguage: locale,
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${url}#place` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'Place',
        '@id': `${url}#place`,
        name: city.name[locale],
        address: { '@type': 'PostalAddress', addressLocality: city.name[locale], addressCountry: city.cc.toUpperCase() },
        geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lon },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: home },
          { '@type': 'ListItem', position: 2, name: city.name[locale], item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: copy.faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  }
}

// UI strings for the "popular cities" list on the home page.
export const CITY_LIST_COPY = {
  en: { eyebrow: 'By city', title: 'Satellites tonight in popular cities', note: 'Visible passes of the ISS, Tiangong and other bright satellites, calculated live for each city.' },
  es: { eyebrow: 'Por ciudad', title: 'Satélites esta noche en ciudades populares', note: 'Pasos visibles de la ISS, Tiangong y otros satélites brillantes, calculados en directo para cada ciudad.' },
}
