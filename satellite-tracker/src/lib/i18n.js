// Tiny i18n: two flat dictionaries and a hook. The locale comes from the URL
// (/es/... is Spanish, everything else English), so pages are linkable and
// crawlable per language. Strings take {placeholders}; a missing Spanish key
// falls back to English.
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { localeFromPath, localizePath } from './paths'

const en = {
  // Header, footer, generic
  'nav.tonight': 'Tonight',
  'nav.starlink': 'Starlink',
  'nav.about': 'About',
  'nav.home': 'Satellite Tracker, home',
  'nav.primary': 'Primary',
  'nav.changeLocation': 'Change location',
  'nav.language': 'Language',
  'footer.data': 'Orbits from CelesTrak · Overhead from N2YO ·',
  'footer.weather': 'Weather by Open-Meteo',
  'footer.source': 'Source on GitHub',
  'notFound.title': 'Lost in space',
  'notFound.body': 'This page doesn’t exist.',
  'common.backTonight': 'Back to tonight',
  'common.you': 'You',
  'common.yourLocation': 'Your location',
  'common.myLocation': 'My location',

  // Location search
  'search.placeholder': 'Search a city…',
  'search.label': 'Search a city',
  'search.searching': 'Searching',
  'search.useLocation': 'Use my location',
  'search.locating': 'Locating…',
  'search.noResults': 'No places found. Try a nearby city.',
  'search.unavailable': 'Search is unavailable right now.',
  'search.noGeo': 'Your browser cannot share its location.',
  'search.denied': 'Location access was denied. Search for a city instead.',

  // Hero
  'hero.eyebrow': 'Look up tonight',
  'hero.title': 'See what’s flying over you.',
  'hero.lede': 'Find the next time the ISS and other bright satellites cross your sky, and track anything in orbit live.',
  'hero.also': 'Also on Satellite Tracker',
  'promo.eyebrow': 'New · Starlink over contested regions',
  'promo.title': 'Who’s overhead in Kyiv, Tehran or Caracas?',
  'promo.body':
    'Starlink has become part of wars and politics, from Ukraine’s front line to Iran’s ban. We count how many of its satellites are above these places right now, and explain why coverage isn’t the same as service.',
  'promo.cta': 'Open the Starlink page →',

  // Home: passes
  'home.h1': 'ISS and satellite passes over {city}',
  'passes.eyebrow': 'Next 10 days',
  'passes.title': 'Visible passes from {city}',
  'passes.note':
    'Bright satellites you can spot with the naked eye. Passes cluster around dusk and dawn, when your sky is dark but the satellite is still in sunlight.',
  'passes.hideCloudy': 'Hide cloudy passes ({n})',
  'passes.errorTitle': 'Couldn’t load passes',
  'passes.quota': 'The free pass-prediction quota for this hour is used up. Predictions will be back within the hour.',
  'passes.error': 'The satellite data service didn’t respond. Try again in a few minutes.',
  'passes.allCloudy': 'Every pass in the forecast window looks clouded out.',
  'passes.noneTitle': 'No visible passes in the next 10 days',
  'passes.noneBody':
    'That happens around midsummer at high latitudes, when the sky never gets dark enough. Check what’s overhead below instead.',
  'passes.more': 'Show more passes ({n})',

  // Home: overhead
  'overhead.eyebrow': 'Right now',
  'overhead.title': 'Overhead',
  'overhead.note': 'Satellites currently within 70° of straight up from you. Pick one to follow it live.',
  'overhead.categories': 'Satellite category',
  'overhead.scanning': 'Scanning the sky…',
  'overhead.count': '{n} above you',
  'overhead.starlinkMore': 'How many are over Kyiv, Tehran or Caracas right now? →',
  'overhead.error': 'Couldn’t reach the satellite data service.',
  'overhead.empty': 'Nothing in this category is above you right now.',
  'picked.eyebrow': 'Selected · NORAD {id}',
  'picked.meta': '{alt} km up · solid line: last half orbit · dashed: next orbit',
  'picked.track': 'Track live →',
  'picked.clear': 'Clear',
  'cat.20': 'GPS',
  'cat.18': 'Amateur radio',
  'cat.52': 'Starlink',
  'cat.2': 'Space stations',
  'cat.1': 'Brightest',
  'cat.3': 'Weather',

  // Ownership
  'own.owner': 'Owner',
  'own.aria': 'Satellites above you by owner',
  'own.military': '{n} of {total} military',
  'own.militaryHint': 'Counted against CelesTrak’s miscellaneous military list, which is not exhaustive.',
  'own.other': 'Other / unknown',

  // Pass card
  'pass.visibleNow': 'Visible now',
  'pass.to': 'to',
  'pass.peaks': 'peaks at {el}° in the {dir}',
  'pass.duration': 'Duration',
  'pass.height': 'Height',
  'pass.brightness': 'Brightness',
  'pass.sky': 'Sky',
  'pass.cloudTitle': '{pct}% cloud cover forecast at peak',
  'pass.loadingForecast': 'Loading forecast',
  'pass.noForecast': 'No forecast yet',
  'bright.unknown': 'Unknown',
  'bright.veryBright': 'Very bright',
  'bright.bright': 'Bright',
  'bright.visible': 'Visible',
  'bright.faint': 'Faint',
  'sky.clear': 'Clear',
  'sky.partly': 'Partly',
  'sky.cloudy': 'Cloudy',
  'skyPhrase.clear': 'clear skies',
  'skyPhrase.partly': 'partly cloudy',
  'skyPhrase.cloudy': 'mostly cloudy',
  'skyPhrase.cloudedOut': 'likely clouded out',

  // Dates and countdowns
  'day.tonight': 'Tonight',
  'day.tomorrow': 'Tomorrow',
  'count.now': 'now',
  'count.d': 'in {d}d {h}h',
  'count.h': 'in {h}h {m}m',
  'count.m': 'in {m}m',
  'count.s': 'in {s}s',

  // Sky chart
  'chart.start': 'Start',
  'chart.peak': 'Peak',
  'chart.end': 'End',
  'chart.aria': 'Sky path from {from} to {to}, peaking at {el} degrees',
  'chart.label': 'Sky chart',

  // Satellite page
  'sat.notFound': 'Satellite not found',
  'sat.checkId': '{message}. Check the NORAD ID ({id}).',
  'sat.back': '← Tonight',
  'sat.above': 'Above your horizon · {dir}',
  'sat.below': 'Below your horizon',
  'sat.live': 'Live',
  'sat.follow': 'Follow on map',
  'sat.lat': 'Latitude',
  'sat.lon': 'Longitude',
  'sat.alt': 'Altitude',
  'sat.speed': 'Speed',
  'sat.orbit': 'Orbit',
  'sat.azimuth': 'Azimuth',
  'sat.azimuthHint': 'Compass direction to look, in degrees clockwise from north.',
  'sat.elevation': 'Elevation',
  'sat.elevationHint': 'Angle above the horizon. 0° is the horizon, 90° is straight up.',
  'sat.distance': 'Distance',
  'sat.computed': 'Computed in your browser from the satellite’s latest orbital elements.',
  'sat.whenTitle': 'When can you see it?',
  'sat.whenNote': 'Set your location to get visible passes and a sky chart.',
  'sat.from': 'From {city}',
  'sat.passesTitle': 'Visible passes',
  'sat.passesNote': 'Next 10 days. Pick a pass to see its path across your sky.',
  'sat.passesError': 'Couldn’t load passes for this satellite.',
  'sat.noneTitle': 'No naked-eye passes in the next 10 days',
  'sat.noneBody': 'It may be too faint, or only crosses your sky in daylight or Earth’s shadow. You can still follow it live above.',
  'sat.caption': 'Face {start}, it rises to {el}° in the {max} and sets in the {end}.',
  'sat.forecast': 'Forecast: {phrase} ({pct}% cloud).',

  // Sparkline
  'spark.summary': 'Between {lo} and {hi} over the next {min} minutes',
  'spark.now': 'Now',
  // Starlink page
  'sl.eyebrow': 'Right now · computed in your browser',
  'sl.title': 'Starlink over contested regions',
  'sl.minElevation': 'Minimum elevation',
  'sl.data': 'Data: CelesTrak',
  'sl.dataFull': 'Data: CelesTrak · {n} satellites · elements to {date} UTC',
  'sl.lede':
    'How many Starlink satellites are high enough in the sky over these places to talk to a dish on the ground — right now and over the next 90 minutes. It is a geometry count, computed from public orbital data. It does not tell you whether Starlink service is switched on, legal, or being used there.',
  'sl.bannerStrong': 'Coverage is not service.',
  'sl.banner': 'SpaceX switches service on or off by location in software; satellites pass over every country alike.',
  'sl.errorTitle': 'Couldn’t load the Starlink orbits',
  'sl.error': 'The orbital data service didn’t answer ({error}). It refreshes every two hours; try again in a few minutes.',
  'sl.staleTitle': 'Orbital data is out of date',
  'sl.stale': 'The newest elements are from {date} UTC, so positions may be off by more than usual.',
  'sl.regions': 'Regions',
  'sl.reference': 'Reference cities',
  'sl.howTitle': 'How we count',
  'sl.how1':
    'We take the public orbital elements of every Starlink satellite (about 11,000, from CelesTrak, refreshed every two hours) and calculate, every few seconds, which ones are at least 25° above the horizon from each city listed. 25° is roughly the lowest angle a Starlink dish is designed to use. At that angle a satellite 550 km up can be as far as ~940 km away across the ground, so a city’s count also covers its neighbours.',
  'sl.how2':
    'The 90-minute lines share one scale across all cards, so their heights compare directly. Counts at the threshold flicker by a few as satellites cross it; read the trend, not single-digit changes.',
  'sl.lite': ' To save battery on this device, counts refresh every 10 s and the satellite layer shows only the selected region.',
  'sl.sources': 'Sources',
  'sl.attrib1': 'Orbital data:',
  'sl.attrib2': '(GP, derived from 18th Space Defense Squadron data). Context notes link to their sources; last reviewed {date}.',
  'sl.outdated': ' These notes may be out of date.',
  'sl.avg': 'avg {n} · next 90 min',
  'sl.forecasting': 'forecasting…',
  'sl.selected': 'Selected · ≥{t}° elevation',
  'sl.countText': 'Starlinks at least {t}° above the horizon',
  'sl.now': 'now',
  'sl.nowHint': 'Counted from one point in the city. The dashed circle on the map is the ground area those satellites sit over.',
  'sl.min': 'Min',
  'sl.max': 'Max',
  'sl.average': 'Average',
  'sl.window': 'Window',
  'sl.asOf': 'As of {date}',
  'sl.highest': 'Highest right now',
  'sl.satMeta': '#{id} · {alt} km up',
  'sl.satTip': '{name} · {el}° up',
  'sl.caveatsTitle': 'What this doesn’t show',
  'sl.c1s': 'Coverage is not service.',
  'sl.c1': 'SpaceX turns service on or off by location in software (geofencing). Satellites pass over every country, including ones where Starlink is not licensed or has been switched off.',
  'sl.c2s': 'No usage data.',
  'sl.c2': 'Nothing here measures how many dishes are active or who uses them.',
  'sl.c3s': 'Military satellites aren’t included.',
  'sl.c3': 'SpaceX’s Starshield satellites for governments are a separate system and largely absent from public catalogues.',
  'sl.c4s': 'Latitude, not politics.',
  'sl.c4': 'The numbers mostly reflect how far a place is from the equator. Compare with Madrid and Quito, shown for reference.',
  'sl.c5s': 'Predictions drift.',
  'sl.c5': 'Positions come from orbital models that are accurate to a few kilometres for a day or two; satellites that manoeuvre can be off by more.',
}

