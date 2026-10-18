// After `vite build`: writes a copy of dist/index.html for each important route,
// in English and Spanish (/es/...), with that route's title, description,
// canonical, hreflang and Open Graph tags baked in, plus sitemap.xml. Google runs the SPA's JavaScript, but most link-preview bots
// (LinkedIn, X, Slack, WhatsApp) and other crawlers only read the raw HTML.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  META, OG_LOCALE, SAT_NAMES, SAT_NAMES_ES, SITE, SITEMAP_SATELLITES, siteJsonLd,
} from '../src/lib/seo-data.js'
import { RENAMED_CITY_SLUGS, localizePath } from '../src/lib/paths.js'
import { TIANGONG_COPY, tiangongFaqJsonLd } from '../src/lib/tiangong.js'
import { FACTS, factRows, factSummary, factsJsonLd } from '../src/lib/satellite-facts.js'
import { FAQ, faqFor, faqJsonLd } from '../src/lib/faq.js'
import { CITIES, cityCopy, cityJsonLd, cityMeta, cityPath, cityQuery, nearbyCities } from '../src/lib/cities.js'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const template = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c')

// `meta.path` is the English path; the page is written at its localized path.
function render({ title, description, path }, locale = 'en', extra = {}) {
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
    [/(<script type="application\/ld\+json" id="ld-site">)[^<]*/, `$1${json(siteJsonLd(locale))}`],
    [/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`],
    [/(<meta property="og:description" content=")[^"]*/, `$1${esc(description)}`],
    [/(<meta property="og:url" content=")[^"]*/, `$1${url}`],
    [/(<meta name="twitter:title" content=")[^"]*/, `$1${esc(title)}`],
    [/(<meta name="twitter:description" content=")[^"]*/, `$1${esc(description)}`],
  ]
  if (extra.root) swaps.push([/<div id="root"><\/div>/, `<div id="root">${extra.root}</div>`])
  if (extra.head) swaps.push([/<\/head>/, `${extra.head}\n  </head>`])
  return swaps.reduce((html, [re, to]) => {
    if (!re.test(html)) throw new Error(`prerender: tag not found for ${re}`)
    return html.replace(re, to)
  }, template)
}

function tiangongBody(locale) {
  const t = TIANGONG_COPY[locale]
  const rows = t.compare.map(([l, a, b]) => `<tr><th scope="row">${esc(l)}</th><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')
  const faq = t.faq.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')
  const sources = t.sources.map((s) => `<li><a href="${s.url}">${esc(s.label)}</a></li>`).join('')
  return `<div class="wrap page tiangong"><script type="application/ld+json">${JSON.stringify(tiangongFaqJsonLd(t)).replace(/</g, '\\u003c')}</script>`
    + `<p class="eyebrow">${esc(t.eyebrow)}</p><h1 class="sat-head__title">${esc(t.title)}</h1>`
    + `<div class="tiangong__intro">${t.intro.map((p) => `<p>${esc(p)}</p>`).join('')}</div>`
    + `<h2>${esc(t.compareTitle)}</h2><table><thead><tr><td></td><th>Tiangong</th><th>ISS</th></tr></thead><tbody>${rows}</tbody></table>`
    + `<p>${esc(t.compareFootnote)}</p><h2>${esc(t.faqTitle)}</h2>${faq}<h2>${esc(t.sourcesTitle)}</h2><ul>${sources}</ul></div>`
}

// ---- City pages: intro, links and FAQ as real HTML (no pass times: those are
// computed live in the browser, so nothing stale is baked in). React replaces #root.
const PASSES_TITLE = { en: (c) => `Visible passes from ${c}`, es: (c) => `Pasos visibles desde ${c}` }
function cityBody(city, locale) {
  const c = cityCopy(city, locale)
  const name = city.name[locale]
  const q = cityQuery(city, locale)
  const link = (path, text) => `<a href="${localizePath(path, locale)}">${esc(text)}</a>`
  return `<div class="wrap page city"><p class="eyebrow">${esc(c.eyebrow)}</p><h1 class="sat-head__title">${esc(c.h1)}</h1>`
    + `<div class="city__intro">${c.intro.map((p) => `<p>${esc(p)}</p>`).join('')}</div>`
    + `<p>${link(`/${q}`, c.openFull)} · ${link(`/satellite/25544${q}`, c.issLink)} · ${link(`/tiangong${q}`, c.tgLink)}</p>`
    + `<h2>${esc(PASSES_TITLE[locale](name))}</h2><p>${esc(c.passesNote)}</p>`
    + `<h2>${esc(c.faqTitle)}</h2>${c.faq.map(({ q: question, a }) => `<h3>${esc(question)}</h3><p>${esc(a)}</p>`).join('')}`
    + `<h2>${esc(c.nearbyTitle)}</h2><ul>${nearbyCities(city).map((n) => `<li>${link(cityPath(n.slug), n.name[locale])}</li>`).join('')}</ul></div>`
}

const cityRoutes = (locale) => CITIES.map((city) => ({
  meta: cityMeta(city, locale),
  locale,
  extra: {
    root: cityBody(city, locale),
    head: `    <script type="application/ld+json" id="ld-city">${json(cityJsonLd(city, locale))}</script>`,
  },
}))

// ---- Satellite pages: citable facts in the raw HTML -------------------------
// CelesTrak SATCAT records (owner, launch date, status, orbit) fetched once per
// build, politely and in sequence; the committed snapshot is the fallback so a
// CelesTrak outage never breaks the build. React replaces #root on load.
const snapshot = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'satcat-fallback.json'), 'utf8'))

