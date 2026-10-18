import { Link } from 'react-router-dom'
import { useObserver, observerQuery } from '../lib/observer'

export default function About() {
  const [observer] = useObserver()
  return (
    <div className="wrap page prose">
      <p className="eyebrow">About</p>
      <h1 className="section__title">A window on what&rsquo;s above you</h1>
      <p>
        Satellite Tracker tells you when bright satellites, like the International Space Station, will cross your sky and
        where to look. It also follows any object in orbit live, from its position and speed to its path over the Earth.
      </p>
      <h2>How it works</h2>
      <p>
        Orbital elements come from <a href="https://celestrak.org" target="_blank" rel="noreferrer">CelesTrak</a>. Pass predictions, live
        positions and sky paths are computed in your browser from them with{' '}
        <a href="https://github.com/shashwatak/satellite-js" target="_blank" rel="noreferrer">satellite.js</a>: a pass counts as visible
        when the satellite is at least 10° up, lit by the sun and your sky is dark. The live list of what&rsquo;s overhead comes from{' '}
        <a href="https://www.n2yo.com" target="_blank" rel="noreferrer">N2YO</a>, city search from{' '}
        <a href="https://opencagedata.com" target="_blank" rel="noreferrer">OpenCage</a> and cloud forecasts from{' '}
        <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a>.
      </p>
      <h2>Starlink over contested regions</h2>
      <p>
        The <Link to={`/starlink${observerQuery(observer)}`}>Starlink page</Link> counts how many Starlink satellites are at least 25° above
        the horizon from a handful of cities in conflict zones, now and over the next 90 minutes, with Madrid and Quito as references. It
        propagates every Starlink&rsquo;s public orbital elements from CelesTrak in your browser. That is geometry, not service: SpaceX turns
        Starlink on or off by location, and nothing here measures who uses it. The counts mostly follow latitude, not politics.
      </p>
      <h2>Spotting a satellite</h2>
      <ul>
        <li>Look for a steady, non-blinking point of light moving smoothly across the sky.</li>
        <li>The best passes happen within two hours of sunset or sunrise.</li>
        <li>Higher elevation and lower magnitude mean an easier, brighter pass.</li>
      </ul>
      <h2>Who made it</h2>
      <p>
        A non-profit side project by <a href="https://arnaugarriga.com" target="_blank" rel="noreferrer">Arnau Garriga</a>, started to learn React and kept
        alive by a love of looking up at night. The code is on <a href="https://github.com/garrigarnau/SATELLITE-TRACKER" target="_blank" rel="noreferrer">GitHub</a>.
      </p>
      <Link className="btn" to={`/${observerQuery(observer)}`}>See tonight&rsquo;s passes</Link>
    </div>
  )
}
