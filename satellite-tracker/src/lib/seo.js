// Keeps the document head in sync with the current page: title, description,
// canonical URL and the Open Graph / Twitter tags used by link previews.
import { useEffect } from 'react'
import { SITE } from './seo-data'

function setMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// `path` is the canonical path: location query params (lat/lon/name) are left
// out so every variant of a page consolidates on one URL.
export function useSeo({ title, description, path = '/' }) {
  useEffect(() => {
    if (!title) return
    const url = `${SITE}${path}`
    document.title = title
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setCanonical(url)
  }, [title, description, path])
}
