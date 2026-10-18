import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

// Thousands of satellites as one canvas layer: a Leaflet marker per dot would
// mean 11,000 DOM nodes. `positions` is a Float32Array [lat, lon, lat, lon, ...].
const DotsLayer = L.Layer.extend({
  initialize(opts) {
    this._positions = null
    this._color = opts.color
    this._radius = opts.radius
  },
  onAdd(map) {
    this._canvas = L.DomUtil.create('canvas', 'sat-dots leaflet-zoom-hide')
    map.getPanes().overlayPane.appendChild(this._canvas)
    map.on('moveend zoomend resize viewreset', this._redraw, this)
    this._redraw()
  },
  onRemove(map) {
    map.off('moveend zoomend resize viewreset', this._redraw, this)
    this._canvas.remove()
  },
  setPositions(p) {
    this._positions = p
    this._redraw()
  },
  _redraw() {
    const map = this._map
    if (!map) return
    const size = map.getSize()
    const dpr = window.devicePixelRatio || 1
    const c = this._canvas
    if (c.width !== size.x * dpr || c.height !== size.y * dpr) {
      c.width = size.x * dpr
      c.height = size.y * dpr
      c.style.width = `${size.x}px`
      c.style.height = `${size.y}px`
    }
    L.DomUtil.setPosition(c, map.containerPointToLayerPoint([0, 0]))
    const ctx = c.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.x, size.y)
    const p = this._positions
    if (!p) return

    // Project once at lon 0, then shift by whole worlds for the copies in view.
    const zoom = map.getZoom()
    const worldPx = 256 * 2 ** zoom
    // Container pixel = projected pixel - origin.
    const origin = map.getPixelOrigin().add(map.containerPointToLayerPoint([0, 0]))
    const r = this._radius
    ctx.fillStyle = this._color
    ctx.beginPath()
    for (let i = 0; i < p.length; i += 2) {
      const lat = p[i]
      if (Number.isNaN(lat)) continue
      const pt = map.project([lat, p[i + 1]], zoom)
      const y = pt.y - origin.y
      if (y < -r || y > size.y + r) continue
      const x0 = (((pt.x - origin.x) % worldPx) + worldPx) % worldPx
      for (let x = x0 - worldPx; x < size.x + r; x += worldPx) {
        if (x < -r) continue
        ctx.moveTo(x + r, y)
        ctx.arc(x, y, r, 0, Math.PI * 2)
      }
    }
    ctx.fill()
  },
})

export default function SatDots({ positions, color = 'rgba(255, 255, 255, 0.22)', radius = 1.1 }) {
  const map = useMap()
  const layer = useRef(null)

  useEffect(() => {
    layer.current = new DotsLayer({ color, radius }).addTo(map)
    return () => { layer.current.remove(); layer.current = null }
  }, [map, color, radius])

  useEffect(() => {
    layer.current?.setPositions(positions)
  }, [positions])

  return null
}
