import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { setLocale, useT } from './lib/i18n'
import { localeFromPath } from './lib/paths'
import Header from './components/Header'
import Home from './pages/Home'
import Satellite from './pages/Satellite'
import About from './pages/About'
import Starlink from './pages/Starlink'
import Tiangong from './pages/Tiangong'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function NotFound() {
  const t = useT()
  return (
    <div className="wrap page">
      <h1 className="section__title">{t('notFound.title')}</h1>
      <p className="section__note">{t('notFound.body')}</p>
      <Link className="btn" to={t.lp('/')}>{t('common.backTonight')}</Link>
    </div>
  )
}

export default function App() {
  const { pathname } = useLocation()
  // Set before any child renders, so plain modules (format.js) use it too.
  const locale = localeFromPath(pathname)
  setLocale(locale)
  const t = useT()

  return (
    <>
      <ScrollToTop />
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/satellite/:id" element={<Satellite />} />
          <Route path="/starlink" element={<Starlink />} />
          <Route path="/tiangong" element={<Tiangong />} />
          <Route path="/about" element={<About />} />
          <Route path="/es" element={<Home />} />
          <Route path="/es/satelite/:id" element={<Satellite />} />
          <Route path="/es/starlink" element={<Starlink />} />
          <Route path="/es/tiangong" element={<Tiangong />} />
          <Route path="/es/acerca" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="wrap footer__inner">
          <span>{t('footer.data')} <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">{t('footer.weather')}</a></span>
          <span className="footer__links">
            <Link to={t.lp('/tiangong')}>{t('footer.tiangong')}</Link>
            <a href="https://github.com/garrigarnau/SATELLITE-TRACKER" target="_blank" rel="noreferrer">{t('footer.source')}</a>
          </span>
        </div>
      </footer>
    </>
  )
}
