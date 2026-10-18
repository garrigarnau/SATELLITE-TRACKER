// Keeps the document head in sync with the current page: title, description,
// canonical URL, hreflang alternates, <html lang> and the Open Graph / Twitter
// tags used by link previews.
import { useEffect } from 'react'
import { OG_LOCALE, SITE, siteJsonLd } from './seo-data'
import { localizePath } from './paths'
import { useLocale } from './i18n'

function setMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

function setLink(rel, href, hreflang) {
  const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`
  let el = document.head.querySelector(sel)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    if (hreflang) el.setAttribute('hreflang', hreflang)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// `path` is the English canonical path: location query params (lat/lon/name)
// are left out so every variant of a page consolidates on one URL per language.
export function useSeo({ title, description, path = '/' }) {
  const locale = useLocale()
  useEffect(() => {
    if (!title) return
    const url = `${SITE}${localizePath(path, locale)}`
    document.title = title
    document.documentElement.lang = locale
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:locale', OG_LOCALE[locale])
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setLink('canonical', url)
    setLink('alternate', `${SITE}${path}`, 'en')
    setLink('alternate', `${SITE}${localizePath(path, 'es')}`, 'es')
    setLink('alternate', `${SITE}${path}`, 'x-default')
    const ld = document.getElementById('ld-site')
    if (ld) ld.textContent = JSON.stringify(siteJsonLd(locale))
  }, [title, description, path, locale])
}
