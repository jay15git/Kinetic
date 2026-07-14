import {
  DEFAULT_CALLIGRAPH_SETTINGS,
  DEFAULT_INPUT_SETTINGS,
  DEFAULT_LOGO_SETTINGS,
  DEFAULT_SCRUB_FIELD_SETTINGS,
  type ScrubFieldSettings,
} from "@/components/ui/scrub-number-input"

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

function diffFromDefaults<T extends Record<string, unknown>>(
  current: T,
  defaults: T,
): Partial<T> | null {
  const diff: Partial<T> = {}
  let changed = false

  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const currentValue = current[key]
    const defaultValue = defaults[key]

    if (isPlainObject(currentValue) && isPlainObject(defaultValue)) {
      const nested = diffFromDefaults(
        currentValue as Record<string, unknown>,
        defaultValue as Record<string, unknown>,
      )

      if (nested && Object.keys(nested).length > 0) {
        diff[key] = nested as T[keyof T]
        changed = true
      }

      continue
    }

    if (JSON.stringify(currentValue) !== JSON.stringify(defaultValue)) {
      diff[key] = currentValue
      changed = true
    }
  }

  return changed ? diff : null
}

function formatJsxAttribute(name: string, value: unknown): string {
  if (typeof value === "string") {
    return `${name}=${JSON.stringify(value)}`
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return `${name}={${String(value)}}`
  }

  return `${name}={${JSON.stringify(value)}}`
}

export function formatScrubFieldPropsCode(settings: ScrubFieldSettings): string {
  const attributes: string[] = [
    'aria-label="Value"',
    "value={value}",
    "onValueChange={setValue}",
  ]

  const calligraph = diffFromDefaults(settings.calligraph, DEFAULT_CALLIGRAPH_SETTINGS)
  const inputSettings = diffFromDefaults(settings.input, DEFAULT_INPUT_SETTINGS)
  const logo = diffFromDefaults(settings.logo, DEFAULT_LOGO_SETTINGS)

  if (settings.min != null) {
    attributes.push(formatJsxAttribute("min", settings.min))
  }

  if (settings.max != null) {
    attributes.push(formatJsxAttribute("max", settings.max))
  }

  if (settings.step != null && settings.step !== 1) {
    attributes.push(formatJsxAttribute("step", settings.step))
  }

  if (settings.smallStep != null && settings.smallStep !== 0.1) {
    attributes.push(formatJsxAttribute("smallStep", settings.smallStep))
  }

  if (settings.largeStep != null && settings.largeStep !== 10) {
    attributes.push(formatJsxAttribute("largeStep", settings.largeStep))
  }

  if (settings.direction != null && settings.direction !== "horizontal") {
    attributes.push(formatJsxAttribute("direction", settings.direction))
  }

  if (
    settings.pixelSensitivity != null &&
    settings.pixelSensitivity !== 2
  ) {
    attributes.push(formatJsxAttribute("pixelSensitivity", settings.pixelSensitivity))
  }

  if (settings.allowWheelScrub) {
    attributes.push(formatJsxAttribute("allowWheelScrub", true))
  }

  if (settings.boundFeedback != null && settings.boundFeedback !== "none") {
    attributes.push(formatJsxAttribute("boundFeedback", settings.boundFeedback))
  }

  if (settings.format) {
    attributes.push(formatJsxAttribute("format", settings.format))
  }

  if (calligraph) {
    attributes.push(formatJsxAttribute("calligraph", calligraph))
  }

  if (inputSettings) {
    attributes.push(formatJsxAttribute("inputSettings", inputSettings))
  }

  if (logo) {
    attributes.push(formatJsxAttribute("logo", logo))
  }

  const fieldProps = attributes.map((line) => `      ${line}`).join("\n")

  return `"use client"

import { useState } from "react"
import { ScrubNumberField } from "@/components/ui/scrub-number-input"
import "@/components/ui/scrub-number-input.css"

export function Example() {
  const [value, setValue] = useState(0)

  return (
    <ScrubNumberField
${fieldProps}
    />
  )
}`
}

export function getScrubRegistryInstallCommands(registryBaseUrl: string) {
  const registryItemUrl = `${registryBaseUrl.replace(/\/$/, "")}/r/scrub-number-field.json`

  return {
    registryItemUrl,
    prerequisite: "pnpm dlx shadcn@latest add input input-group",
    scoped: "pnpm dlx shadcn@latest add @kinetic/scrub-number-field",
    direct: `pnpm dlx shadcn@latest add ${registryItemUrl}`,
  }
}
