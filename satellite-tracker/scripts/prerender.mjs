// After `vite build`: writes a copy of dist/index.html for each important route
// with that route's title, description, canonical and Open Graph tags baked in,
// plus sitemap.xml. Google runs the SPA's JavaScript, but most link-preview bots
// (LinkedIn, X, Slack, WhatsApp) and other crawlers only read the raw HTML.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ABOUT_META, DEFAULT_META, SAT_NAMES, SITE, SITEMAP_SATELLITES, STARLINK_META, satelliteMeta,
} from '../src/lib/seo-data.js'
import { FACTS, factRows, factsJsonLd } from '../src/lib/satellite-facts.js'
import { FAQ, faqJsonLd } from '../src/lib/faq.js'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const template = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function render({ title, description, path }, extra = {}) {
  const url = `${SITE}${path}`
  const swaps = [
    [/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`],
    [/(<meta name="description" content=")[^"]*/, `$1${esc(description)}`],
    [/(<link rel="canonical" href=")[^"]*/, `$1${url}`],
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

function factsHtml(id, name, rec, updated) {
  const f = FACTS[id]
  const rows = factRows(id, rec, null).map(([k, v]) => `<div class="facts__row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')
  const sources = (f?.sources || []).map((s) => `<li><a href="${s.url}" rel="noreferrer">${esc(s.label)}</a></li>`).join('')
  return `<div class="wrap page"><p class="eyebrow">NORAD ${id}</p><h1 class="sat-head__title">${esc(name)}</h1>`
    + `<section class="facts" aria-labelledby="facts-title"><h2 id="facts-title" class="facts__title">About this satellite</h2>`
    + (f ? `<p class="facts__summary">${esc(f.summary)}</p>` : '')
    + `<dl class="facts__list">${rows}</dl>`
    + `<p class="facts__meta">Orbit and catalogue data: CelesTrak SATCAT, updated ${updated}.</p>`
    + (sources ? `<ul class="facts__sources">${sources}</ul>` : '')
    + `</section></div>`
}

const satcat = await fetchSatcat(SITEMAP_SATELLITES)
mkdirSync(join(dist, 'data'), { recursive: true })
writeFileSync(join(dist, 'data', 'satcat.json'), JSON.stringify({ fetched: satcat.fetched, records: satcat.records }))

const satRoutes = SITEMAP_SATELLITES.map((id) => {
  const meta = satelliteMeta(id, SAT_NAMES[id])
  const ld = factsJsonLd({ id, name: SAT_NAMES[id], satcat: satcat.records[id], url: `${SITE}${meta.path}`, updated: satcat.fetched })
  return {
    meta,
    extra: {
      root: factsHtml(id, SAT_NAMES[id], satcat.records[id], satcat.fetched),
      head: `    <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
    },
  }
})

const routes = [
  { meta: ABOUT_META },
  { meta: STARLINK_META },
  ...satRoutes,
]

for (const { meta, extra } of routes) {
  const dir = join(dist, meta.path)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), render(meta, extra))
}

const today = new Date().toISOString().slice(0, 10)

// --- / and /about: FAQ as plain HTML + FAQPage JSON-LD for crawlers that don't
// run JavaScript (AI answer engines included). It sits inside #root, so React
// replaces it on mount. Also writes llms.txt / llms-full.txt from the same data.
const faqHtml =
  `<section aria-label="Questions about spotting satellites"><h2>Questions about spotting satellites</h2>` +
  `<p>Last updated ${today}.</p>` +
  FAQ.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('') +
  `</section>`
const faqLd = `<script type="application/ld+json" id="faq-jsonld">${JSON.stringify(faqJsonLd()).replace(/</g, '\\u003c')}</script>`
const withFaq = (html) => {
  if (!html.includes('<div id="root"></div>') || !html.includes('</head>')) throw new Error('prerender: FAQ anchors not found')
  return html.replace('</head>', `    ${faqLd}\n  </head>`).replace('<div id="root"></div>', `<div id="root">${faqHtml}</div>`)
}
writeFileSync(join(dist, 'index.html'), withFaq(render(DEFAULT_META)))
writeFileSync(join(dist, ABOUT_META.path, 'index.html'), withFaq(render(ABOUT_META)))

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
- [Tiangong Space Station](${SITE}/satellite/48274)
- [Hubble Space Telescope](${SITE}/satellite/20580)
- [Starlink over contested regions](${SITE}/starlink): how many Starlink satellites are overhead in Kyiv, Tehran, Caracas and other cities, now and over the next 90 minutes. Coverage geometry, not service.
- [About](${SITE}/about): methods, data sources and FAQ.

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
const urls = [DEFAULT_META, ...routes.map((r) => r.meta)]
  .map((m) => `  <url><loc>${SITE}${m.path}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n')
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)
console.log(`prerendered ${routes.length} routes, / and /about with FAQ, sitemap.xml, llms.txt (SATCAT: ${satcat.live}/${SITEMAP_SATELLITES.length} live, data ${satcat.fetched})`)
