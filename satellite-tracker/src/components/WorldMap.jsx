import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export const dotIcon = (kind) =>
  L.divIcon({ className: `dot dot--${kind}`, html: '<span></span>', iconSize: [14, 14], iconAnchor: [7, 7] })

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

// The tracked satellite: a glyph with a pulsing halo and its name next to it.
export const trackedIcon = (name = '') =>
  L.divIcon({
    className: 'tracked',
    html: `<span class="tracked__halo"></span>
      <svg class="tracked__glyph" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="12" y="12" width="8" height="8" rx="1.5" />
        <path d="M3 9l7 7M22 23l7 7" />
        <rect x="1" y="3" width="9" height="5" rx="1" transform="rotate(45 5.5 5.5)" />
        <rect x="22" y="24" width="9" height="5" rx="1" transform="rotate(45 26.5 26.5)" />
      </svg>
      ${name ? `<span class="tracked__label">${escapeHtml(name)}</span>` : ''}`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })

function Recenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, zoom ?? map.getZoom(), { animate: true })
  }, [map, center?.[0], center?.[1], zoom]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

// Dark basemap shared by the overhead view and the satellite detail page.
export default function WorldMap({ center = [20, 0], zoom = 2, follow, children, className = '' }) {
  return (
    <div className={`map ${className}`}>
      <MapContainer center={center} zoom={zoom} minZoom={2} worldCopyJump scrollWheelZoom={false} attributionControl>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors"
          maxZoom={16}
        />
        {follow && <Recenter center={follow} />}
        {children}
      </MapContainer>
    </div>
  )
}