const es = {
  'nav.tonight': 'Esta noche',
  'nav.starlink': 'Starlink',
  'nav.about': 'Acerca de',
  'nav.home': 'Satellite Tracker, inicio',
  'nav.primary': 'Principal',
  'nav.changeLocation': 'Cambiar ubicación',
  'nav.language': 'Idioma',
  'footer.data': 'Órbitas de CelesTrak · Satélites sobre ti de N2YO ·',
  'footer.weather': 'Meteorología de Open-Meteo',
  'footer.source': 'Código en GitHub',
  'notFound.title': 'Perdido en el espacio',
  'notFound.body': 'Esta página no existe.',
  'common.backTonight': 'Volver a esta noche',
  'common.you': 'Tú',
  'common.yourLocation': 'Tu ubicación',
  'common.myLocation': 'Mi ubicación',

  'search.placeholder': 'Busca una ciudad…',
  'search.label': 'Busca una ciudad',
  'search.searching': 'Buscando',
  'search.useLocation': 'Usar mi ubicación',
  'search.locating': 'Localizando…',
  'search.noResults': 'No se han encontrado lugares. Prueba con una ciudad cercana.',
  'search.unavailable': 'La búsqueda no está disponible ahora mismo.',
  'search.noGeo': 'Tu navegador no puede compartir tu ubicación.',
  'search.denied': 'Se ha denegado el acceso a la ubicación. Busca una ciudad.',

  'hero.eyebrow': 'Mira al cielo esta noche',
  'hero.title': 'Descubre qué vuela sobre ti.',
  'hero.lede':
    'Averigua cuándo pasarán por tu cielo la Estación Espacial Internacional y otros satélites brillantes, y sigue en directo cualquier objeto en órbita.',
  'hero.also': 'También en Satellite Tracker',
  'promo.eyebrow': 'Nuevo · Starlink sobre zonas en conflicto',
  'promo.title': '¿Cuántos hay sobre Kiev, Teherán o Caracas?',
  'promo.body':
    'Starlink se ha convertido en parte de guerras y de la política, del frente de Ucrania a la prohibición en Irán. Contamos cuántos de sus satélites hay ahora mismo sobre estos lugares y explicamos por qué cobertura no es lo mismo que servicio.',
  'promo.cta': 'Abrir la página de Starlink →',

  'home.h1': 'Pasos de la ISS y otros satélites sobre {city}',
  'passes.eyebrow': 'Próximos 10 días',
  'passes.title': 'Pasos visibles desde {city}',
  'passes.note':
    'Satélites brillantes que puedes ver a simple vista. Los pasos se concentran al anochecer y al amanecer, cuando tu cielo está oscuro pero el satélite sigue iluminado por el sol.',
  'passes.hideCloudy': 'Ocultar pasos nublados ({n})',
  'passes.errorTitle': 'No se han podido cargar los pasos',
  'passes.quota': 'Se ha agotado la cuota gratuita de predicciones de esta hora. Volverán en menos de una hora.',
  'passes.error': 'El servicio de datos de satélites no ha respondido. Inténtalo de nuevo en unos minutos.',
  'passes.allCloudy': 'Todos los pasos del periodo de previsión parecen tapados por las nubes.',
  'passes.noneTitle': 'No hay pasos visibles en los próximos 10 días',
  'passes.noneBody':
    'Ocurre cerca del solsticio de verano en latitudes altas, cuando el cielo nunca llega a oscurecer lo suficiente. Mira abajo qué hay sobre ti ahora.',
  'passes.more': 'Ver más pasos ({n})',

  'overhead.eyebrow': 'Ahora mismo',
  'overhead.title': 'Sobre ti',
  'overhead.note': 'Satélites que están ahora a menos de 70° de tu cénit. Elige uno para seguirlo en directo.',
  'overhead.categories': 'Categoría de satélite',
  'overhead.scanning': 'Explorando el cielo…',
  'overhead.count': '{n} sobre ti',
  'overhead.starlinkMore': '¿Cuántos hay ahora sobre Kiev, Teherán o Caracas? →',
  'overhead.error': 'No se ha podido contactar con el servicio de datos de satélites.',
  'overhead.empty': 'Ahora mismo no hay nada de esta categoría sobre ti.',
  'picked.eyebrow': 'Seleccionado · NORAD {id}',
  'picked.meta': 'a {alt} km de altura · línea continua: última media órbita · discontinua: próxima órbita',
  'picked.track': 'Seguir en directo →',
  'picked.clear': 'Quitar',
  'cat.20': 'GPS',
  'cat.18': 'Radioaficionados',
  'cat.52': 'Starlink',
  'cat.2': 'Estaciones espaciales',
  'cat.1': 'Más brillantes',
  'cat.3': 'Meteorológicos',

  'own.owner': 'Propietario',
  'own.aria': 'Satélites sobre ti por propietario',
  'own.military': '{n} de {total} militares',
  'own.militaryHint': 'Contados con la lista de satélites militares varios de CelesTrak, que no es exhaustiva.',
  'own.other': 'Otros / desconocido',

  'pass.visibleNow': 'Visible ahora',
  'pass.to': 'a',
  'pass.peaks': 'máximo de {el}° hacia el {dir}',
  'pass.duration': 'Duración',
  'pass.height': 'Altura',
  'pass.brightness': 'Brillo',
  'pass.sky': 'Cielo',
  'pass.cloudTitle': '{pct}% de nubosidad prevista en el punto más alto',
  'pass.loadingForecast': 'Cargando previsión',
  'pass.noForecast': 'Aún sin previsión',
  'bright.unknown': 'Desconocido',
  'bright.veryBright': 'Muy brillante',
  'bright.bright': 'Brillante',
  'bright.visible': 'Visible',
  'bright.faint': 'Tenue',
  'sky.clear': 'Despejado',
  'sky.partly': 'Nubes y claros',
  'sky.cloudy': 'Nublado',
  'skyPhrase.clear': 'cielo despejado',
  'skyPhrase.partly': 'parcialmente nublado',
  'skyPhrase.cloudy': 'mayormente nublado',
  'skyPhrase.cloudedOut': 'probablemente tapado por las nubes',

  'day.tonight': 'Esta noche',
  'day.tomorrow': 'Mañana',
  'count.now': 'ahora',
  'count.d': 'en {d} d {h} h',
  'count.h': 'en {h} h {m} min',
  'count.m': 'en {m} min',
  'count.s': 'en {s} s',

  'chart.start': 'Inicio',
  'chart.peak': 'Máximo',
  'chart.end': 'Fin',
  'chart.aria': 'Trayectoria en el cielo de {from} a {to}, con un máximo de {el} grados',
  'chart.label': 'Carta del cielo',

  'sat.notFound': 'Satélite no encontrado',
  'sat.checkId': '{message}. Comprueba el número NORAD ({id}).',
  'sat.back': '← Esta noche',
  'sat.above': 'Sobre tu horizonte · {dir}',
  'sat.below': 'Bajo tu horizonte',
  'sat.live': 'En directo',
  'sat.follow': 'Seguir en el mapa',
  'sat.lat': 'Latitud',
  'sat.lon': 'Longitud',
  'sat.alt': 'Altitud',
  'sat.speed': 'Velocidad',
  'sat.orbit': 'Órbita',
  'sat.azimuth': 'Acimut',
  'sat.azimuthHint': 'Dirección de la brújula hacia la que mirar, en grados desde el norte en sentido horario.',
  'sat.elevation': 'Elevación',
  'sat.elevationHint': 'Ángulo sobre el horizonte. 0° es el horizonte y 90°, justo encima de ti.',
  'sat.distance': 'Distancia',
  'sat.computed': 'Calculado en tu navegador a partir de los elementos orbitales más recientes del satélite.',
  'sat.whenTitle': '¿Cuándo puedes verlo?',
  'sat.whenNote': 'Indica tu ubicación para ver los pasos visibles y la carta del cielo.',
  'sat.from': 'Desde {city}',
  'sat.passesTitle': 'Pasos visibles',
  'sat.passesNote': 'Próximos 10 días. Elige un paso para ver su trayectoria en tu cielo.',
  'sat.passesError': 'No se han podido cargar los pasos de este satélite.',
  'sat.noneTitle': 'No hay pasos visibles a simple vista en los próximos 10 días',
  'sat.noneBody':
    'Puede que sea demasiado tenue o que solo cruce tu cielo de día o dentro de la sombra de la Tierra. Puedes seguirlo en directo arriba.',
  'sat.caption': 'Mira hacia el {start}: sube hasta {el}° hacia el {max} y se pone por el {end}.',
  'sat.forecast': 'Previsión: {phrase} ({pct}% de nubes).',

  'spark.summary': 'Entre {lo} y {hi} en los próximos {min} minutos',
  'spark.now': 'Ahora',
  'sl.eyebrow': 'Ahora mismo · calculado en tu navegador',
  'sl.title': 'Starlink sobre zonas en conflicto',
  'sl.minElevation': 'Elevación mínima',
  'sl.data': 'Datos: CelesTrak',
  'sl.dataFull': 'Datos: CelesTrak · {n} satélites · elementos hasta el {date} UTC',
  'sl.lede':
    'Cuántos satélites Starlink están lo bastante altos en el cielo de estos lugares como para comunicarse con una antena en tierra, ahora mismo y durante los próximos 90 minutos. Es un recuento geométrico, calculado con datos orbitales públicos. No indica si el servicio de Starlink está activado, si es legal ni si se usa allí.',
  'sl.bannerStrong': 'Cobertura no es servicio.',
  'sl.banner': 'SpaceX activa o desactiva el servicio por ubicación mediante software; los satélites pasan igual por encima de todos los países.',
  'sl.errorTitle': 'No se han podido cargar las órbitas de Starlink',
  'sl.error': 'El servicio de datos orbitales no ha respondido ({error}). Se actualiza cada dos horas; vuelve a intentarlo en unos minutos.',
  'sl.staleTitle': 'Los datos orbitales están desactualizados',
  'sl.stale': 'Los elementos más recientes son del {date} UTC, así que las posiciones pueden desviarse más de lo habitual.',
  'sl.regions': 'Zonas',
  'sl.reference': 'Ciudades de referencia',
  'sl.howTitle': 'Cómo contamos',
  'sl.how1':
    'Tomamos los elementos orbitales públicos de todos los satélites Starlink (unos 11.000, de CelesTrak, actualizados cada dos horas) y calculamos cada pocos segundos cuáles están al menos a 25° sobre el horizonte desde cada ciudad de la lista. 25° es aproximadamente el ángulo más bajo para el que está diseñada una antena de Starlink. Con ese ángulo, un satélite a 550 km de altura puede estar hasta a unos 940 km de distancia sobre el terreno, así que el recuento de una ciudad también abarca a sus vecinas.',
  'sl.how2':
    'Las líneas de 90 minutos comparten la misma escala en todas las tarjetas, así que sus alturas se pueden comparar directamente. Los recuentos en el umbral oscilan unas pocas unidades cuando los satélites lo cruzan; fíjate en la tendencia, no en cambios de una cifra.',
  'sl.lite': ' Para ahorrar batería en este dispositivo, los recuentos se actualizan cada 10 s y la capa de satélites solo muestra la zona seleccionada.',
  'sl.sources': 'Fuentes',
  'sl.attrib1': 'Datos orbitales:',
  'sl.attrib2': '(GP, derivados de datos del 18.º Escuadrón de Defensa Espacial). Las notas de contexto enlazan a sus fuentes; última revisión: {date}.',
  'sl.outdated': ' Puede que estas notas estén desactualizadas.',
  'sl.avg': 'media {n} · próximos 90 min',
  'sl.forecasting': 'calculando previsión…',
  'sl.selected': 'Seleccionada · elevación ≥{t}°',
  'sl.countText': 'Starlink al menos a {t}° sobre el horizonte',
  'sl.now': 'ahora',
  'sl.nowHint': 'Contados desde un punto de la ciudad. El círculo discontinuo del mapa es la zona del terreno sobre la que están esos satélites.',
  'sl.min': 'Mín.',
  'sl.max': 'Máx.',
  'sl.average': 'Media',
  'sl.window': 'Periodo',
  'sl.asOf': 'A {date}',
  'sl.highest': 'Los más altos ahora',
  'sl.satMeta': '#{id} · a {alt} km de altura',
  'sl.satTip': '{name} · a {el}° de altura',
  'sl.caveatsTitle': 'Lo que esto no muestra',
  'sl.c1s': 'Cobertura no es servicio.',
  'sl.c1': 'SpaceX activa o desactiva el servicio por ubicación mediante software (geovallas). Los satélites pasan por encima de todos los países, incluidos aquellos donde Starlink no tiene licencia o se ha desactivado.',
  'sl.c2s': 'Sin datos de uso.',
  'sl.c2': 'Aquí no se mide cuántas antenas están activas ni quién las usa.',
  'sl.c3s': 'No incluye satélites militares.',
  'sl.c3': 'Los satélites Starshield de SpaceX para gobiernos son un sistema aparte y casi no aparecen en los catálogos públicos.',
  'sl.c4s': 'Latitud, no política.',
  'sl.c4': 'Las cifras reflejan sobre todo la distancia de cada lugar al ecuador. Compáralas con Madrid y Quito, que se muestran como referencia.',
  'sl.c5s': 'Las predicciones se desvían.',
  'sl.c5': 'Las posiciones salen de modelos orbitales con una precisión de pocos kilómetros durante uno o dos días; los satélites que maniobran pueden desviarse más.',
}

