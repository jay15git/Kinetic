const GITHUB_URL = "https://github.com/jay15git/kinetic"
const LICENSE_URL = `${GITHUB_URL}/blob/main/LICENSE`

export function LandingMit({ className }: { className?: string }) {
  return (
    <a
      href={LICENSE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className ?? "landing-mit"}
    >
      MIT
    </a>
  )
}
