import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
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

export default function App() {
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
          <Route
            path="*"
            element={
              <div className="wrap page">
                <h1 className="section__title">Lost in space</h1>
                <p className="section__note">This page doesn&rsquo;t exist.</p>
                <Link className="btn" to="/">Back to tonight</Link>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="footer">
        <div className="wrap footer__inner">
          <span>Orbits from CelesTrak · Overhead from N2YO · <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Weather by Open-Meteo</a></span>
          <span className="footer__links">
            <Link to="/tiangong">Tiangong tracker</Link>
            <a href="https://github.com/garrigarnau/SATELLITE-TRACKER" target="_blank" rel="noreferrer">Source on GitHub</a>
          </span>
        </div>
      </footer>
    </>
  )
}
