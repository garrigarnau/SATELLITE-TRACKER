import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// In production nginx adds the API keys (see nginx.conf.template). The dev
// server mirrors that, reading N2YO_API_KEY / OPENCAGE_API_KEY from .env.local.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
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
      },
    },
  }
})
