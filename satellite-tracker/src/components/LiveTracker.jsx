import { useMemo, useState } from 'react'
import { Circle, Marker, Polyline, Tooltip } from 'react-leaflet'
import { footprintKm, groundTrack, periodMinutes } from '../lib/orbit'
import { compass, dir, fmtCoord, fmtNum } from '../lib/format'
import { useT } from '../lib/i18n'
import WorldMap, { dotIcon, trackedIcon } from './WorldMap'
import { Skeleton, Term } from './Status'

// Live map following one satellite (footprint, past and next ground track) next
// to a panel of its position, speed and look angles from the observer.
// Shared by the satellite page and the Tiangong page.
export default function LiveTracker({ satrec, name, pos, look, observer, now }) {
  const [follow, setFollow] = useState(true)
  const t = useT()

  // The ground track only needs refreshing every half minute.
  const trackKey = Math.floor(now.getTime() / 30_000)
  const track = useMemo(() => {
    if (!satrec) return null
    const period = periodMinutes(satrec)
    return {
      past: groundTrack(satrec, now, period * 0.5, 0),
      future: groundTrack(satrec, now, 0, period),
    }
  }, [satrec, trackKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Built once per satellite so the halo animation isn't restarted every tick.
  const icon = useMemo(() => trackedIcon(name), [name])
  const period = satrec ? periodMinutes(satrec) : null

  return (
    <div className="sat-grid">
      <WorldMap center={pos ? [pos.lat, pos.lon] : undefined} zoom={3} follow={follow && pos ? [pos.lat, pos.lon] : null} className="sat-map">
        {track?.past.map((seg, i) => <Polyline key={`p${i}`} positions={seg} pathOptions={{ color: '#b06ab8', weight: 1.5, opacity: 0.55 }} />)}
        {track?.future.map((seg, i) => <Polyline key={`f${i}`} positions={seg} pathOptions={{ color: '#ffffff', weight: 1.5, opacity: 0.85, dashArray: '3 6' }} />)}
        {pos && (
          <>
            <Circle center={[pos.lat, pos.lon]} radius={footprintKm(pos.altKm) * 1000} pathOptions={{ color: '#ffffff', weight: 1, opacity: 0.35, fillColor: '#b06ab8', fillOpacity: 0.08 }} />
            <Marker position={[pos.lat, pos.lon]} icon={icon} zIndexOffset={1000} />
          </>
        )}
        {observer && (
          <Marker position={[observer.lat, observer.lon]} icon={dotIcon('you')}>
            <Tooltip>{t('common.you')}</Tooltip>
          </Marker>
        )}
      </WorldMap>

      <aside className="panel">
        <div className="panel__head">
          <h2 className="panel__title">{t('sat.live')}</h2>
          <label className="toggle">
            <input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} />
            <span>{t('sat.follow')}</span>
          </label>
        </div>
        {pos ? (
          <dl className="stats">
            <Stat label={t('sat.lat')} value={fmtCoord(pos.lat, 'N', 'S')} />
            <Stat label={t('sat.lon')} value={fmtCoord(pos.lon, 'E', dir('W'))} />
            <Stat label={t('sat.alt')} value={`${fmtNum(pos.altKm)} km`} />
            <Stat label={t('sat.speed')} value={`${fmtNum(pos.speedKmS, 2)} km/s`} />
            <Stat label={t('sat.orbit')} value={`${fmtNum(period)} min`} />
            {look && (
              <>
                <Stat label={<Term hint={t('sat.azimuthHint')}>{t('sat.azimuth')}</Term>} value={`${fmtNum(look.azimuth)}° ${compass(look.azimuth)}`} />
                <Stat label={<Term hint={t('sat.elevationHint')}>{t('sat.elevation')}</Term>} value={`${fmtNum(look.elevation)}°`} />
                <Stat label={t('sat.distance')} value={`${fmtNum(look.rangeKm)} km`} />
              </>
            )}
          </dl>
        ) : (
          <div className="stats"><Skeleton rows={4} className="stat" /></div>
        )}
        <p className="panel__note">{t('sat.computed')}</p>
      </aside>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
