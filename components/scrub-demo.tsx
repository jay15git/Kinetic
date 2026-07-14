"use client"

import { useState } from "react"

import { ScrubRegistryPanel } from "@/components/scrub-registry-panel"
import { ResizeCard } from "@/components/resize-card"
import { ScrubSettingsPanel } from "@/components/scrub-settings-panel"
import {
  clampNumber,
  DEFAULT_SCRUB_FIELD_SETTINGS,
  normalizeScrubFieldSettings,
  ScrubNumberField,
  type ScrubFieldSettings,
} from "@/components/ui/scrub-number-input"

export function ScrubDemo() {
  const [value, setValue] = useState(0)
  const [settings, setSettings] = useState(() =>
    normalizeScrubFieldSettings(DEFAULT_SCRUB_FIELD_SETTINGS),
  )

  const handleSettingsChange = (next: ScrubFieldSettings) => {
    const normalized = normalizeScrubFieldSettings(next)
    setSettings(normalized)
    setValue((current) => clampNumber(current, normalized.min, normalized.max))
  }

  const handleValueChange = (next: number) => {
    setValue(clampNumber(next, settings.min, settings.max))
  }

  const sharedFieldProps = {
    allowWheelScrub: settings.allowWheelScrub,
    boundFeedback: settings.boundFeedback,
    calligraph: settings.calligraph,
    direction: settings.direction,
    format: settings.format,
    inputSettings: settings.input,
    largeStep: settings.largeStep,
    logo: settings.logo,
    pixelSensitivity: settings.pixelSensitivity,
    smallStep: settings.smallStep,
    step: settings.step ?? 1,
    min: settings.min,
    max: settings.max,
    defaultResetValue: 0,
  }

  return (
    <div className="flex flex-col gap-9">
      <div className="landing-demo-sticky">
        <div className="landing-demo-card">
          <div>
            <ScrubNumberField
              aria-label="Value"
              className="w-full"
              inputClassName="landing-demo-input"
              {...sharedFieldProps}
              value={value}
              onValueChange={handleValueChange}
            />
          </div>
        </div>
      </div>

      <ResizeCard className="landing-settings">
        <ScrubSettingsPanel value={settings} onChange={handleSettingsChange} />
      </ResizeCard>

      <ScrubRegistryPanel settings={settings} />
    </div>
  )
}
