import { Suspense } from "react"

import { LandingMit } from "@/components/landing-mit"
import { LandingShell, LandingEnterItem } from "@/components/landing-shell"
import { ScrubHomeTabs } from "@/components/scrub-home-tabs"
import { ScrubInstallAsync } from "@/components/scrub-install-async"
import { ScrubInstallSkeleton } from "@/components/scrub-install-skeleton"
import "./landing.css"

export default function Home() {
  return (
    <LandingShell fill>
      <LandingEnterItem>
        <div className="landing-lede">
          <p className="landing-component-name">Scrub Number Input</p>
          <p className="landing-tagline">
            Drag-to-scrub number input with animated digits. Click to edit,
            Up/Down arrow keys to nudge.
          </p>
          <LandingMit />
        </div>
      </LandingEnterItem>

      <LandingEnterItem>
        <ScrubHomeTabs
          installation={
            <Suspense fallback={<ScrubInstallSkeleton />}>
              <ScrubInstallAsync />
            </Suspense>
          }
        />
      </LandingEnterItem>
    </LandingShell>
  )
}
