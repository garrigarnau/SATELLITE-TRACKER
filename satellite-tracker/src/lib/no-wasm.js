// satellite.js 7 ships optional WASM bulk propagators behind lazy imports.
// The app doesn't use them, so vite.config.js points those imports here
// instead of bundling ~400 KB of Node-flavoured WASM glue.
export default function noWasm() {
  throw new Error('satellite.js WASM runtimes are not bundled in this app')
}
