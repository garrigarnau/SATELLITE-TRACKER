// Locale-aware routes, shared by the app and the build-time prerender script
// (plain JS, no React). English lives at the root; Spanish under /es with
// Spanish slugs:
//   /                 ↔ /es
//   /satellite/:id    ↔ /es/satelite/:id
//   /about            ↔ /es/acerca
//   /starlink         ↔ /es/starlink
//   /stations         ↔ /es/estaciones
//   /tonight/:slug    ↔ /es/esta-noche/:slug_es  (Spanish city slug, e.g. london ↔ londres)

import CITIES from '../data/cities.json' with { type: 'json' }

// City slugs differ by language for some cities (london ↔ londres).
const ES_SLUG = Object.fromEntries(CITIES.map((c) => [c.slug, c.slug_es]))
const EN_SLUG = Object.fromEntries(CITIES.map((c) => [c.slug_es, c.slug]))
export const esCitySlug = (slug) => ES_SLUG[slug] ?? slug
// Accepts a Spanish slug or, for old links, the English one.
export const enCitySlug = (slug) => EN_SLUG[slug] ?? slug

// Cities whose Spanish slug changed from the English one: old /es/esta-noche/{en}
// URLs (live before Spanish slugs existed) redirect to the Spanish slug.
export const RENAMED_CITY_SLUGS = CITIES.filter((c) => c.slug_es !== c.slug).map((c) => ({ en: c.slug, es: c.slug_es }))

export const LOCALES = ['en', 'es']
export const DEFAULT_LOCALE = 'en'

export const localeFromPath = (pathname) => (pathname === '/es' || pathname.startsWith('/es/') ? 'es' : 'en')

// English path (optionally with a ?query) → the same page in `locale`.
export function localizePath(path, locale) {
  if (locale !== 'es') return path
  const i = path.indexOf('?')
  const pathname = i < 0 ? path : path.slice(0, i)
  const query = i < 0 ? '' : path.slice(i)
  let out
  if (pathname === '/' || pathname === '') out = '/es'
  else if (pathname.startsWith('/satellite/')) out = `/es/satelite/${pathname.slice('/satellite/'.length)}`
  else if (pathname === '/about') out = '/es/acerca'
  else if (pathname === '/stations') out = '/es/estaciones'
  else if (pathname.startsWith('/tonight/')) out = `/es/esta-noche/${esCitySlug(pathname.slice('/tonight/'.length))}`
  else out = `/es${pathname}`
  return out + query
}

// Any localized pathname → its English equivalent.
export function toEnglishPath(pathname) {
  if (localeFromPath(pathname) !== 'es') return pathname
  const rest = pathname.slice(3) || '/'
  if (rest.startsWith('/satelite/')) return `/satellite/${rest.slice('/satelite/'.length)}`
  if (rest === '/acerca') return '/about'
  if (rest === '/estaciones') return '/stations'
  if (rest.startsWith('/esta-noche/')) return `/tonight/${enCitySlug(rest.slice('/esta-noche/'.length))}`
  return rest
}

export const switchLocalePath = (pathname, target) => localizePath(toEnglishPath(pathname), target)
