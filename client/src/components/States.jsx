export function Loading({ label = "Loading…" }) {
  return (
    <div className="loading-block">
      <div className="spinner" />
      <div>{label}</div>
    </div>
  );
}

export function EmptyState({ emoji = "🔍", title, detail, children }) {
  return (
    <div className="state">
      <div className="emoji">{emoji}</div>
      <div style={{ fontWeight: 600, color: "var(--text-soft)", marginBottom: 4 }}>{title}</div>
      {detail ? <div>{detail}</div> : null}
      {children}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <div className="title">⚠️ {title}</div>
      <div>{message}</div>
      {onRetry ? (
        <button className="btn small retry" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}