// Locale-aware routes, shared by the app and the build-time prerender script
// (plain JS, no React). English lives at the root; Spanish under /es with
// Spanish slugs:
//   /                 ↔ /es
//   /satellite/:id    ↔ /es/satelite/:id
//   /about            ↔ /es/acerca
//   /starlink         ↔ /es/starlink

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
  else out = `/es${pathname}`
  return out + query
}

// Any localized pathname → its English equivalent.
export function toEnglishPath(pathname) {
  if (localeFromPath(pathname) !== 'es') return pathname
  const rest = pathname.slice(3) || '/'
  if (rest.startsWith('/satelite/')) return `/satellite/${rest.slice('/satelite/'.length)}`
  if (rest === '/acerca') return '/about'
  return rest
}

export const switchLocalePath = (pathname, target) => localizePath(toEnglishPath(pathname), target)
