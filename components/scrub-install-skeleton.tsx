export function ScrubInstallSkeleton() {
  return (
    <div
      className="landing-install-skeleton"
      aria-busy="true"
      aria-label="Loading installation instructions"
    >
      <div className="landing-install-skeleton-tabs" />
      <div className="landing-install-skeleton-code" />
      <div className="landing-install-skeleton-hint" />
    </div>
  )
}
