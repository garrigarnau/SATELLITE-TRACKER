// Umami custom events (stats.arnaugarriga.com). No-op when the script isn't
// loaded: local dev, ad blockers, or Umami being down. Never send coordinates.
export function track(event, data) {
  try {
    window.umami?.track(event, data)
  } catch {
    // Analytics must never break the app.
  }
}
