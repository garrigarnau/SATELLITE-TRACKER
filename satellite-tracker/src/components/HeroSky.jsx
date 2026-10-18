// Line-art night sky for the landing hero: a seeded star field, two faint
// constellations, the Earth's limb and a few orbits with satellites riding them.
// White on black only; everything fades out behind the text on the left.

const W = 1440
const H = 900

// Small deterministic PRNG so the sky is identical on every render.
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rand = rng(42)
const STARS = Array.from({ length: 170 }, () => ({
  x: rand() * W,
  y: rand() * H * 0.82,
  r: 0.4 + rand() * 1.1,
  o: 0.18 + rand() * 0.6,
}))

// A few brighter stars drawn as thin crosses.
const BRIGHT = [
  [1010, 120], [1290, 210], [760, 90], [1180, 470], [880, 300], [1370, 80], [640, 210], [1100, 330],
]

const CONSTELLATIONS = [
  [[1010, 120], [1092, 168], [1180, 150], [1290, 210], [1236, 288]],
  [[640, 210], [720, 252], [760, 90], [835, 140], [880, 300]],
]

// Elliptical orbits across the upper-right sky; satellites travel along each
// ellipse's path, with a short trail pointing back along the direction of travel.
const ORBIT_CENTER = { cx: 1080, cy: 400 }
const ORBITS = [
  { r: 250, tilt: -18, squash: 0.36, speed: 46, sats: [0.12], dash: false, o: 0.38 },
  { r: 410, tilt: -9, squash: 0.4, speed: 80, sats: [0.62, 0.95], dash: true, o: 0.26 },
  { r: 580, tilt: -24, squash: 0.32, speed: 130, sats: [0.4], dash: false, o: 0.18 },
]

// The Earth's limb low on the right.
const EARTH = { cx: 1180, cy: 1240, r: 560 }

function Cross({ x, y, s = 6 }) {
  return (
    <g className="sky-cross" transform={`translate(${x} ${y})`}>
      <line x1={-s} y1="0" x2={s} y2="0" />
      <line x1="0" y1={-s} x2="0" y2={s} />
      <circle r="1.2" />
    </g>
  )
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function HeroSky() {
  const still = reducedMotion()
  return (
    <svg className="hero__sky" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sky-fade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id="sky-mask">
          <rect width={W} height={H} fill="url(#sky-fade)" />
        </mask>
        <linearGradient id="trail" gradientUnits="userSpaceOnUse" x1="-26" y1="0" x2="-4" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <g mask="url(#sky-mask)">
        <g className="sky-stars">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(2)} opacity={s.o.toFixed(2)} />
          ))}
        </g>

        <g className="sky-lines">
          {CONSTELLATIONS.map((pts, i) => (
            <polyline key={i} points={pts.map((p) => p.join(',')).join(' ')} />
          ))}
        </g>
        {BRIGHT.map(([x, y], i) => <Cross key={i} x={x} y={y} s={i % 3 === 0 ? 7 : 5} />)}

        {ORBITS.map((o, i) => {
          const rx = o.r
          const ry = o.r * o.squash
          const path = `M ${rx} 0 A ${rx} ${ry} 0 1 1 ${-rx} 0 A ${rx} ${ry} 0 1 1 ${rx} 0`
          return (
            <g key={i} transform={`translate(${ORBIT_CENTER.cx} ${ORBIT_CENTER.cy}) rotate(${o.tilt})`}>
              <ellipse rx={rx} ry={ry} className="sky-orbit" strokeOpacity={o.o} strokeDasharray={o.dash ? '2 9' : undefined} />
              {o.sats.map((start, j) => {
                const t = start * 2 * Math.PI
                return (
                  <g key={j} transform={still ? `translate(${(rx * Math.cos(t)).toFixed(1)} ${(ry * Math.sin(t)).toFixed(1)})` : undefined}>
                    {!still && <animateMotion dur={`${o.speed}s`} begin={`${(-start * o.speed).toFixed(1)}s`} repeatCount="indefinite" rotate="auto" path={path} />}
                    <line x1="-26" y1="0" x2="-4" y2="0" className="sky-trail" />
                    <circle r="3" className="sky-sat__body" />
                  </g>
                )
              })}
            </g>
          )
        })}

        {/* The Earth's limb: a single arc low on the right. */}
        <circle cx={EARTH.cx} cy={EARTH.cy} r={EARTH.r} className="sky-limb" />
        <circle cx={EARTH.cx} cy={EARTH.cy} r={EARTH.r + 14} className="sky-atmo" />
      </g>
    </svg>
  )
}
