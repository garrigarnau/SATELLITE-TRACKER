import { compass } from '../lib/format'

// Polar plot of the sky: centre is straight up (90°), the edge is the horizon,
// north at the top. Draws the pass path with its start, peak and end.
const SIZE = 280
const R = 120
const C = SIZE / 2

function project(az, el) {
  const r = R * (1 - Math.max(el, 0) / 90)
  const a = ((az - 90) * Math.PI) / 180
  return [C + r * Math.cos(a), C + r * Math.sin(a)]
}

export default function SkyChart({ path, pass, current }) {
  const visible = path.filter((p) => p.elevation >= 0)
  const d = visible.map((p, i) => `${i ? 'L' : 'M'}${project(p.azimuth, p.elevation).map((n) => n.toFixed(1)).join(' ')}`).join(' ')

  const marks = pass && [
    { key: 'start', label: 'Start', az: pass.startAz, el: pass.startEl },
    { key: 'max', label: 'Peak', az: pass.maxAz, el: pass.maxEl },
    { key: 'end', label: 'End', az: pass.endAz, el: pass.endEl },
  ]

  return (
    <svg className="sky" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={pass ? `Sky path from ${compass(pass.startAz)} to ${compass(pass.endAz)}, peaking at ${Math.round(pass.maxEl)} degrees` : 'Sky chart'}>
      <defs>
        <radialGradient id="sky-bg">
          <stop offset="0" stopColor="#1c1a1d" />
          <stop offset="1" stopColor="#0a0a0a" />
        </radialGradient>
        <linearGradient id="sky-path" x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#d9b8de" />
          <stop offset="1" stopColor="#f700ff" />
        </linearGradient>
      </defs>
      <circle cx={C} cy={C} r={R} fill="url(#sky-bg)" className="sky__horizon" />
      {[30, 60].map((el) => (
        <circle key={el} cx={C} cy={C} r={R * (1 - el / 90)} className="sky__ring" />
      ))}
      <line x1={C} y1={C - R} x2={C} y2={C + R} className="sky__ring" />
      <line x1={C - R} y1={C} x2={C + R} y2={C} className="sky__ring" />
      {[['N', 0], ['E', 90], ['S', 180], ['W', 270]].map(([l, az]) => {
        const [x, y] = project(az, -12)
        return <text key={l} x={x} y={y} className="sky__cardinal">{l}</text>
      })}
      <text x={C + 4} y={C - R * (1 - 60 / 90) - 4} className="sky__deg">60°</text>
      <text x={C + 4} y={C - R * (1 - 30 / 90) - 4} className="sky__deg">30°</text>

      {d && <path d={d} className="sky__path" />}
      {marks?.map((m, i) => {
        const [x, y] = project(m.az, m.el)
        // A pass can become visible at its peak (leaving Earth's shadow); don't
        // stack labels on top of each other.
        const crowded = marks.slice(0, i).some((o) => {
          const [ox, oy] = project(o.az, o.el)
          return Math.hypot(ox - x, oy - y) < 16
        })
        return (
          <g key={m.key} className={`sky__mark sky__mark--${m.key}`}>
            <circle cx={x} cy={y} r={m.key === 'max' ? 5 : 4} />
            {!crowded && <text x={x} y={y - 9}>{m.label}</text>}
          </g>
        )
      })}
      {current && current.elevation >= 0 && (
        <circle cx={project(current.azimuth, current.elevation)[0]} cy={project(current.azimuth, current.elevation)[1]} r="6" className="sky__now" />
      )}
    </svg>
  )
}