export const DICTS = { en, es }

let current = 'en'
// The App sets this on every render from the URL, so plain modules (format.js)
// can format in the active language without a hook.
export const setLocale = (locale) => { current = locale }
export const getLocale = () => current

export function translate(locale, key, vars) {
  let s = DICTS[locale]?.[key] ?? en[key]
  if (s == null) {
    if (import.meta.env?.DEV) console.warn(`i18n: missing key "${key}"`)
    return key
  }
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m))
  return s
}

export const tr = (key, vars) => translate(current, key, vars)

export function useLocale() {
  const { pathname } = useLocation()
  return localeFromPath(pathname)
}

// t(key, vars) plus t.locale and t.lp(englishPath) for localized links.
export function useT() {
  const locale = useLocale()
  return useMemo(() => {
    const t = (key, vars) => translate(locale, key, vars)
    t.locale = locale
    t.lp = (path) => localizePath(path, locale)
    return t
  }, [locale])
}

// Intl locale tag: English keeps the browser's own formats, as before.
export const intlLocale = (locale = current) => (locale === 'es' ? 'es-ES' : undefined)

// 16-point compass labels: Spanish uses O (oeste) for W.
export const localCompass = (dir, locale = current) => (locale === 'es' && dir ? dir.replace(/W/g, 'O') : dir)

