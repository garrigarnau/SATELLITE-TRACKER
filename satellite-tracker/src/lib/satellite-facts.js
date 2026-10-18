// Citable facts about well-known satellites, shared by the satellite page and
// the build-time prerender (scripts/prerender.mjs). Plain data only: no React.
//
// Descriptive facts are hand-checked against the sources listed per satellite.
// Orbital numbers, owner, launch date and status come from the CelesTrak SATCAT
// record fetched at build time (fallback snapshot: src/data/satcat-fallback.json).

export const FACTS = {
  25544: {
    summary:
      'The International Space Station is a crewed laboratory in low Earth orbit, built and run by five space agencies. Its first module, Zarya, launched in November 1998, and it is the largest structure humans have put in space.',
    operator: 'NASA, Roscosmos, ESA, JAXA and CSA',
    purpose: 'Crewed research laboratory and outpost in low Earth orbit',
    mass: '≈450,000 kg',
    size: '109 m long, 73 m wide across the solar arrays',
    sameAs: ['https://en.wikipedia.org/wiki/International_Space_Station', 'https://www.nasa.gov/international-space-station/'],
    sources: [
      { label: 'NASA: International Space Station', url: 'https://www.nasa.gov/international-space-station/' },
      { label: 'Wikipedia: International Space Station', url: 'https://en.wikipedia.org/wiki/International_Space_Station' },
    ],
  },
  48274: {
    summary:
      "Tiangong is China's crewed space station, operated by the China Manned Space Agency. Its core module, Tianhe, launched in April 2021; the station is roughly a quarter of the ISS's mass.",
    operator: 'China Manned Space Agency (CMSA)',
    purpose: 'Crewed research station (this entry tracks the Tianhe core module)',
    mass: '≈100,000 kg for the whole station; Tianhe module 22,500 kg',
    size: 'Tianhe module 16.6 m long, 4.2 m in diameter',
    sameAs: ['https://en.wikipedia.org/wiki/Tiangong_space_station'],
    sources: [{ label: 'Wikipedia: Tiangong space station', url: 'https://en.wikipedia.org/wiki/Tiangong_space_station' }],
  },
  20580: {
    summary:
      'The Hubble Space Telescope is a NASA and ESA observatory launched by the Space Shuttle Discovery in April 1990. It orbits above the atmosphere to take sharp images in visible, ultraviolet and near-infrared light.',
    operator: 'NASA with ESA (science operations by STScI)',
    purpose: 'Space telescope for visible, ultraviolet and near-infrared astronomy',
    mass: '11,110 kg',
    size: '13.2 m long, 4.2 m in diameter',
    launchVehicle: 'Space Shuttle Discovery (STS-31)',
    sameAs: ['https://en.wikipedia.org/wiki/Hubble_Space_Telescope', 'https://science.nasa.gov/mission/hubble/'],
    sources: [
      { label: 'NASA: Hubble mission', url: 'https://science.nasa.gov/mission/hubble/' },
      { label: 'Wikipedia: Hubble Space Telescope', url: 'https://en.wikipedia.org/wiki/Hubble_Space_Telescope' },
    ],
  },
  27386: {
    summary:
      "Envisat was the European Space Agency's largest Earth-observation satellite, launched on an Ariane 5 in March 2002. ESA lost contact with it on 8 April 2012; it remains in orbit as one of the largest pieces of space debris.",
    operator: 'European Space Agency (ESA)',
    purpose: 'Earth observation (atmosphere, oceans, land and ice); mission ended 2012',
    mass: '8,211 kg',
    size: '26 × 10 × 5 m',
    launchVehicle: 'Ariane 5G',
    sameAs: ['https://en.wikipedia.org/wiki/Envisat'],
    sources: [
      { label: 'ESA: Envisat', url: 'https://earth.esa.int/eogateway/missions/envisat' },
      { label: 'Wikipedia: Envisat', url: 'https://en.wikipedia.org/wiki/Envisat' },
    ],
  },
  25994: {
    summary:
      "Terra is NASA's flagship Earth-observing satellite, launched in December 1999. Its five instruments measure the atmosphere, land, oceans and energy balance to track how the planet's climate is changing.",
    operator: 'NASA',
    purpose: 'Climate and Earth-system research',
    mass: '4,864 kg at launch',
    launchVehicle: 'Atlas IIAS',
    sameAs: ['https://en.wikipedia.org/wiki/Terra_(satellite)', 'https://terra.nasa.gov/'],
    sources: [
      { label: 'NASA: Terra', url: 'https://terra.nasa.gov/' },
      { label: 'Wikipedia: Terra (satellite)', url: 'https://en.wikipedia.org/wiki/Terra_(satellite)' },
    ],
  },
  27424: {
    summary:
      "Aqua is a NASA Earth-observing satellite launched in May 2002 to study Earth's water cycle: precipitation, evaporation, clouds, sea ice and snow cover.",
    operator: 'NASA',
    purpose: "Study of Earth's water cycle",
    mass: '3,117 kg at launch',
    size: '4.8 × 16.7 × 8.0 m',
    launchVehicle: 'Delta II',
    sameAs: ['https://en.wikipedia.org/wiki/Aqua_(satellite)', 'https://aqua.nasa.gov/'],
    sources: [
      { label: 'NASA: Aqua', url: 'https://aqua.nasa.gov/' },
      { label: 'Wikipedia: Aqua (satellite)', url: 'https://en.wikipedia.org/wiki/Aqua_(satellite)' },
    ],
  },
}


