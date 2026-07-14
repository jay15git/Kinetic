"use client"

import { useState } from "react"

import { ResizeCard } from "@/components/resize-card"
import { ScrubApiPanel } from "@/components/scrub-api-panel"
import {
  DEFAULT_SCRUB_FIELD_SETTINGS,
  normalizeScrubFieldSettings,
  ScrubNumberField,
} from "@/components/ui/scrub-number-input"
import { HOW_IT_WORKS_GESTURES } from "@/lib/scrub-api-reference"

export function ScrubHowItWorks() {
  const [value, setValue] = useState(0)
  const settings = normalizeScrubFieldSettings(DEFAULT_SCRUB_FIELD_SETTINGS)

  return (
    <div className="landing-features-panel">
      <div className="landing-demo-card">
        <div>
          <ScrubNumberField
            aria-label="Value"
            className="w-full"
            inputClassName="landing-demo-input"
            allowWheelScrub={settings.allowWheelScrub}
            boundFeedback={settings.boundFeedback}
            calligraph={settings.calligraph}
            direction={settings.direction}
            format={settings.format}
            inputSettings={settings.input}
            largeStep={settings.largeStep}
            logo={settings.logo}
            pixelSensitivity={settings.pixelSensitivity}
            smallStep={settings.smallStep}
            step={settings.step ?? 1}
            min={settings.min}
            max={settings.max}
            defaultResetValue={0}
            value={value}
            onValueChange={setValue}
          />
        </div>
      </div>

      <ResizeCard className="landing-settings landing-features">
        <ul className="landing-features-list" aria-label="Features">
          {HOW_IT_WORKS_GESTURES.map((gesture) => (
            <li key={gesture.action} className="landing-features-row">
              <span className="landing-features-action">{gesture.action}</span>
              <span className="landing-features-result">{gesture.result}</span>
            </li>
          ))}
        </ul>
      </ResizeCard>

      <div id="api">
        <ResizeCard className="landing-settings landing-api-card">
          <ScrubApiPanel />
        </ResizeCard>
      </div>
    </div>
  )
}
