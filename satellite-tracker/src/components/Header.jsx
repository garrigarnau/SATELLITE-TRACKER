import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useObserver, observerQuery } from '../lib/observer'
import { useT } from '../lib/i18n'
import { switchLocalePath } from '../lib/paths'
import LocationSearch from './LocationSearch'

const LANGS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
]

export default function Header() {
  const [observer, setObserver] = useObserver()
  const [open, setOpen] = useState(false)
  const t = useT()
  const { pathname, search } = useLocation()
  const q = observerQuery(observer)

  return (
    <header className="header">
      <div className="wrap header__inner">
        <Link to={t.lp('/')} className="brand" aria-label={t('nav.home')}>
          <img src="/logo.png" alt="" width="28" height="28" />
          <span>Satellite Tracker</span>
        </Link>

        <nav className="header__nav" aria-label={t('nav.primary')}>
          <NavLink to={t.lp(`/${q}`)} end className="header__link">{t('nav.tonight')}</NavLink>
          <NavLink to={t.lp(`/starlink${q}`)} className="header__link header__link--starlink">{t('nav.starlink')}</NavLink>
          <NavLink to={t.lp(`/about${q}`)} className="header__link">{t('nav.about')}</NavLink>
          {observer && (
            <div className="loc">
              <button type="button" className="loc__chip" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
                <span className="loc__pin" aria-hidden="true" />
                <span className="loc__name">{observer.name}</span>
              </button>
              {open && (
                <div className="loc__pop" role="dialog" aria-label={t('nav.changeLocation')}>
                  <LocationSearch
                    compact
                    autoFocus
                    onSelect={(next) => {
                      setObserver(next)
                      setOpen(false)
                    }}
                  />
                </div>
              )}
            </div>
          )}
          {/* Same page in the other language, keeping the location and filters. */}
          <div className="lang" role="group" aria-label={t('nav.language')}>
            {LANGS.map((l) => (
              <Link
                key={l.code}
                to={`${switchLocalePath(pathname, l.code)}${search}`}
                className={l.code === t.locale ? 'lang__opt is-active' : 'lang__opt'}
                aria-current={l.code === t.locale ? 'true' : undefined}
                hrefLang={l.code}
                lang={l.code}
                title={l.name}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}
