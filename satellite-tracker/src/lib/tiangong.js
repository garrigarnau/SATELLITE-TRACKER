// Copy and facts for the Tiangong landing page (/tiangong). Plain data only, so
// the prerender script can bake it into static HTML. Strings are grouped by
// locale so a Spanish version only needs an `es` entry with the same shape.

export const TIANGONG_ID = 48274 // CelesTrak/N2YO track the whole station under the Tianhe core

const SOURCES = {
  wiki: { label: 'Wikipedia: Tiangong space station', url: 'https://en.wikipedia.org/wiki/Tiangong_space_station' },
  nasa: { label: 'NASA: Space Station facts and figures', url: 'https://www.nasa.gov/international-space-station/space-station-facts-and-figures/' },
  celestrakCss: { label: 'CelesTrak SATCAT: CSS (Tianhe), 48274', url: 'https://celestrak.org/satcat/records.php?CATNR=48274' },
  celestrakIss: { label: 'CelesTrak SATCAT: ISS (Zarya), 25544', url: 'https://celestrak.org/satcat/records.php?CATNR=25544' },
}

// Orbit figures are CelesTrak catalogue values as of FACTS_DATE; the live panel
// on the page shows the current ones.
export const FACTS_DATE = '2026-10-18'

export const TIANGONG_COPY = {
  en: {
    eyebrow: 'China Space Station · NORAD 48274',
    title: 'Tiangong tracker: where is China’s space station right now',
    intro: [
      'Tiangong (“Heavenly Palace”) is China’s permanently crewed space station, run by the China Manned Space Agency (CMSA). Its Tianhe core module launched on 29 April 2021, and the Wentian and Mengtian laboratory modules joined it in 2022.',
      'It usually carries three astronauts and circles the Earth about every 92 minutes, some 385 km up. Like the ISS it is bright enough to see with the naked eye when it crosses a dark sky in sunlight, around dawn and dusk.',
    ],
    passesTitle: 'Next visible passes',
    passesNote: 'Naked-eye passes over the next 10 days. Pick one to see its path across your sky.',
    noLocationTitle: 'When can you see Tiangong?',
    noLocationNote: 'Set your location to get Tiangong’s visible passes and where to look.',
    compareTitle: 'Tiangong vs the ISS',
    compareNote: `Orbit figures from the CelesTrak catalogue as of ${FACTS_DATE}.`,
    compareHead: ['', 'Tiangong', 'ISS'],
    compare: [
      ['Operator', 'China Manned Space Agency', 'NASA, Roscosmos, ESA, JAXA and CSA'],
      ['First module launched', '29 Apr 2021 (Tianhe)', '20 Nov 1998 (Zarya)'],
      ['Usual crew', '3 (up to 6)', '7'],
      ['Mass', '~100 t', '~420 t'],
      ['Altitude', '384–386 km', '415–424 km'],
      ['Orbit time', '92.3 min', '93.0 min'],
      ['Inclination', '41.5°', '51.6°'],
      ['Flies over latitudes', 'up to 41.5° N and S', 'up to 51.6° N and S'],
    ],
    compareFootnote:
      'Its lower inclination means Tiangong never flies directly over places north of about 41.5° N, such as most of Europe. From there it can still appear low in the southern sky, while the ISS passes much higher.',
    faqTitle: 'Questions about Tiangong',
    faq: [
      {
        q: 'What is Tiangong?',
        a: 'Tiangong is China’s space station, operated by the China Manned Space Agency. It is built from three modules: the Tianhe core (launched 29 April 2021) and the Wentian and Mengtian labs (launched in 2022). It is usually staffed by three astronauts.',
      },
      {
        q: 'Can I see Tiangong from where I live?',
        a: 'Its orbit is tilted 41.5° to the equator, so it flies over everywhere between 41.5° N and 41.5° S, and can be seen low on the horizon from roughly 10° further north or south. Set your location above to get exact times, directions and how high it will climb.',
      },
      {
        q: 'Why can I only see it at dawn or dusk?',
        a: 'You see Tiangong because it reflects sunlight. That needs your sky to be dark while the station, 385 km up, is still in sunlight, which happens in the hours after sunset and before sunrise.',
      },
      {
        q: 'How is Tiangong different from the ISS?',
        a: 'Tiangong is about a quarter of the ISS’s mass (~100 t vs ~420 t), flies about 35 km lower, and its orbit stays closer to the equator (41.5° vs 51.6° inclination). The ISS is run by five space agencies; Tiangong by China alone.',
      },
    ],
    sourcesTitle: 'Sources',
    sources: [SOURCES.wiki, SOURCES.celestrakCss, SOURCES.celestrakIss, SOURCES.nasa],
  },
}

export const tiangongFaqJsonLd = (copy) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: copy.faq.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
})
