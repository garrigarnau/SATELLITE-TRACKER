// Search metadata shared by the app (useSeo) and the build-time prerender
// script (scripts/prerender.mjs), so crawlers and link previews that don't run
// JavaScript still get route-specific titles. Plain data only: no React here.

export const SITE = 'https://satellitetracker.arnaugarriga.com'
export const SITE_NAME = 'Satellite Tracker'

export const DEFAULT_META = {
  title: 'Satellite Tracker — When to see the ISS, Starlink and satellites tonight',
  description:
    'Find when the International Space Station, Starlink and other bright satellites pass over your city tonight, where to look, and follow any satellite live on a map.',
  path: '/',
}

// Friendly names for satellites people search for; N2YO returns names like "SPACE STATION".
export const SAT_NAMES = {
  25544: 'International Space Station (ISS)',
  48274: 'Tiangong Space Station (CSS)',
  20580: 'Hubble Space Telescope',
  27386: 'Envisat',
  25994: 'Terra',
  27424: 'Aqua',
  33591: 'NOAA 19',
  43013: 'NOAA 20',
  37849: 'Suomi NPP',
}

const SMALL = new Set(['and', 'of', 'the', 'de'])

// "SPACE STATION" → "Space Station", keeping designators like "NOAA 19" or "(USA 191)".
export function prettySatName(id, raw) {
  if (SAT_NAMES[id]) return SAT_NAMES[id]
  if (!raw) return `Satellite ${id}`
  return raw
    .split(/(\s+|-|\(|\))/)
    .map((w, i) => {
      if (!/[A-Za-z]/.test(w)) return w
      if (/\d/.test(w) || (w.length <= 4 && w === w.toUpperCase() && !/^[AEIOU]/.test(w) && w.length > 1)) return w
      const lower = w.toLowerCase()
      return i > 0 && SMALL.has(lower) ? lower : lower[0].toUpperCase() + lower.slice(1)
    })
    .join('')
}

export const satelliteMeta = (id, name, city) => ({
  title: `${name} live position & visible passes${city ? ` over ${city}` : ''} · ${SITE_NAME}`,
  description: city
    ? `Where is the ${name} right now, and when can you see it from ${city}? Live position on a map, ground track, and naked-eye pass times with directions.`
    : `Where is the ${name} right now? Track it live on a map with its ground track, speed and altitude, and get naked-eye pass times for your city.`,
  path: `/satellite/${id}`,
})

export const homeMetaFor = (city, nextPass) => ({
  title: `ISS & satellite passes tonight over ${city} · ${SITE_NAME}`,
  description: nextPass
    ? `Next visible pass over ${city}: ${nextPass}. See every bright satellite you can spot from ${city} in the next 10 days, and what's overhead right now.`
    : `When to see the ISS and other bright satellites from ${city}: naked-eye pass times, directions and cloud cover for the next 10 days, plus what's overhead right now.`,
  path: '/',
})

export const ABOUT_META = {
  title: `About · ${SITE_NAME}`,
  description:
    'How Satellite Tracker predicts when you can see the ISS and other satellites, where the data comes from, and tips for spotting them with the naked eye.',
  path: '/about',
}

export const STARLINK_META = {
  title: `Starlink over Ukraine, Iran and other contested regions · ${SITE_NAME}`,
  description:
    'How many Starlink satellites are over Kyiv, Tehran, Caracas and other contested regions right now, computed live from public orbital data, with sourced context.',
  path: '/starlink',
}

// ---------- Spanish ----------
// Spain searches in Spanish ("estación espacial", "satélites hoy"); English
// terms barely register there, so the /es pages target those phrases.

export const SAT_NAMES_ES = {
  25544: 'Estación Espacial Internacional (ISS)',
  48274: 'Estación espacial china Tiangong (CSS)',
  20580: 'Telescopio espacial Hubble',
  27386: 'Envisat',
  25994: 'Terra',
  27424: 'Aqua',
  33591: 'NOAA 19',
  43013: 'NOAA 20',
  37849: 'Suomi NPP',
}

export const prettySatNameFor = (locale, id, raw) =>
  (locale === 'es' && SAT_NAMES_ES[id]) || prettySatName(id, raw)

