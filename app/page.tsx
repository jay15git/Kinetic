import { Suspense } from "react"

import { LandingMit } from "@/components/landing-mit"
import { LandingShell, LandingEnterItem } from "@/components/landing-shell"
import { ScrubInstallAsync } from "@/components/scrub-install-async"
import { ScrubInstallSkeleton } from "@/components/scrub-install-skeleton"
import "./landing.css"

export default function Home() {
  return (
    <LandingShell fill>
      <LandingEnterItem>
        <div className="landing-lede">
          <p className="landing-tagline">
            Drag-to-scrub number fields with animated digits. Click to edit,
            arrow up/down keys to nudge.
          </p>
          <LandingMit />
        </div>
      </LandingEnterItem>

      <LandingEnterItem>
        <section className="landing-section" aria-labelledby="install-heading">
          <h2 id="install-heading" className="landing-section-title">
            Installation
          </h2>
          <Suspense fallback={<ScrubInstallSkeleton />}>
            <ScrubInstallAsync />
          </Suspense>
        </section>
      </LandingEnterItem>
    </LandingShell>
  )
}
