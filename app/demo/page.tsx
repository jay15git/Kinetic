import type { Metadata } from "next"

import { LandingMit } from "@/components/landing-mit"
import { LandingShell, LandingEnterItem } from "@/components/landing-shell"
import { ScrubDemo } from "@/components/scrub-demo"
import "../landing.css"

export const metadata: Metadata = {
  title: "Demo — Kinetic",
  description:
    "Interactive Scrub Number Input playground. Tweak settings and copy generated usage props.",
}

export default function DemoPage() {
  return (
    <LandingShell fill>
      <LandingEnterItem>
        <div className="landing-lede">
          <p className="landing-component-name">Scrub Number Input</p>
          <p className="landing-tagline">
            Interactive playground for the Scrub Number Input. Adjust settings,
            then copy the generated usage snippet.
          </p>
          <LandingMit />
        </div>
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
