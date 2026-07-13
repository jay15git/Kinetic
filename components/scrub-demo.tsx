"use client"

import { useEffect, useState } from "react"

import { ScrubRegistryPanel } from "@/components/scrub-registry-panel"
import { ResizeCard } from "@/components/resize-card"
import { ScrubSettingsPanel } from "@/components/scrub-settings-panel"
import {
  clampNumber,
  DEFAULT_SCRUB_FIELD_SETTINGS,
  normalizeScrubFieldSettings,
  ScrubNumberField,
} from "@/components/ui/scrub-number-input"

export function ScrubDemo() {
  const [value, setValue] = useState(0)
  const [settings, setSettings] = useState(DEFAULT_SCRUB_FIELD_SETTINGS)

  useEffect(() => {
    setSettings((current) => normalizeScrubFieldSettings(current))
  }, [])

  useEffect(() => {
    const { min, max } = settings
    setValue((current) => clampNumber(current, min, max))
  }, [settings.min, settings.max])

  const sharedFieldProps = {
    calligraph: settings.calligraph,
    format: settings.format,
    inputSettings: settings.input,
    logo: settings.logo,
    scrub: settings.scrub,
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
              onValueChange={setValue}
            />
          </div>
        </div>
      </div>

      <ResizeCard className="landing-settings">
        <ScrubSettingsPanel
          value={settings}
          onChange={(next) => setSettings(normalizeScrubFieldSettings(next))}
        />
      </ResizeCard>

      <ScrubRegistryPanel settings={settings} />

      <p className="landing-hint">
        Drag to scrub, click to type. Arrow keys, wheel, and drag share the same
        step ladder; use the fine and coarse modifier keys for smaller or larger
        steps. Double-click or fine-modifier+click resets to zero.
        {settings.logo.enabled
          ? " Drag the field icon to scrub."
          : settings.scrub.wheelEnabled
            ? " Scroll over the field to nudge in steps."
            : ""}
      </p>
    </div>
  )
}