async function fetchSatcat(ids) {
  const records = {}
  let live = 0
  for (const id of ids) {
    try {
      const res = await fetch(`https://celestrak.org/satcat/records.php?CATNR=${id}&FORMAT=JSON`, {
        signal: AbortSignal.timeout(10_000),
        headers: { 'User-Agent': 'satellitetracker.arnaugarriga.com build' },
      })
      const [rec] = await res.json()
      if (rec?.NORAD_CAT_ID) { records[id] = rec; live++; continue }
    } catch { /* fall through to snapshot */ }
    records[id] = snapshot.records[id]
  }
  return { fetched: live === ids.length ? new Date().toISOString().slice(0, 10) : snapshot.fetched, live, records }
}

const FACTS_TEXT = {
  en: { title: 'About this satellite', meta: (d) => `Orbit and catalogue data: CelesTrak SATCAT, updated ${d}.` },
  es: { title: 'Sobre este satélite', meta: (d) => `Datos orbitales y de catálogo: CelesTrak SATCAT, actualizados el ${d}.` },
}

function factsHtml(id, name, rec, updated, locale) {
  const f = FACTS[id]
  const T = FACTS_TEXT[locale]
  const summary = factSummary(id, locale)
  const rows = factRows(id, rec, null, locale).map(([k, v]) => `<div class="facts__row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')
  const sources = (f?.sources || []).map((s) => `<li><a href="${s.url}" rel="noreferrer">${esc(s.label)}</a></li>`).join('')
  return `<div class="wrap page"><p class="eyebrow">NORAD ${id}</p><h1 class="sat-head__title">${esc(name)}</h1>`
    + `<section class="facts" aria-labelledby="facts-title"><h2 id="facts-title" class="facts__title">${T.title}</h2>`
    + (summary ? `<p class="facts__summary">${esc(summary)}</p>` : '')
    + `<dl class="facts__list">${rows}</dl>`
    + `<p class="facts__meta">${esc(T.meta(updated))}</p>`
    + (sources ? `<ul class="facts__sources">${sources}</ul>` : '')
    + `</section></div>`
}

const satcat = await fetchSatcat(SITEMAP_SATELLITES)
mkdirSync(join(dist, 'data'), { recursive: true })
writeFileSync(join(dist, 'data', 'satcat.json'), JSON.stringify({ fetched: satcat.fetched, records: satcat.records }))

const satRoutes = (locale) => SITEMAP_SATELLITES.map((id) => {
  const name = (locale === 'es' && SAT_NAMES_ES[id]) || SAT_NAMES[id]
  const meta = META[locale].satellite(id, name)
  const url = `${SITE}${localizePath(meta.path, locale)}`
  const ld = factsJsonLd({ id, name, satcat: satcat.records[id], url, updated: satcat.fetched, locale })
  return {
    meta,
    locale,
    extra: {
      root: factsHtml(id, name, satcat.records[id], satcat.fetched, locale),
      head: `    <script type="application/ld+json">${json(ld)}</script>`,
    },
  }
})

const routesFor = (locale) => [
  { meta: META[locale].about, locale },
  { meta: META[locale].starlink, locale },
  // Tiangong: intro, comparison and FAQ (with its FAQPage JSON-LD) inside #root.
  { meta: META[locale].tiangong, locale, extra: { root: tiangongBody(locale) } },
  ...satRoutes(locale),
  ...cityRoutes(locale),
]
const routes = [...routesFor('en'), ...routesFor('es')]

for (const { meta, locale, extra } of routes) {
  const dir = join(dist, localizePath(meta.path, locale))
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), render(meta, locale, extra))
}

// ---- 404 shells: unknown city slugs get a real 404 status from nginx (see
// nginx.conf.template) while still loading the app, which shows "not found".
for (const locale of ['en', 'es']) {
  const notFound = locale === 'es'
    ? { title: 'Página no encontrada · Satellite Tracker', description: 'Esta página no existe.', path: '/' }
    : { title: 'Page not found · Satellite Tracker', description: 'This page doesn’t exist.', path: '/' }
  const dir = join(dist, locale === 'es' ? 'es' : '')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, '404.html'), render(notFound, locale, { head: '    <meta name="robots" content="noindex">' }))
}

// ---- Redirects for renamed city slugs, written as an nginx include that the
// Dockerfile copies into the server block. Old Spanish URLs used the English
// slug (/es/esta-noche/london); English URLs with a Spanish slug are fixed too.
const redirects = RENAMED_CITY_SLUGS.flatMap(({ en, es }) => [
  [`/es/esta-noche/${en}`, `/es/esta-noche/${es}`],
  [`/tonight/${es}`, `/tonight/${en}`],
]).flatMap(([from, to]) => [from, `${from}/`].map((f) => `location = ${f} { return 301 ${to}$is_args$args; }`))
const generated = join(dist, '..', 'generated')
mkdirSync(generated, { recursive: true })
writeFileSync(join(generated, 'nginx-redirects.conf'), `# Generated by scripts/prerender.mjs. Do not edit.\n${redirects.join('\n')}\n`)

const today = new Date().toISOString().slice(0, 10)

// --- / and /about: FAQ as plain HTML + FAQPage JSON-LD for crawlers that don't
// run JavaScript (AI answer engines included). It sits inside #root, so React
// replaces it on mount. Also writes llms.txt / llms-full.txt from the same data.
const FAQ_TEXT = {
  en: { title: 'Questions about spotting satellites', updated: 'Last updated' },
  es: { title: 'Preguntas sobre cómo ver satélites', updated: 'Última actualización:' },
}
const withFaq = (html, locale) => {
  const T = FAQ_TEXT[locale]
  const items = faqFor(locale)
  const faqHtml =
    `<section aria-label="${T.title}"><h2>${T.title}</h2><p>${T.updated} ${today}.</p>` +
    items.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('') +
    `</section>`
  const faqLd = `<script type="application/ld+json" id="faq-jsonld">${json(faqJsonLd(items))}</script>`
  if (!html.includes('<div id="root"></div>') || !html.includes('</head>')) throw new Error('prerender: FAQ anchors not found')
  return html.replace('</head>', `    ${faqLd}\n  </head>`).replace('<div id="root"></div>', `<div id="root">${faqHtml}</div>`)
}
for (const locale of ['en', 'es']) {
  const m = META[locale]
  for (const meta of [m.home, m.about]) {
    const dir = join(dist, localizePath(meta.path, locale))
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), withFaq(render(meta, locale), locale))
  }
}

