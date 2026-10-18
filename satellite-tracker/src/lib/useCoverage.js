// Drives the coverage worker: live counts every few seconds, a 90-minute
// forecast refreshed every five minutes, everything paused while the tab is
// hidden. Lighter settings on low-end devices or with reduced motion.
import { useEffect, useRef, useState } from 'react'

const FORECAST_MINUTES = 90
const FORECAST_EVERY_MS = 5 * 60_000

export function devicePlan() {
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const lite = cores <= 4 || reduced
  return lite
    ? { lite, tickMs: 10_000, stepMin: 3, allDots: false }
    : { lite, tickMs: 5_000, stepMin: 2, allDots: true }
}

export function useCoverage(regions, selected) {
  const [plan] = useState(devicePlan)
  const [state, setState] = useState({ status: 'loading', meta: null, live: null, forecast: null, error: null })
  const workerRef = useRef(null)
  const selectedRef = useRef(selected)
  const sendTickRef = useRef(() => {})

  useEffect(() => {
    const worker = new Worker(new URL('../workers/coverage.worker.js', import.meta.url), { type: 'module' })
    workerRef.current = worker
    let tickTimer = null
    let forecastTimer = null
    let lastForecast = 0
    let ready = false

    const sendTick = () => {
      if (!ready) return
      worker.postMessage({ type: 'tick', time: Date.now(), selected: selectedRef.current, positions: plan.allDots })
    }
    const sendForecast = () => {
      if (!ready) return
      lastForecast = Date.now()
      worker.postMessage({ type: 'forecast', from: lastForecast, minutes: FORECAST_MINUTES, stepMin: plan.stepMin })
    }
    sendTickRef.current = sendTick

    const start = () => {
      stop()
      if (!ready || document.hidden) return
      sendTick()
      if (Date.now() - lastForecast >= FORECAST_EVERY_MS) sendForecast()
      tickTimer = setInterval(sendTick, plan.tickMs)
      forecastTimer = setInterval(sendForecast, FORECAST_EVERY_MS)
    }
    function stop() {
      clearInterval(tickTimer)
      clearInterval(forecastTimer)
      tickTimer = forecastTimer = null
    }
    const onVisibility = () => (document.hidden ? stop() : start())

    worker.onmessage = ({ data }) => {
      if (data.type === 'ready') {
        ready = true
        setState((s) => ({ ...s, status: 'ready', meta: data.meta }))
        start()
      } else if (data.type === 'tick') {
        setState((s) => ({ ...s, live: data }))
      } else if (data.type === 'forecast') {
        setState((s) => ({ ...s, forecast: data }))
      } else if (data.type === 'error') {
        setState((s) => (s.status === 'ready' ? s : { ...s, status: 'error', error: data.message }))
      }
    }
    worker.onerror = (e) => setState((s) => ({ ...s, status: 'error', error: e.message || 'The calculation failed to start.' }))
    worker.postMessage({ type: 'init', regions: regions.map(({ id, lat, lon }) => ({ id, lat, lon })) })
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
      worker.terminate()
      workerRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // A newly selected region gets its satellites right away, not at the next tick.
  useEffect(() => {
    selectedRef.current = selected
    sendTickRef.current()
  }, [selected])

  return { ...state, plan }
}