// Owner names (as produced by celestrak.js ownerName) in Spanish.
const OWNERS_ES = {
  'United States': 'Estados Unidos', China: 'China', 'Russia / CIS': 'Rusia / CEI', ESA: 'ESA', 'ISS partners': 'Socios de la ISS',
  Japan: 'Japón', India: 'India', France: 'Francia', Germany: 'Alemania', 'United Kingdom': 'Reino Unido', Italy: 'Italia',
  Spain: 'España', Canada: 'Canadá', Australia: 'Australia', Israel: 'Israel', 'South Korea': 'Corea del Sur',
  'North Korea': 'Corea del Norte', Taiwan: 'Taiwán', Türkiye: 'Turquía', UAE: 'EAU', 'Saudi Arabia': 'Arabia Saudí',
  Brazil: 'Brasil', Argentina: 'Argentina', Mexico: 'México', Netherlands: 'Países Bajos', Belgium: 'Bélgica', Sweden: 'Suecia',
  Norway: 'Noruega', Finland: 'Finlandia', Denmark: 'Dinamarca', Poland: 'Polonia', Switzerland: 'Suiza', Austria: 'Austria',
  Luxembourg: 'Luxemburgo', Ukraine: 'Ucrania', Kazakhstan: 'Kazajistán', Indonesia: 'Indonesia', Malaysia: 'Malasia',
  Thailand: 'Tailandia', Vietnam: 'Vietnam', Singapore: 'Singapur', Algeria: 'Argelia', Morocco: 'Marruecos', Tunisia: 'Túnez',
  Kenya: 'Kenia', Ghana: 'Ghana', Ethiopia: 'Etiopía', Angola: 'Angola', Chile: 'Chile', Colombia: 'Colombia', Peru: 'Perú',
  Ecuador: 'Ecuador', Uruguay: 'Uruguay', Venezuela: 'Venezuela', Bolivia: 'Bolivia', Czechia: 'Chequia', Hungary: 'Hungría',
  Romania: 'Rumanía', Bulgaria: 'Bulgaria', Greece: 'Grecia', Portugal: 'Portugal', Ireland: 'Irlanda', Estonia: 'Estonia',
  Lithuania: 'Lituania', Slovenia: 'Eslovenia', Croatia: 'Croacia', Belarus: 'Bielorrusia', Azerbaijan: 'Azerbaiyán',
  Bangladesh: 'Bangladés', Nepal: 'Nepal', 'Sri Lanka': 'Sri Lanka', Philippines: 'Filipinas', Mongolia: 'Mongolia',
  Qatar: 'Catar', Bahrain: 'Baréin', Iraq: 'Irak', Monaco: 'Mónaco', 'Singapore / Japan': 'Singapur / Japón',
  'United States / Brazil': 'Estados Unidos / Brasil', 'China / Türkiye': 'China / Turquía', Egypt: 'Egipto',
  'South Africa': 'Sudáfrica', Nigeria: 'Nigeria', Iran: 'Irán', Pakistan: 'Pakistán', 'New Zealand': 'Nueva Zelanda',
  'China / Brazil': 'China / Brasil', 'France / Germany': 'Francia / Alemania', 'France / Italy': 'Francia / Italia',
  'China / ESA': 'China / ESA', 'Other / unknown': 'Otros / desconocido',
}
export const localOwner = (name, locale = current) => (locale === 'es' ? OWNERS_ES[name] || name : name)

// Region fields from regions.json, preferring the `<field>_es` variant in Spanish.
export const regionText = (region, field, locale = current) =>
  (locale === 'es' && region[`${field}_es`]) || region[field]
