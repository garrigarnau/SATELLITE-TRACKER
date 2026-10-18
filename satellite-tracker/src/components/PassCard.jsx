import { Link } from 'react-router-dom'
import { brightness, fmtCountdown, fmtDay, fmtDuration, fmtTime } from '../lib/format'

// One naked-eye pass: when, how long, how high, and where to look.
// With `to` it's a link; with `onSelect` it's a toggle inside a pass picker.
export default function PassCard({ pass, now, to, onSelect, selected = false, showName = true }) {
  const b = brightness(pass.mag)
  const live = pass.startUTC * 1000 <= now && now <= pass.endUTC * 1000
  const className = ['pass', live && 'pass--live', selected && 'is-active'].filter(Boolean).join(' ')
  const Root = to ? Link : 'div'
  const rootProps = to
    ? { to }
    : {
        role: 'button',
        tabIndex: 0,
        'aria-pressed': selected,
        onClick: onSelect,
        onKeyDown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect()
          }
        },
      }

  return (
    <Root className={className} {...rootProps}>
      <div className="pass__when">
        <span className="pass__day">{fmtDay(pass.startUTC)}</span>
        <span className="pass__time">{fmtTime(pass.startUTC)}</span>
        <span className="pass__count">{live ? 'Visible now' : fmtCountdown(pass.startUTC, now)}</span>
      </div>

      <div className="pass__body">
        {showName && <h3 className="pass__name">{pass.satname}</h3>}
        <p className="pass__dir">
          {pass.startAzCompass} <span aria-hidden="true">→</span><span className="sr-only">to</span> {pass.endAzCompass}
          <span className="pass__sep" aria-hidden="true">·</span>
          peaks at {Math.round(pass.maxEl)}° in the {pass.maxAzCompass}
        </p>
      </div>

      <dl className="pass__stats">
        <div>
          <dt>Duration</dt>
          <dd>{fmtDuration(pass.duration)}</dd>
        </div>
        <div>
          <dt>Height</dt>
          <dd>
            <span className="meter" style={{ '--v': Math.min(pass.maxEl, 90) / 90 }} aria-hidden="true" />
            {Math.round(pass.maxEl)}°
          </dd>
        </div>
        <div>
          <dt>Brightness</dt>
          <dd>
            <span className="stars" data-level={b.level} aria-hidden="true"><i /><i /><i /><i /></span>
            {b.label}
          </dd>
        </div>
      </dl>
    </Root>
  )
}
