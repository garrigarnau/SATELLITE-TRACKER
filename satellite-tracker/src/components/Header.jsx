import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useObserver, observerQuery } from '../lib/observer'
import LocationSearch from './LocationSearch'

export default function Header() {
  const [observer, setObserver] = useObserver()
  const [open, setOpen] = useState(false)
  const q = observerQuery(observer)

  return (
    <header className="header">
      <div className="wrap header__inner">
        <Link to="/" className="brand" aria-label="Satellite Tracker, home">
          <img src="/logo.png" alt="" width="28" height="28" />
          <span>Satellite Tracker</span>
        </Link>

        <nav className="header__nav" aria-label="Primary">
          <NavLink to={`/${q}`} end className="header__link">Tonight</NavLink>
          <NavLink to={`/starlink${q}`} className="header__link">Starlink</NavLink>
          <NavLink to={`/about${q}`} className="header__link">About</NavLink>
          {observer && (
            <div className="loc">
              <button type="button" className="loc__chip" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
                <span className="loc__pin" aria-hidden="true" />
                <span className="loc__name">{observer.name}</span>
              </button>
              {open && (
                <div className="loc__pop" role="dialog" aria-label="Change location">
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
        </nav>
      </div>
    </header>
  )
}
