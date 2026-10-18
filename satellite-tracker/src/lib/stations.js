// Copy and data for the International stations page (/stations): the ISS and
// Tiangong live on one map. Plain data only, so the prerender script can bake
// the intro and comparison into static HTML. The comparison rows and sources
// are the Tiangong page's (src/lib/tiangong.js), so the numbers stay in one place.
import { TIANGONG_COPY, TIANGONG_ID } from './tiangong.js'
import { SITE } from './seo-data.js'

export const ISS_ID = 25544

// `variant` picks the marker and track colours: the ISS in white, Tiangong in magenta.
export const STATIONS = [
  {
    id: ISS_ID,
    key: 'iss',
    variant: 'iss',
    short: 'ISS',
    name: { en: 'International Space Station (ISS)', es: 'Estación Espacial Internacional (ISS)' },
    operator: { en: 'NASA, Roscosmos, ESA, JAXA and CSA', es: 'NASA, Roscosmos, ESA, JAXA y CSA' },
    crew: { en: 'Usually 7', es: 'Normalmente 7' },
    page: `/satellite/${ISS_ID}`,
    sameAs: ['https://en.wikipedia.org/wiki/International_Space_Station', 'https://www.nasa.gov/international-space-station/'],
  },
  {
    id: TIANGONG_ID,
    key: 'tiangong',
    variant: 'tg',
    short: 'Tiangong',
    name: { en: 'Tiangong Space Station (CSS)', es: 'Estación espacial china Tiangong (CSS)' },
    operator: { en: 'China Manned Space Agency (CMSA)', es: 'Agencia Espacial Tripulada de China (CMSA)' },
    crew: { en: 'Usually 3 (up to 6)', es: 'Normalmente 3 (hasta 6)' },
    page: '/tiangong',
    sameAs: ['https://en.wikipedia.org/wiki/Tiangong_space_station'],
  },
]

export const STATIONS_COPY = {
  en: {
    eyebrow: 'ISS · Tiangong',
    title: 'International stations: ISS and Tiangong live',
    intro: [
      'Two crewed space stations orbit the Earth right now: the International Space Station, run by five space agencies since 1998, and Tiangong, China’s station, crewed since 2021.',
      'Both circle the planet roughly every 92–93 minutes, a few hundred kilometres up. The map shows where each one is this second, the path it just flew and the next orbit ahead.',
    ],
    follow: 'Follow',
    followBoth: 'Both',
    mapLabel: 'Map with the live positions of the ISS and Tiangong',
    distanceTitle: 'Distance between the stations right now',
    distanceGround: 'Over the ground',
    distanceGroundHint: 'Great-circle distance between the points on Earth directly below each station.',
    distanceSpace: 'Through space',
    distanceSpaceHint: 'Straight-line distance between the two stations in orbit.',
    operator: 'Operator',
    crew: 'Crew',
    openPage: { iss: 'Open the ISS page →', tiangong: 'Open the Tiangong page →' },
    passesTitle: 'Next visible pass of each station',
    passesNote: 'Naked-eye passes from your location over the next 10 days, computed in your browser.',
    noPass: 'No visible pass in the next 10 days.',
    noLocationTitle: 'When can you see them?',
    noLocationNote: 'Set your location to get the next visible pass of each station.',
    unavailable: 'Live position unavailable',
    compareTitle: 'ISS and Tiangong compared',
  },
  es: {
    eyebrow: 'ISS · Tiangong',
    title: 'Estaciones espaciales internacionales: la ISS y Tiangong en directo',
    intro: [
      'Ahora mismo hay dos estaciones espaciales tripuladas en órbita: la Estación Espacial Internacional, gestionada por cinco agencias espaciales desde 1998, y Tiangong, la estación de China, tripulada desde 2021.',
      'Las dos dan la vuelta a la Tierra cada 92–93 minutos aproximadamente, a unos cientos de kilómetros de altura. El mapa muestra dónde está cada una en este segundo, el recorrido que acaba de hacer y su próxima órbita.',
    ],
    follow: 'Seguir',
    followBoth: 'Ambas',
    mapLabel: 'Mapa con la posición en directo de la ISS y Tiangong',
    distanceTitle: 'Distancia entre las estaciones ahora mismo',
    distanceGround: 'Sobre la superficie',
    distanceGroundHint: 'Distancia sobre la superficie terrestre entre los puntos situados justo debajo de cada estación.',
    distanceSpace: 'En línea recta',
    distanceSpaceHint: 'Distancia en línea recta entre las dos estaciones en órbita.',
    operator: 'Operador',
    crew: 'Tripulación',
    openPage: { iss: 'Abrir la página de la ISS →', tiangong: 'Abrir la página de Tiangong →' },
    passesTitle: 'Próximo paso visible de cada estación',
    passesNote: 'Pasos visibles a simple vista desde tu ubicación en los próximos 10 días, calculados en tu navegador.',
    noPass: 'Ningún paso visible en los próximos 10 días.',
    noLocationTitle: '¿Cuándo puedes verlas?',
    noLocationNote: 'Indica tu ubicación para ver el próximo paso visible de cada estación.',
    unavailable: 'Posición en directo no disponible',
    compareTitle: 'La ISS y Tiangong, comparadas',
  },
}

// Comparison rows from the Tiangong page, with the ISS first to match this page.
export function stationsCompare(locale) {
  const t = TIANGONG_COPY[locale] || TIANGONG_COPY.en
  return {
    head: ['', 'ISS', 'Tiangong'],
    rows: t.compare.map(([label, tg, iss]) => [label, iss, tg]),
    note: t.compareNote,
    footnote: t.compareFootnote,
    sources: t.sources,
  }
}

// WebPage + ItemList of the two stations, for search and AI answer engines.
export function stationsJsonLd(locale, url) {
  const c = STATIONS_COPY[locale] || STATIONS_COPY.en
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: c.title,
    url,
    inLanguage: locale,
    description: c.intro[0],
    isPartOf: { '@type': 'WebSite', name: 'Satellite Tracker', url: SITE },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: STATIONS.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Thing',
          name: s.name[locale] || s.name.en,
          alternateName: s.short,
          identifier: `NORAD ${s.id}`,
          sameAs: s.sameAs,
        },
      })),
    },
  }
}

const R = 6371

// Great-circle distance (km) between the points on Earth below two satellites.
export function groundDistanceKm(a, b) {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLon = (b.lon - a.lon) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

// Straight-line distance (km) between two satellites, from their ECI positions.
export const spaceDistanceKm = (a, b) => Math.hypot(a.eci.x - b.eci.x, a.eci.y - b.eci.y, a.eci.z - b.eci.z)
