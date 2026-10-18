// Questions people ask about spotting satellites, answered in plain text.
// Shared by the FAQ section (React), the FAQPage JSON-LD, and the build-time
// prerender (scripts/prerender.mjs) so crawlers that don't run JavaScript,
// including AI answer engines, can read and cite the answers.
// Plain data only: no React here.

const NASA_FACTS = 'https://www.nasa.gov/international-space-station/space-station-facts-and-figures/'
const NASA_SPOT = 'https://www.nasa.gov/spot-the-station/'
const ESA_WHERE = 'https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/International_Space_Station/Where_is_the_International_Space_Station'
const WIKI_MAG = 'https://en.wikipedia.org/wiki/Apparent_magnitude'
const WIKI_STARLINK = 'https://en.wikipedia.org/wiki/Starlink'

export const FAQ = [
  {
    q: 'When can I see the ISS from my city?',
    a: 'Search your city on Satellite Tracker to get every naked-eye pass of the International Space Station and other bright satellites for the next 10 days, with the time, the direction to face, how high it climbs and the cloud forecast. A pass is listed when the satellite rises at least 10° above the horizon, is lit by the Sun and your sky is dark.',
    sources: [NASA_SPOT],
  },
  {
    q: 'Why can I only see satellites around dawn and dusk?',
    a: 'Satellites don’t make their own light; you see sunlight reflecting off them. That only works when your sky is dark but the satellite, hundreds of kilometres up, is still in sunlight, which happens in the hours after sunset and before sunrise. In the middle of the night most low satellites are in Earth’s shadow.',
    sources: [NASA_SPOT],
  },
  {
    q: 'How fast does the ISS move and how high is it?',
    a: 'The International Space Station orbits about 400 km above Earth at roughly 28,000 km/h (about 7.7 km/s), circling the planet every 90 to 92 minutes, or about 16 times a day. Its exact height varies over time as it is periodically reboosted.',
    sources: [NASA_FACTS, ESA_WHERE],
  },
  {
    q: 'What does the ISS look like in the sky?',
    a: 'Like a very bright, steady star moving smoothly across the sky, faster than a plane and without blinking lights. A typical visible pass lasts a few minutes, and the station can fade out mid-sky when it enters Earth’s shadow.',
    sources: [NASA_SPOT],
  },
  {
    q: 'Do I need a telescope or binoculars?',
    a: 'No. The ISS and the other satellites listed as visible can be seen with the naked eye. Binoculars can help with fainter ones, but a moving satellite is hard to keep in a telescope’s field of view.',
    sources: [NASA_SPOT],
  },
  {
    q: 'What does magnitude mean for a pass?',
    a: 'Magnitude is astronomers’ brightness scale, and lower means brighter. Sirius, the brightest star, is about −1.5 and Venus about −4.2; from a dark site the eye reaches about +6.5, much less in a city. The ISS can reach about −5.9 at its brightest. Satellite Tracker labels passes from faint to very bright using this scale.',
    sources: [WIKI_MAG],
  },
  {
    q: 'What is a Starlink train?',
    a: 'Shortly after a launch, a batch of Starlink satellites travels close together in a low orbit and can look like a line of lights crossing the sky. Over the following days and weeks they raise their orbits and spread out, and the train disappears. Starlink satellites are also brighter before they reach their final orbit.',
    sources: [WIKI_STARLINK],
  },
  {
    q: 'How accurate are the pass predictions?',
    a: 'Positions are computed from the latest public orbital elements (TLE/OMM data from CelesTrak) with the standard SGP4 model, which is typically good to within about a minute for a pass in the next few days. Accuracy drops further ahead, and the ISS can move slightly after a reboost, so check again on the day.',
    sources: ['https://celestrak.org/'],
  },
  {
    q: 'What do azimuth and elevation mean?',
    a: 'Azimuth is the compass direction to look, in degrees clockwise from north: 0° is north, 90° east, 180° south and 270° west. Elevation is the angle above the horizon: 0° is the horizon and 90° is straight overhead. The higher the maximum elevation, the better the pass.',
    sources: [NASA_SPOT],
  },
]

export function faqJsonLd(items = FAQ) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}
