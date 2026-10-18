// Small shared states: loading skeletons, errors and empty results.
export function Skeleton({ rows = 3, className = 'pass' }) {
  return Array.from({ length: rows }, (_, i) => <div key={i} className={`${className} skeleton`} aria-hidden="true" />)
}

export function Notice({ tone = 'info', title, children, action }) {
  return (
    <div className={`notice notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {title && <p className="notice__title">{title}</p>}
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}

// A term with its definition one tap away, instead of a modal.
export function Term({ children, hint }) {
  return (
    <span className="term" tabIndex={0} aria-label={`${children}: ${hint}`}>
      {children}
      <span className="term__hint" role="tooltip">{hint}</span>
    </span>
  )
}
