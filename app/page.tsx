import { LandingShell } from "@/components/landing-shell"
import { ScrubInstallSection } from "@/components/scrub-install-section"
import { getScrubInstallHighlighted } from "@/lib/scrub-install-highlighted"
import { getScrubInstallContent } from "@/lib/scrub-install-content"
import "./landing.css"

const REGISTRY_URL =
  process.env.NEXT_PUBLIC_KINETIC_REGISTRY_URL ?? "https://kinetic.itsjay.in"

export default async function Home() {
  const installContent = getScrubInstallContent(REGISTRY_URL)
  const highlighted = await getScrubInstallHighlighted(installContent)

  return (
    <LandingShell fill>
      <p className="landing-tagline">
        Drag-to-scrub number fields with animated digits. Click to edit,
        keyboard to nudge — design-tool ergonomics for React.
      </p>

      <section className="landing-section" aria-labelledby="install-heading">
        <h2 id="install-heading" className="landing-section-title">
          Installation
        </h2>
        <ScrubInstallSection
          content={installContent}
          highlighted={highlighted}
        />
      </section>
    </LandingShell>
  )
}