// Spanish versions of the descriptive fields above (same keys).
export const FACTS_ES = {
  "25544": {
    summary: "La Estación Espacial Internacional es un laboratorio tripulado en órbita baja, construido y gestionado por cinco agencias espaciales. Su primer módulo, Zarya, se lanzó en noviembre de 1998, y es la mayor estructura que la humanidad ha puesto en el espacio.",
    operator: "NASA, Roscosmos, ESA, JAXA y CSA",
    purpose: "Laboratorio de investigación tripulado y puesto avanzado en órbita baja",
    mass: "≈450.000 kg",
    size: "109 m de largo y 73 m de ancho con los paneles solares"
  },
  "48274": {
    summary: "Tiangong es la estación espacial tripulada de China, operada por la Agencia Espacial Tripulada de China. Su módulo central, Tianhe, se lanzó en abril de 2021; la estación tiene aproximadamente una cuarta parte de la masa de la ISS.",
    operator: "Agencia Espacial Tripulada de China (CMSA)",
    purpose: "Estación de investigación tripulada (esta ficha sigue el módulo central Tianhe)",
    mass: "≈100.000 kg toda la estación; módulo Tianhe, 22.500 kg",
    size: "Módulo Tianhe: 16,6 m de largo y 4,2 m de diámetro"
  },
  "20580": {
    summary: "El telescopio espacial Hubble es un observatorio de la NASA y la ESA lanzado por el transbordador Discovery en abril de 1990. Orbita por encima de la atmósfera para obtener imágenes nítidas en luz visible, ultravioleta e infrarroja cercana.",
    operator: "NASA con la ESA (operaciones científicas del STScI)",
    purpose: "Telescopio espacial para astronomía visible, ultravioleta e infrarroja cercana",
    mass: "11.110 kg",
    size: "13,2 m de largo y 4,2 m de diámetro",
    launchVehicle: "Transbordador espacial Discovery (STS-31)"
  },
  "27386": {
    summary: "Envisat fue el mayor satélite de observación de la Tierra de la Agencia Espacial Europea, lanzado en un Ariane 5 en marzo de 2002. La ESA perdió el contacto con él el 8 de abril de 2012; sigue en órbita como uno de los mayores fragmentos de basura espacial.",
    operator: "Agencia Espacial Europea (ESA)",
    purpose: "Observación de la Tierra (atmósfera, océanos, tierra y hielo); misión finalizada en 2012",
    mass: "8.211 kg",
    size: "26 × 10 × 5 m"
  },
  "25994": {
    summary: "Terra es el principal satélite de observación de la Tierra de la NASA, lanzado en diciembre de 1999. Sus cinco instrumentos miden la atmósfera, la tierra, los océanos y el balance energético para seguir cómo cambia el clima del planeta.",
    operator: "NASA",
    purpose: "Investigación del clima y del sistema terrestre",
    mass: "4.864 kg en el lanzamiento"
  },
  "27424": {
    summary: "Aqua es un satélite de observación de la Tierra de la NASA lanzado en mayo de 2002 para estudiar el ciclo del agua: precipitación, evaporación, nubes, hielo marino y cubierta de nieve.",
    operator: "NASA",
    purpose: "Estudio del ciclo del agua de la Tierra",
    mass: "3.117 kg en el lanzamiento",
    size: "4,8 × 16,7 × 8,0 m"
  }
}

