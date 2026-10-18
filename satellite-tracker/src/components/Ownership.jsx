import './ownership.css'

// "Who's above you": owners of the listed satellites as one stacked bar plus a
// legend. Picking a legend row filters the list to that owner.
export default function Ownership({ status, buckets, total, militaryCount, filter, onFilter }) {
  if (status === 'idle' || status === 'error' || !total) return null

  if (status === 'loading') {
    return (
      <div className="own" aria-busy="true">
        <p className="own__head"><span>Owner</span></p>
        <div className="own__bar skeleton" aria-hidden="true" />
        <div className="own__legend-skel skeleton" aria-hidden="true" />
      </div>
    )
  }

  const toggle = (key) => onFilter(filter === key ? null : key)

  return (
    <div className="own" aria-label="Satellites above you by owner">
      <p className="own__head">
        <span>Owner</span>
        {militaryCount > 0 && (
          <span title="Counted against CelesTrak's miscellaneous military list, which is not exhaustive.">
            {militaryCount} of {total} military
          </span>
        )}
      </p>
      <div className="own__bar" aria-hidden="true">
        {buckets.map((b, i) => (
          <span
            key={b.key}
            className={`own__seg own__c${b.key === 'other' ? 'x' : i}${filter && filter !== b.key ? ' is-dim' : ''}`}
            style={{ flexGrow: b.count }}
            title={`${b.label}: ${b.count}`}
            onClick={() => toggle(b.key)}
          />
        ))}
      </div>
      <ul className="own__legend">
        {buckets.map((b, i) => (
          <li key={b.key}>
            <button
              type="button"
              className={filter === b.key ? 'own__row is-active' : 'own__row'}
              aria-pressed={filter === b.key}
              onClick={() => toggle(b.key)}
            >
              <span className={`own__dot own__c${b.key === 'other' ? 'x' : i}`} aria-hidden="true" />
              <span className="own__name">{b.label}</span>
              <span className="own__num">{b.count}</span>
              <span className="own__pct">{Math.round(b.pct)}%</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
