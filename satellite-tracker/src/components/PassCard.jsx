import { Link } from 'react-router-dom'
import { brightness, dir, fmtCountdown, fmtDay, fmtDuration, fmtTime } from '../lib/format'
import { useT } from '../lib/i18n'
import { CLOUDED_OUT, sky } from '../lib/weather'
import { track } from '../lib/track'
import './weather.css'

// One naked-eye pass: when, how long, how high, and where to look.
// With `to` it's a link; with `onSelect` it's a toggle inside a pass picker.
// `cloud`: cloud cover % at peak; 'loading' or null show a dash, undefined hides it.
export default function PassCard({ pass, now, to, onSelect, selected = false, showName = true, cloud }) {
  const t = useT()
  const b = brightness(pass.mag)
  const live = pass.startUTC * 1000 <= now && now <= pass.endUTC * 1000
  const cloudy = typeof cloud === 'number' && cloud >= CLOUDED_OUT
  const className = ['pass', live && 'pass--live', cloudy && 'pass--cloudy', selected && 'is-active'].filter(Boolean).join(' ')
  const Root = to ? Link : 'div'
  const rootProps = to
    ? { to, onClick: () => track('satellite_opened', { id: pass.satid, from: 'pass' }) }
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
        <span className="pass__count">{live ? t('pass.visibleNow') : fmtCountdown(pass.startUTC, now)}</span>
      </div>

      <div className="pass__body">
        {showName && <h3 className="pass__name">{pass.satname}</h3>}
        <p className="pass__dir">
          {dir(pass.startAzCompass)} <span aria-hidden="true">→</span><span className="sr-only">{t('pass.to')}</span> {dir(pass.endAzCompass)}
          <span className="pass__sep" aria-hidden="true">·</span>
          {t('pass.peaks', { el: Math.round(pass.maxEl), dir: dir(pass.maxAzCompass) })}
        </p>
      </div>

      <dl className="pass__stats">
        <div>
          <dt>{t('pass.duration')}</dt>
          <dd>{fmtDuration(pass.duration)}</dd>
        </div>
        <div>
          <dt>{t('pass.height')}</dt>
          <dd>
            <span className="meter" style={{ '--v': Math.min(pass.maxEl, 90) / 90 }} aria-hidden="true" />
            {Math.round(pass.maxEl)}°
          </dd>
        </div>
        <div>
          <dt>{t('pass.brightness')}</dt>
          <dd>
            <span className="stars" data-level={b.level} aria-hidden="true"><i /><i /><i /><i /></span>
            {b.label}
          </dd>
        </div>
        {cloud !== undefined && <SkyStat cloud={cloud} />}
      </dl>
    </Root>
  )
}

function SkyStat({ cloud }) {
  const t = useT()
  const s = typeof cloud === 'number' ? sky(cloud) : null
  const title = s ? t('pass.cloudTitle', { pct: Math.round(cloud) }) : cloud === 'loading' ? t('pass.loadingForecast') : t('pass.noForecast')
  return (
    <div className="sky-stat" title={title}>
      <dt>{t('pass.sky')}</dt>
      {s ? (
        <dd>
          <SkyIcon level={s.level} />
          {t(`sky.${s.level}`)} {Math.round(cloud)}%
        </dd>
      ) : (
        <dd className="sky-stat--none">
          —<span className="sr-only">{title}</span>
        </dd>
      )}
    </div>
  )
}

// Tiny monochrome glyphs: sun, sun behind cloud, cloud.
function SkyIcon({ level }) {
  const cloud = <path d="M4.5 12.5h7a2.5 2.5 0 0 0 .3-5 3.5 3.5 0 0 0-6.7-.6A2.8 2.8 0 0 0 4.5 12.5Z" />
  return (
    <svg className="sky-icon" data-level={level} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
      {level === 'clear' && (
        <>
          <circle cx="8" cy="8" r="3" />
          <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" strokeLinecap="round" />
        </>
      )}
      {level === 'partly' && (
        <>
          <path d="M5.2 5.6A2.6 2.6 0 0 1 9.6 3.4" strokeLinecap="round" />
          <path d="M4.5 3.8 3.8 3.1M7 2V1.2" strokeLinecap="round" />
          {cloud}
        </>
      )}
      {level === 'cloudy' && <g fill="currentColor" fillOpacity="0.25">{cloud}</g>}
    </svg>
  )
}
