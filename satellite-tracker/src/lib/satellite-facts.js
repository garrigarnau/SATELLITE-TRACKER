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

// CelesTrak SATCAT owner codes for the owners we're likely to show.
const OWNERS = {
  US: 'United States', PRC: 'China', CIS: 'Russia (CIS)', ESA: 'European Space Agency', ISS: 'ISS partners (US, Russia, Europe, Japan, Canada)',
  JPN: 'Japan', IND: 'India', FR: 'France', UK: 'United Kingdom', GER: 'Germany', IT: 'Italy', CA: 'Canada', SES: 'SES (Luxembourg)', EUME: 'EUMETSAT',
}
const STATUS = {
  '+': 'Operational', '-': 'Not operational', P: 'Partially operational', B: 'Backup', S: 'Spare', X: 'Extended mission', D: 'Decayed', '?': 'Unknown',
}

const fmtDate = (iso) => {
  if (!iso) return null
  const d = new Date(`${iso}T00:00:00Z`)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}
const km = (n) => `${Math.round(n).toLocaleString('en-US')} km`

// Rows for the facts list. `satcat` is the CelesTrak SATCAT record (or null),
// `live` the values computed from the TLE in the browser (or null).
export function factRows(id, satcat, live) {
  const f = FACTS[id] || {}
  const rows = []
  const add = (label, value) => value && rows.push([label, value])
  add('Operator', f.operator)
  add('Owner', satcat && (OWNERS[satcat.OWNER] || satcat.OWNER))
  add('Purpose', f.purpose)
  add('Launched', satcat && fmtDate(satcat.LAUNCH_DATE))
  add('Launch vehicle', f.launchVehicle)
  add('Status', satcat && STATUS[satcat.OPS_STATUS_CODE])
  add('International designator', satcat && satcat.OBJECT_ID)
  if (satcat?.APOGEE && satcat?.PERIGEE) add('Altitude', `${km(satcat.PERIGEE)} to ${km(satcat.APOGEE)} (perigee to apogee)`)
  else if (live?.altKm) add('Altitude', `≈${km(live.altKm)} now`)
  const period = satcat?.PERIOD ?? live?.periodMin
  if (period) add('Orbital period', `${period.toFixed(1)} minutes (${(1440 / period).toFixed(1)} orbits a day)`)
  const incl = satcat?.INCLINATION ?? live?.inclination
  if (incl != null) add('Inclination', `${incl.toFixed(1)}°`)
  add('Mass', f.mass)
  add('Size', f.size)
  return rows
}

// One plain-language sentence for satellites without a hand-written summary.
export function genericSummary(name, live) {
  if (!live) return null
  return `${name} orbits Earth about every ${Math.round(live.periodMin)} minutes at roughly ${km(live.altKm)} altitude, on an orbit inclined ${live.inclination.toFixed(1)}° to the equator.`
}

// schema.org description of the satellite for crawlers and AI answer engines.
export function factsJsonLd({ id, name, satcat, url, updated }) {
  const f = FACTS[id] || {}
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
    additionalProperty: factRows(id, satcat, null).map(([k, v]) => ({ '@type': 'PropertyValue', name: k, value: v })),
    subjectOf: { '@type': 'WebPage', url, dateModified: updated },
  }
}
