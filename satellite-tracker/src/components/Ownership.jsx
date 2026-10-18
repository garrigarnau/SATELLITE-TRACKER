import './ownership.css'
import { localOwner, useT } from '../lib/i18n'

// "Who's above you": owners of the listed satellites as one stacked bar plus a
// legend. Picking a legend row filters the list to that owner.
export default function Ownership({ status, buckets, total, militaryCount, filter, onFilter }) {
  const t = useT()
  if (status === 'idle' || status === 'error' || !total) return null

  if (status === 'loading') {
    return (
      <div className="own" aria-busy="true">
        <p className="own__head"><span>{t('own.owner')}</span></p>
        <div className="own__bar skeleton" aria-hidden="true" />
        <div className="own__legend-skel skeleton" aria-hidden="true" />
      </div>
    )
  }

  const toggle = (key) => onFilter(filter === key ? null : key)

  return (
    <div className="own" aria-label={t('own.aria')}>
      <p className="own__head">
        <span>{t('own.owner')}</span>
        {militaryCount > 0 && (
          <span title={t('own.militaryHint')}>
            {t('own.military', { n: militaryCount, total })}
          </span>
        )}
      </p>
      <div className="own__bar" aria-hidden="true">
        {buckets.map((b, i) => (
          <span
            key={b.key}
            className={`own__seg own__c${b.key === 'other' ? 'x' : i}${filter && filter !== b.key ? ' is-dim' : ''}`}
            style={{ flexGrow: b.count }}
            title={`${localOwner(b.label)}: ${b.count}`}
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
              <span className="own__name">{localOwner(b.label)}</span>
              <span className="own__num">{b.count}</span>
              <span className="own__pct">{Math.round(b.pct)}%</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
