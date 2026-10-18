import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// /api/starlink in dev: the whole Starlink catalogue (OMM JSON, ~5 MB). CelesTrak
// allows one download per ~2 h update and firewalls clients after repeated
// errors, so dev serves a saved copy from dev-data/starlink.json (gitignored).
// If the file is missing it is downloaded once and saved; delete it to refresh.
const STARLINK_UPSTREAM = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=json'
function starlinkFixture() {
  const file = path.resolve('dev-data/starlink.json')
  let pending = null
  const download = async () => {
    const res = await fetch(STARLINK_UPSTREAM)
    const body = await res.text()
    if (!res.ok) throw new Error(`CelesTrak answered ${res.status}: ${body.slice(0, 200)}`)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, body)
  }
  return {
    name: 'starlink-fixture',
    configureServer(server) {
      server.middlewares.use('/api/starlink', async (req, res) => {
        try {
          if (!fs.existsSync(file)) {
            pending ??= download().finally(() => { pending = null })
            await pending
          }
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.setHeader('Cache-Control', 'no-cache')
          res.setHeader('X-Cache', 'DEV-FIXTURE')
          fs.createReadStream(file).pipe(res)
        } catch (e) {
          res.statusCode = 502
          res.end(String(e.message || e))
        }
      })
    },
  }
}

// In production nginx adds the API keys (see nginx.conf.template). The dev
// server mirrors that, reading N2YO_API_KEY / OPENCAGE_API_KEY from .env.local.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), starlinkFixture()],
    // Workers are ES modules (satellite.js 7 is ESM-only).
    worker: { format: 'es' },
    // Pre-bundling would pull in the WASM glue the alias below skips.
    optimizeDeps: { exclude: ['satellite.js'] },
    resolve: {
      alias: {
        '#wasm-single-thread': path.resolve('src/lib/no-wasm.js'),
        '#wasm-multi-thread': path.resolve('src/lib/no-wasm.js'),
      },
    },
    server: {
      proxy: {
        '/api/n2yo': {
          target: 'https://api.n2yo.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/n2yo/, '/rest/v1/satellite') + `&apiKey=${env.N2YO_API_KEY}`,
        },
        '/api/geocode': {
          target: 'https://api.opencagedata.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/geocode/, '/geocode/v1/json') + `&key=${env.OPENCAGE_API_KEY}`,
        },
        // CelesTrak SATCAT / GP: no key; proxied so prod nginx can cache it for a day.
        '/api/celestrak': {
          target: 'https://celestrak.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/celestrak/, ''),
        },
      },
    },
  }
})
