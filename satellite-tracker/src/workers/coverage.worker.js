// Counts Starlink satellites above each region, off the main thread.
// Messages in:  { type: 'init', regions } | { type: 'tick', time, selected, positions }
//               | { type: 'forecast', from, minutes, stepMin }
// Messages out: { type: 'ready', meta } | { type: 'tick', ... } | { type: 'forecast', ... }
//               | { type: 'error', message }
import { getStarlinkCatalog } from '../lib/starlink'
import { buildCatalog, forecast, preparePlaces, snapshot } from '../lib/coverage'

let catalog = null
let places = null
let regionIds = []

async function init(regions) {
  const t0 = performance.now()
  const { records, fetchedAt } = await getStarlinkCatalog()
  const t1 = performance.now()
  catalog = buildCatalog(records)
  places = preparePlaces(regions)
  regionIds = regions.map((r) => r.id)
  let newest = 0
  let oldest = Infinity
  for (const c of catalog) {
    if (c.epoch > newest) newest = c.epoch
    if (c.epoch < oldest) oldest = c.epoch
  }
  self.postMessage({
    type: 'ready',
    meta: { count: catalog.length, fetchedAt, newestEpoch: newest, oldestEpoch: oldest, fetchMs: t1 - t0, parseMs: performance.now() - t1 },
  })
}

function tick({ time, selected, positions }) {
  const t0 = performance.now()
  const detailFor = regionIds.indexOf(selected)
  const snap = snapshot(catalog, places, new Date(time), { positions, detailFor })
  const visible = snap.detail
    .sort((a, b) => b.el - a.el)
    .map((d) => ({ id: catalog[d.i].id, name: catalog[d.i].name, el: d.el, lat: d.lat, lon: d.lon, altKm: d.altKm }))
  const msg = { type: 'tick', time, counts: snap.counts, selected, visible, positions: snap.positions, ms: performance.now() - t0 }
  self.postMessage(msg, snap.positions ? [snap.positions.buffer] : [])
}

self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') return await init(data.regions)
    if (!catalog) return
    if (data.type === 'tick') return tick(data)
    if (data.type === 'forecast') {
      const t0 = performance.now()
      const f = forecast(catalog, places, data.from, { minutes: data.minutes, stepMin: data.stepMin })
      self.postMessage({ type: 'forecast', ...f, ms: performance.now() - t0 })
    }
  } catch (e) {
    self.postMessage({ type: 'error', message: e.message || String(e) })
  }
}
