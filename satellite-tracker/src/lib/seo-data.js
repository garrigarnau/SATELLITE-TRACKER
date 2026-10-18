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

// Satellites that get a prerendered page and a sitemap entry.
export const SITEMAP_SATELLITES = [25544, 48274, 20580, 27386, 25994, 27424]
