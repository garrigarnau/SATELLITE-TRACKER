// After `vite build`: writes a copy of dist/index.html for each important route
// with that route's title, description, canonical and Open Graph tags baked in,
// plus sitemap.xml. Google runs the SPA's JavaScript, but most link-preview bots
// (LinkedIn, X, Slack, WhatsApp) and other crawlers only read the raw HTML.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ABOUT_META, DEFAULT_META, SAT_NAMES, SITE, SITEMAP_SATELLITES, STARLINK_META, TIANGONG_META, satelliteMeta,
} from '../src/lib/seo-data.js'
import { TIANGONG_COPY, tiangongFaqJsonLd } from '../src/lib/tiangong.js'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const template = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// Optional `body` is real page content placed inside #root for crawlers that
// don't run JavaScript; React replaces it when the app mounts.
function render({ title, description, path, body }) {
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
  if (body) swaps.push([/<div id="root"><\/div>/, `<div id="root">${body}</div>`])
  return swaps.reduce((html, [re, to]) => {
    if (!re.test(html)) throw new Error(`prerender: tag not found for ${re}`)
    return html.replace(re, to)
  }, template)
}

function tiangongBody() {
  const t = TIANGONG_COPY.en
  const rows = t.compare.map(([l, a, b]) => `<tr><th scope="row">${esc(l)}</th><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')
  const faq = t.faq.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')
  const sources = t.sources.map((s) => `<li><a href="${s.url}">${esc(s.label)}</a></li>`).join('')
  return `<div class="wrap page tiangong"><script type="application/ld+json">${JSON.stringify(tiangongFaqJsonLd(t)).replace(/</g, '\\u003c')}</script>`
    + `<p class="eyebrow">${esc(t.eyebrow)}</p><h1 class="sat-head__title">${esc(t.title)}</h1>`
    + `<div class="tiangong__intro">${t.intro.map((p) => `<p>${esc(p)}</p>`).join('')}</div>`
    + `<h2>${esc(t.compareTitle)}</h2><table><thead><tr><td></td><th>Tiangong</th><th>ISS</th></tr></thead><tbody>${rows}</tbody></table>`
    + `<p>${esc(t.compareFootnote)}</p><h2>${esc(t.faqTitle)}</h2>${faq}<h2>${esc(t.sourcesTitle)}</h2><ul>${sources}</ul></div>`
}

const routes = [
  ABOUT_META,
  STARLINK_META,
  { ...TIANGONG_META, body: tiangongBody() },
  ...SITEMAP_SATELLITES.map((id) => satelliteMeta(id, SAT_NAMES[id])),
]

for (const meta of routes) {
  const dir = join(dist, meta.path)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), render(meta))
}

const today = new Date().toISOString().slice(0, 10)
const urls = [DEFAULT_META, ...routes]
  .map((m) => `  <url><loc>${SITE}${m.path}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n')
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)
console.log(`prerendered ${routes.length} routes and sitemap.xml`)
