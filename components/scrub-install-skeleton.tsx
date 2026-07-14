export function ScrubInstallSkeleton() {
  return (
    <div
      className="landing-install-skeleton"
      aria-busy="true"
      aria-label="Loading installation instructions"
    >
      <div className="landing-install-skeleton-tabs">
        <span />
        <span />
      </div>
      <div className="landing-install-skeleton-code" />
      <div className="landing-install-skeleton-hint" />
    </div>
  )
}