// Descriptive field in the requested language, falling back to English.
const field = (id, key, locale) => (locale === 'es' && FACTS_ES[id]?.[key]) || FACTS[id]?.[key]
export const factSummary = (id, locale = 'en') => field(id, 'summary', locale)
// Source titles are kept as published (they name the source page).
export const sourceLabel = (s) => s.label

// CelesTrak SATCAT owner codes for the owners we're likely to show.
const OWNERS = {
  US: 'United States', PRC: 'China', CIS: 'Russia (CIS)', ESA: 'European Space Agency', ISS: 'ISS partners (US, Russia, Europe, Japan, Canada)',
  JPN: 'Japan', IND: 'India', FR: 'France', UK: 'United Kingdom', GER: 'Germany', IT: 'Italy', CA: 'Canada', SES: 'SES (Luxembourg)', EUME: 'EUMETSAT',
}
const OWNERS_ES = {
  US: 'Estados Unidos', PRC: 'China', CIS: 'Rusia (CEI)', ESA: 'Agencia Espacial Europea', ISS: 'Socios de la ISS (EE. UU., Rusia, Europa, Japón, Canadá)',
  JPN: 'Japón', IND: 'India', FR: 'Francia', UK: 'Reino Unido', GER: 'Alemania', IT: 'Italia', CA: 'Canadá', SES: 'SES (Luxemburgo)', EUME: 'EUMETSAT',
}
const STATUS_ES = {
  '+': 'Operativo', '-': 'No operativo', P: 'Parcialmente operativo', B: 'Reserva', S: 'De repuesto', X: 'Misión ampliada', D: 'Reentrado', '?': 'Desconocido',
}
const LABELS = {
  en: {
    operator: 'Operator', owner: 'Owner', purpose: 'Purpose', launched: 'Launched', vehicle: 'Launch vehicle', status: 'Status',
    designator: 'International designator', altitude: 'Altitude', period: 'Orbital period', inclination: 'Inclination', mass: 'Mass', size: 'Size',
  },
  es: {
    operator: 'Operador', owner: 'Propietario', purpose: 'Finalidad', launched: 'Lanzamiento', vehicle: 'Lanzador', status: 'Estado',
    designator: 'Designación internacional', altitude: 'Altitud', period: 'Periodo orbital', inclination: 'Inclinación', mass: 'Masa', size: 'Tamaño',
  },
}
const STATUS = {
  '+': 'Operational', '-': 'Not operational', P: 'Partially operational', B: 'Backup', S: 'Spare', X: 'Extended mission', D: 'Decayed', '?': 'Unknown',
}

const fmtDate = (iso, locale = 'en') => {
  if (!iso) return null
  const d = new Date(`${iso}T00:00:00Z`)
  return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}