export const DEFAULT_META_ES = {
  title: 'Rastreador de satélites en directo — cuándo ver la Estación Espacial (ISS) y Starlink esta noche',
  description:
    'Descubre cuándo pasan sobre tu ciudad la Estación Espacial Internacional, los Starlink y otros satélites brillantes, hacia dónde mirar, y sigue cualquier satélite en directo en el mapa.',
  path: '/',
}

export const homeMetaForEs = (city, nextPass) => ({
  title: `Satélites visibles hoy sobre ${city}: pasos de la ISS y Starlink`,
  description: nextPass
    ? `Próximo paso visible sobre ${city}: ${nextPass}. Todos los satélites brillantes que podrás ver desde ${city} en los próximos 10 días, y qué hay sobre ti ahora mismo.`
    : `Cuándo ver la ISS y otros satélites brillantes desde ${city}: horas de paso a simple vista, hacia dónde mirar y nubosidad para los próximos 10 días, y qué hay sobre ti ahora mismo.`,
  path: '/',
})

export const satelliteMetaEs = (id, name, city) => ({
  // Neutral wording ("se puede ver"): names mix genders (la Estación, el Hubble).
  title: `${name}: dónde está ahora y cuándo se puede ver${city ? ` desde ${city}` : ''} · ${SITE_NAME}`,
  description: city
    ? `${name}: dónde está ahora mismo y cuándo se puede ver desde ${city}. Posición en directo en el mapa, trayectoria y horas de paso a simple vista con la dirección a la que mirar.`
    : `${name}: dónde está ahora mismo. Sigue su posición en directo en el mapa con su trayectoria, velocidad y altitud, y consulta cuándo pasa por tu ciudad.`,
  path: `/satellite/${id}`,
})

export const ABOUT_META_ES = {
  title: `Cómo funciona el rastreador de satélites · ${SITE_NAME}`,
  description:
    'Cómo predice Satellite Tracker cuándo puedes ver la Estación Espacial Internacional y otros satélites, de dónde salen los datos y consejos para verlos a simple vista.',
  path: '/about',
}

export const STARLINK_META_ES = {
  title: `Starlink sobre Ucrania, Irán y otras zonas en conflicto · ${SITE_NAME}`,
  description:
    'Cuántos satélites Starlink hay ahora mismo sobre Kiev, Teherán, Caracas y otras zonas en conflicto, calculado en directo con datos orbitales públicos y con contexto y fuentes.',
  path: '/starlink',
}

// Picks the right metadata builder for a locale.
export const META = {
  en: { home: DEFAULT_META, homeFor: homeMetaFor, satellite: satelliteMeta, about: ABOUT_META, starlink: STARLINK_META },
  es: { home: DEFAULT_META_ES, homeFor: homeMetaForEs, satellite: satelliteMetaEs, about: ABOUT_META_ES, starlink: STARLINK_META_ES },
}

// Site-wide structured data, per language.
export function siteJsonLd(locale) {
  const es = locale === 'es'
  const url = es ? `${SITE}/es` : `${SITE}/`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        name: SITE_NAME,
        alternateName: es
          ? ['Rastreador de satélites', 'Estación espacial en directo', 'Satélites hoy', 'Dónde está la ISS', 'Satélites visibles esta noche']
          : ['ISS tracker', 'Starlink tracker', 'Satellite pass predictor', 'ISS tonight'],
        url,
        inLanguage: es ? 'es' : 'en',
      },
      {
        '@type': 'WebApplication',
        name: SITE_NAME,
        url,
        inLanguage: es ? 'es' : 'en',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any',
        description: es
          ? 'Descubre cuándo pasan sobre tu ciudad la ISS, los Starlink y otros satélites brillantes, y sigue cualquier satélite en directo en el mapa.'
          : 'Find when the ISS, Starlink and other bright satellites pass over your city, and track any satellite live on a map.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        author: { '@type': 'Person', name: 'Arnau Garriga Torné', url: 'https://arnaugarriga.com' },
      },
    ],
  }
}

export const OG_LOCALE = { en: 'en_US', es: 'es_ES' }

// Satellites that get a prerendered page and a sitemap entry.
export const SITEMAP_SATELLITES = [25544, 48274, 20580, 27386, 25994, 27424]
