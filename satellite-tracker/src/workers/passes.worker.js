// Runs pass prediction off the main thread: ten days at 30 s steps is a few
// hundred thousand propagations per satellite.
import { predictPasses } from '../lib/passes'

self.onmessage = ({ data }) => {
  const { jobId, tle, observer, opts } = data
  try {
    self.postMessage({ jobId, passes: predictPasses(tle, observer, opts) })
  } catch (e) {
    self.postMessage({ jobId, error: e.message })
  }
}
