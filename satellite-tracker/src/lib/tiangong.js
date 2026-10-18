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
  es: {
    eyebrow: 'Estación espacial china · NORAD 48274',
    title: 'Tiangong en directo: dónde está la estación espacial china ahora',
    intro: [
      'Tiangong («Palacio Celestial») es la estación espacial de China, tripulada de forma permanente y gestionada por la Agencia Espacial Tripulada de China (CMSA). Su módulo central, Tianhe, se lanzó el 29 de abril de 2021, y los módulos laboratorio Wentian y Mengtian se le unieron en 2022.',
      'Suele llevar tres astronautas y da una vuelta a la Tierra cada 92 minutos aproximadamente, a unos 385 km de altura. Como la ISS, es lo bastante brillante para verla a simple vista cuando cruza un cielo oscuro iluminada por el sol, al amanecer y al anochecer.',
    ],
    passesTitle: 'Próximos pasos visibles',
    passesNote: 'Pasos visibles a simple vista en los próximos 10 días. Elige uno para ver su trayectoria en tu cielo.',
    noLocationTitle: '¿Cuándo puedes ver Tiangong?',
    noLocationNote: 'Indica tu ubicación para ver los pasos visibles de Tiangong y hacia dónde mirar.',
    compareTitle: 'Tiangong frente a la ISS',
    compareNote: `Datos orbitales del catálogo de CelesTrak a ${FACTS_DATE}.`,
    compareHead: ['', 'Tiangong', 'ISS'],
    compare: [
      ['Operador', 'Agencia Espacial Tripulada de China', 'NASA, Roscosmos, ESA, JAXA y CSA'],
      ['Primer módulo lanzado', '29 abr 2021 (Tianhe)', '20 nov 1998 (Zarya)'],
      ['Tripulación habitual', '3 (hasta 6)', '7'],
      ['Masa', '~100 t', '~420 t'],
      ['Altitud', '384–386 km', '415–424 km'],
      ['Tiempo de órbita', '92,3 min', '93,0 min'],
      ['Inclinación', '41,5°', '51,6°'],
      ['Sobrevuela latitudes', 'hasta 41,5° N y S', 'hasta 51,6° N y S'],
    ],
    compareFootnote:
      'Por su menor inclinación, Tiangong nunca pasa justo por encima de lugares al norte de unos 41,5° N, como la mayor parte de Europa. Desde allí puede verse baja en el cielo del sur, mientras que la ISS pasa mucho más alta.',
    faqTitle: 'Preguntas sobre Tiangong',
    faq: [
      {
        q: '¿Qué es Tiangong?',
        a: 'Tiangong es la estación espacial de China, operada por la Agencia Espacial Tripulada de China. Está formada por tres módulos: el núcleo Tianhe (lanzado el 29 de abril de 2021) y los laboratorios Wentian y Mengtian (lanzados en 2022). Normalmente la ocupan tres astronautas.',
      },
      {
        q: '¿Puedo ver Tiangong desde donde vivo?',
        a: 'Su órbita está inclinada 41,5° respecto al ecuador, así que sobrevuela todo lo que hay entre 41,5° N y 41,5° S, y puede verse baja en el horizonte hasta unos 10° más al norte o al sur. Indica tu ubicación arriba para obtener las horas exactas, la dirección y la altura que alcanzará.',
      },
      {
        q: '¿Por qué solo se ve al amanecer o al anochecer?',
        a: 'Tiangong se ve porque refleja la luz del Sol. Para eso, tu cielo tiene que estar oscuro mientras la estación, a 385 km de altura, sigue iluminada, algo que ocurre en las horas posteriores a la puesta de sol y anteriores al amanecer.',
      },
      {
        q: '¿En qué se diferencia Tiangong de la ISS?',
        a: 'Tiangong tiene aproximadamente una cuarta parte de la masa de la ISS (~100 t frente a ~420 t), vuela unos 35 km más baja y su órbita se mantiene más cerca del ecuador (41,5° frente a 51,6° de inclinación). La ISS la gestionan cinco agencias espaciales; Tiangong, solo China.',
      },
    ],
    sourcesTitle: 'Fuentes',
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
