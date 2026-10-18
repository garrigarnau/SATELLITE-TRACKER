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
        Pass predictions and the list of what&rsquo;s overhead come from the <a href="https://www.n2yo.com" target="_blank" rel="noreferrer">N2YO</a> API.
        Live positions and sky paths are computed in your browser from each satellite&rsquo;s orbital elements with{' '}
        <a href="https://github.com/shashwatak/satellite-js" target="_blank" rel="noreferrer">satellite.js</a>. City search uses{' '}
        <a href="https://opencagedata.com" target="_blank" rel="noreferrer">OpenCage</a>.
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
