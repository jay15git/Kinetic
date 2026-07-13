import { Suspense } from "react"

import { LandingShell } from "@/components/landing-shell"
import { ScrubInstallAsync } from "@/components/scrub-install-async"
import { ScrubInstallSkeleton } from "@/components/scrub-install-skeleton"
import "./landing.css"

export default function Home() {
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
        <Suspense fallback={<ScrubInstallSkeleton />}>
          <ScrubInstallAsync />
        </Suspense>
      </section>
    </LandingShell>
  )
}
