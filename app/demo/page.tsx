import type { Metadata } from "next"

import { LandingShell, LandingEnterItem } from "@/components/landing-shell"
import { ScrubDemo } from "@/components/scrub-demo"
import "../landing.css"

export const metadata: Metadata = {
  title: "Demo — Kinetic",
  description:
    "Interactive scrub number field playground. Tweak settings and copy generated usage props.",
}

export default function DemoPage() {
  return (
    <LandingShell fill>
      <LandingEnterItem>
        <p className="landing-tagline">
          Live playground for the scrub number field. Adjust settings, then copy
          the generated usage snippet.
        </p>
      </LandingEnterItem>

      <LandingEnterItem>
        <section className="landing-section" aria-labelledby="demo-heading">
          <h2 id="demo-heading" className="landing-section-title">
            Demo
          </h2>
          <ScrubDemo />
        </section>
      </LandingEnterItem>
    </LandingShell>
  )
}