const llms = `# Satellite Tracker

> Free web app that tells you when the International Space Station (ISS), Tiangong, Hubble, Starlink and other bright satellites can be seen with the naked eye from any city, where to look, and the cloud forecast for each pass. It also tracks any satellite live on a map and counts Starlink satellites over contested regions.

Made by Arnau Garriga Torné (https://arnaugarriga.com). Source code: https://github.com/garrigarnau/SATELLITE-TRACKER. Last updated ${today}.

## How it works

- Orbits: public orbital elements (TLE/OMM) from CelesTrak, propagated in the browser with satellite.js (SGP4).
- Visible passes: a pass is listed when the satellite is at least 10° above the horizon, lit by the Sun, and the observer's sky is dark (Sun below −6°), over the next 10 days.
- What's overhead right now: N2YO API. City search: OpenCage. Cloud cover per pass: Open-Meteo forecast.

## Pages

- [Home](${SITE}/): search a city or use your location to get visible passes and what's overhead now.
- [International Space Station (ISS)](${SITE}/satellite/25544): live position, ground track and visible passes.
- [Tiangong tracker](${SITE}/tiangong): where China's space station is right now, when to see it, and how it compares with the ISS.
- [Hubble Space Telescope](${SITE}/satellite/20580)
- [Starlink over contested regions](${SITE}/starlink): how many Starlink satellites are overhead in Kyiv, Tehran, Caracas and other cities, now and over the next 90 minutes. Coverage geometry, not service.
- [About](${SITE}/about): methods, data sources and FAQ.
- Visible passes by city, e.g. [ISS tonight over Madrid](${SITE}/tonight/madrid) and [Barcelona](${SITE}/tonight/barcelona). In Spanish, with Spanish city names: ${['madrid', 'london', 'new-york'].map((slug) => { const c = CITIES.find((x) => x.slug === slug); return `[Satélites esta noche sobre ${c.name.es}](${SITE}${localizePath(cityPath(slug), 'es')})` }).join(', ')}.
- [En español](${SITE}/es): the same app in Spanish — when to see the ISS ("cuándo ver la Estación Espacial"), Tiangong (${SITE}/es/tiangong) and the satellites visible tonight ("satélites hoy").

## Cities

${CITIES.map((c) => `- [ISS and satellites tonight over ${c.name.en}, ${c.country.en}](${SITE}${cityPath(c.slug)})`).join('\n')}

## FAQ

${FAQ.map(({ q }) => `- ${q}`).join('\n')}

Full answers: ${SITE}/llms-full.txt
`
writeFileSync(join(dist, 'llms.txt'), llms)
writeFileSync(
  join(dist, 'llms-full.txt'),
  llms.replace(/## FAQ[\s\S]*$/, '') +
    `## FAQ\n\n${FAQ.map(({ q, a, sources }) => `### ${q}\n\n${a}\n\nSources: ${sources.join(', ')}\n`).join('\n')}`,
)
// One <url> per page and language, each listing both language versions.
const enPaths = [META.en.home, ...routesFor('en').map((r) => r.meta)].map((m) => m.path)
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
console.log(`prerendered ${routes.length} routes (en + es), home and about with FAQ, sitemap.xml, llms.txt (SATCAT: ${satcat.live}/${SITEMAP_SATELLITES.length} live, data ${satcat.fetched})`)
