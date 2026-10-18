// After `vite build`: writes a copy of dist/index.html for each important route
// with that route's title, description, canonical and Open Graph tags baked in,
// plus sitemap.xml. Google runs the SPA's JavaScript, but most link-preview bots
// (LinkedIn, X, Slack, WhatsApp) and other crawlers only read the raw HTML.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  META, OG_LOCALE, SAT_NAMES, SAT_NAMES_ES, SITE, SITEMAP_SATELLITES, siteJsonLd,
} from '../src/lib/seo-data.js'
import { localizePath } from '../src/lib/paths.js'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const template = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// `meta.path` is the English path; the page is written at its localized path.
function render({ title, description, path }, locale) {
  const url = `${SITE}${localizePath(path, locale)}`
  const swaps = [
    [/<html lang="[^"]*"/, `<html lang="${locale}"`],
    [/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`],
    [/(<meta name="description" content=")[^"]*/, `$1${esc(description)}`],
    [/(<link rel="canonical" href=")[^"]*/, `$1${url}`],
    [/(<link rel="alternate" hreflang="en" href=")[^"]*/, `$1${SITE}${path}`],
    [/(<link rel="alternate" hreflang="es" href=")[^"]*/, `$1${SITE}${localizePath(path, 'es')}`],
    [/(<link rel="alternate" hreflang="x-default" href=")[^"]*/, `$1${SITE}${path}`],
    [/(<meta property="og:locale" content=")[^"]*/, `$1${OG_LOCALE[locale]}`],
    [/(<meta property="og:locale:alternate" content=")[^"]*/, `$1${OG_LOCALE[locale === 'es' ? 'en' : 'es']}`],
    [/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`],
    [/(<meta property="og:description" content=")[^"]*/, `$1${esc(description)}`],
    [/(<meta property="og:url" content=")[^"]*/, `$1${url}`],
    [/(<meta name="twitter:title" content=")[^"]*/, `$1${esc(title)}`],
    [/(<meta name="twitter:description" content=")[^"]*/, `$1${esc(description)}`],
    [/(<script type="application\/ld\+json" id="ld-site">)[^<]*/, `$1${JSON.stringify(siteJsonLd(locale)).replace(/</g, '\\u003c')}`],
  ]
  return swaps.reduce((html, [re, to]) => {
    if (!re.test(html)) throw new Error(`prerender: tag not found for ${re}`)
    return html.replace(re, to)
  }, template)
}

const pagesFor = (locale) => {
  const m = META[locale]
  const names = locale === 'es' ? { ...SAT_NAMES, ...SAT_NAMES_ES } : SAT_NAMES
  return [m.about, m.starlink, ...SITEMAP_SATELLITES.map((id) => m.satellite(id, names[id]))]
}

// English home is dist/index.html itself; every other page gets its own file.
const pages = [
  ...pagesFor('en').map((meta) => ({ meta, locale: 'en' })),
  { meta: META.es.home, locale: 'es' },
  ...pagesFor('es').map((meta) => ({ meta, locale: 'es' })),
]

for (const { meta, locale } of pages) {
  const dir = join(dist, localizePath(meta.path, locale))
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), render(meta, locale))
}

const today = new Date().toISOString().slice(0, 10)
// One <url> per page and language, each listing both language versions.
const enPaths = [META.en.home, ...pagesFor('en')].map((m) => m.path)
const alt = (path) =>
  ['en', 'es'].map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${localizePath(path, l)}"/>`)
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${path}"/>`)
    .join('\n')
const urls = enPaths
  .flatMap((path) => ['en', 'es'].map((l) => `  <url>\n    <loc>${SITE}${localizePath(path, l)}</loc>\n    <lastmod>${today}</lastmod>\n${alt(path)}\n  </url>`))
  .join('\n')
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
)
console.log(`prerendered ${pages.length} pages and sitemap.xml (${enPaths.length * 2} URLs)`)