const km = (n, locale = 'en') => `${Math.round(n).toLocaleString(locale === 'es' ? 'es-ES' : 'en-US')} km`
const dec = (n, locale = 'en') => n.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

// Rows for the facts list. `satcat` is the CelesTrak SATCAT record (or null),
// `live` the values computed from the TLE in the browser (or null).
export function factRows(id, satcat, live, locale = 'en') {
  const es = locale === 'es'
  const L = LABELS[es ? 'es' : 'en']
  const f = (key) => field(id, key, locale)
  const rows = []
  const add = (label, value) => value && rows.push([label, value])
  add(L.operator, f('operator'))
  add(L.owner, satcat && ((es ? OWNERS_ES : OWNERS)[satcat.OWNER] || satcat.OWNER))
  add(L.purpose, f('purpose'))
  add(L.launched, satcat && fmtDate(satcat.LAUNCH_DATE, locale))
  add(L.vehicle, f('launchVehicle'))
  add(L.status, satcat && (es ? STATUS_ES : STATUS)[satcat.OPS_STATUS_CODE])
  add(L.designator, satcat && satcat.OBJECT_ID)
  if (satcat?.APOGEE && satcat?.PERIGEE) {
    add(L.altitude, es
      ? `De ${km(satcat.PERIGEE, locale)} a ${km(satcat.APOGEE, locale)} (perigeo a apogeo)`
      : `${km(satcat.PERIGEE)} to ${km(satcat.APOGEE)} (perigee to apogee)`)
  } else if (live?.altKm) add(L.altitude, es ? `≈${km(live.altKm, locale)} ahora` : `≈${km(live.altKm)} now`)
  const period = satcat?.PERIOD ?? live?.periodMin
  if (period) {
    add(L.period, es
      ? `${dec(period, locale)} minutos (${dec(1440 / period, locale)} órbitas al día)`
      : `${period.toFixed(1)} minutes (${(1440 / period).toFixed(1)} orbits a day)`)
  }
  const incl = satcat?.INCLINATION ?? live?.inclination
  if (incl != null) add(L.inclination, `${es ? dec(incl, locale) : incl.toFixed(1)}°`)
  add(L.mass, f('mass'))
  add(L.size, f('size'))
  return rows
}

// One plain-language sentence for satellites without a hand-written summary.
export function genericSummary(name, live, locale = 'en') {
  if (!live) return null
  if (locale === 'es') {
    return `${name} da una vuelta a la Tierra cada ${Math.round(live.periodMin)} minutos aproximadamente, a unos ${km(live.altKm, locale)} de altitud, en una órbita inclinada ${dec(live.inclination, locale)}° respecto al ecuador.`
  }
  return `${name} orbits Earth about every ${Math.round(live.periodMin)} minutes at roughly ${km(live.altKm)} altitude, on an orbit inclined ${live.inclination.toFixed(1)}° to the equator.`
}

// schema.org description of the satellite for crawlers and AI answer engines.
export function factsJsonLd({ id, name, satcat, url, updated, locale = 'en' }) {
  const f = { ...FACTS[id], summary: factSummary(id, locale) }
  return {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    '@id': `${url}#satellite`,
    name,
    alternateName: [satcat?.OBJECT_NAME, `NORAD ${id}`, satcat?.OBJECT_ID].filter(Boolean),
    description: f.summary,
    url,
    sameAs: f.sameAs,
    identifier: [
      { '@type': 'PropertyValue', propertyID: 'NORAD catalog number', value: String(id) },
      satcat?.OBJECT_ID && { '@type': 'PropertyValue', propertyID: 'COSPAR ID', value: satcat.OBJECT_ID },
    ].filter(Boolean),
    inLanguage: locale,
    additionalProperty: factRows(id, satcat, null, locale).map(([k, v]) => ({ '@type': 'PropertyValue', name: k, value: v })),
    subjectOf: { '@type': 'WebPage', url, dateModified: updated },
  }
}
