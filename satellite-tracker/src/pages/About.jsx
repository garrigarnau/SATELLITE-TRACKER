import { Link } from 'react-router-dom'
import { useObserver, observerQuery } from '../lib/observer'
import { useSeo } from '../lib/seo'
import { META } from '../lib/seo-data'
import { useT } from '../lib/i18n'

const A = ({ href, children }) => <a href={href} target="_blank" rel="noreferrer">{children}</a>

export default function About() {
  const [observer] = useObserver()
  const t = useT()
  useSeo(META[t.locale].about)
  const q = observerQuery(observer)
  const Body = t.locale === 'es' ? AboutEs : AboutEn
  return (
    <div className="wrap page prose">
      <Body starlink={<Link to={t.lp(`/starlink${q}`)}>{t.locale === 'es' ? 'página de Starlink' : 'Starlink page'}</Link>} />
      <Link className="btn" to={t.lp(`/${q}`)}>{t.locale === 'es' ? 'Ver los pasos de esta noche' : 'See tonight’s passes'}</Link>
    </div>
  )
}

function AboutEn({ starlink }) {
  return (
    <>
      <p className="eyebrow">About</p>
      <h1 className="section__title">A window on what&rsquo;s above you</h1>
      <p>
        Satellite Tracker tells you when bright satellites, like the International Space Station, will cross your sky and
        where to look. It also follows any object in orbit live, from its position and speed to its path over the Earth.
      </p>
      <h2>How it works</h2>
      <p>
        Orbital elements come from <A href="https://celestrak.org">CelesTrak</A>. Pass predictions, live
        positions and sky paths are computed in your browser from them with{' '}
        <A href="https://github.com/shashwatak/satellite-js">satellite.js</A>: a pass counts as visible
        when the satellite is at least 10° up, lit by the sun and your sky is dark. The live list of what&rsquo;s overhead comes from{' '}
        <A href="https://www.n2yo.com">N2YO</A>, city search from{' '}
        <A href="https://opencagedata.com">OpenCage</A> and cloud forecasts from{' '}
        <A href="https://open-meteo.com">Open-Meteo</A>.
      </p>
      <h2>Starlink over contested regions</h2>
      <p>
        The {starlink} counts how many Starlink satellites are at least 25° above
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
        A non-profit side project by <A href="https://arnaugarriga.com">Arnau Garriga</A>, started to learn React and kept
        alive by a love of looking up at night. The code is on <A href="https://github.com/garrigarnau/SATELLITE-TRACKER">GitHub</A>.
      </p>
    </>
  )
}

function AboutEs({ starlink }) {
  return (
    <>
      <p className="eyebrow">Acerca de</p>
      <h1 className="section__title">Una ventana a lo que pasa sobre ti</h1>
      <p>
        Satellite Tracker te dice cuándo cruzarán tu cielo los satélites brillantes, como la Estación Espacial Internacional, y
        hacia dónde mirar. También sigue en directo cualquier objeto en órbita: su posición, su velocidad y su trayectoria sobre la Tierra.
      </p>
      <h2>Cómo funciona</h2>
      <p>
        Los elementos orbitales proceden de <A href="https://celestrak.org">CelesTrak</A>. A partir de ellos, tu navegador calcula
        las predicciones de pasos, las posiciones en directo y las trayectorias en el cielo con{' '}
        <A href="https://github.com/shashwatak/satellite-js">satellite.js</A>: un paso cuenta como visible cuando el satélite está
        al menos a 10° de altura, iluminado por el sol, y tu cielo está oscuro. La lista en directo de lo que hay sobre ti viene de{' '}
        <A href="https://www.n2yo.com">N2YO</A>, la búsqueda de ciudades de <A href="https://opencagedata.com">OpenCage</A> y la
        previsión de nubes de <A href="https://open-meteo.com">Open-Meteo</A>.
      </p>
      <h2>Starlink sobre zonas en conflicto</h2>
      <p>
        La {starlink} cuenta cuántos satélites Starlink están al menos a 25° sobre el horizonte desde varias ciudades en zonas de
        conflicto, ahora y durante los próximos 90 minutos, con Madrid y Quito como referencia. Tu navegador propaga los elementos
        orbitales públicos de todos los Starlink a partir de CelesTrak. Es geometría, no servicio: SpaceX activa o desactiva Starlink
        según la ubicación, y aquí no se mide quién lo usa. Las cifras dependen sobre todo de la latitud, no de la política.
      </p>
      <h2>Cómo ver un satélite</h2>
      <ul>
        <li>Busca un punto de luz fijo, sin parpadeo, que se desplace suavemente por el cielo.</li>
        <li>Los mejores pasos se producen en las dos horas posteriores a la puesta de sol o anteriores al amanecer.</li>
        <li>Cuanto mayor es la elevación y menor la magnitud, más fácil y brillante es el paso.</li>
      </ul>
      <h2>Quién lo ha hecho</h2>
      <p>
        Un proyecto personal sin ánimo de lucro de <A href="https://arnaugarriga.com">Arnau Garriga</A>, que empezó para aprender
        React y sigue vivo por el gusto de mirar al cielo de noche. El código está en{' '}
        <A href="https://github.com/garrigarnau/SATELLITE-TRACKER">GitHub</A>.
      </p>
    </>
  )
}
