// Umami custom events (stats.arnaugarriga.com). No-op when the script isn't
// loaded: local dev, ad blockers, or Umami being down. Never send coordinates.
export function track(event, data) {
  try {
    // The page language rides along on every event, to compare EN and ES use.
    window.umami?.track(event, { ...data, locale: document.documentElement.lang || 'en' })
  } catch {
    // Analytics must never break the app.
  }
}
