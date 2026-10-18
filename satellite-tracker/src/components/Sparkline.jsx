import { useState } from 'react'

// Counts over the next 90 minutes as a thin line. Every sparkline on a page
// shares `max` so their heights are comparable. `interactive` adds a hover
// readout (time offset + value).
export default function Sparkline({ values, max, stepMin = 2, width = 120, height = 28, interactive = false, label }) {
  const [hover, setHover] = useState(null)
  if (!values?.length) return <span className="spark spark--empty" style={{ height }} aria-hidden="true" />

  const pad = 3
  const top = Math.max(max || 0, 1)
  const x = (i) => pad + (i * (width - pad * 2)) / Math.max(values.length - 1, 1)
  const y = (v) => height - pad - (v / top) * (height - pad * 2)
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')
  const summary = label || `Between ${lo} and ${hi} over the next ${(values.length - 1) * stepMin} minutes`

  const onMove = (e) => {
    const box = e.currentTarget.getBoundingClientRect()
    const rel = ((e.clientX - box.left) / box.width) * width
    const i = Math.round(((rel - pad) / (width - pad * 2)) * (values.length - 1))
    setHover(Math.min(values.length - 1, Math.max(0, i)))
  }

  return (
    <span className={interactive ? 'spark spark--interactive' : 'spark'}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={interactive ? '100%' : width}
        height={height}
        preserveAspectRatio="none"
        role="img"
        aria-label={summary}
        onPointerMove={interactive ? onMove : undefined}
        onPointerLeave={interactive ? () => setHover(null) : undefined}
      >
        <title>{summary}</title>
        <rect className="spark__band" x={pad} width={width - pad * 2} y={y(hi)} height={Math.max(y(lo) - y(hi), 1)} />
        <path className="spark__line" d={d} vectorEffect="non-scaling-stroke" />
        {hover != null && <line className="spark__cross" x1={x(hover)} x2={x(hover)} y1={0} y2={height} vectorEffect="non-scaling-stroke" />}
      </svg>
      <i className="spark__now" style={{ left: `${(x(0) / width) * 100}%`, top: `${(y(values[0]) / height) * 100}%` }} aria-hidden="true" />
      {hover != null && (
        <i
          className="spark__hover"
          style={{ left: `${(x(hover) / width) * 100}%`, top: `${(y(values[hover]) / height) * 100}%` }}
          aria-hidden="true"
        />
      )}
      {hover != null && (
        <span className="spark__tip" style={{ left: `${(x(hover) / width) * 100}%` }} aria-hidden="true">
          {hover === 0 ? 'Now' : `+${hover * stepMin} min`} · <strong>{values[hover]}</strong>
        </span>
      )}
    </span>
  )
}
