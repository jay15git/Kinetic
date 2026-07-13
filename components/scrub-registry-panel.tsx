"use client"

import { useMemo } from "react"

import { CodeBlock } from "@/components/code-block"
import type { ScrubFieldSettings } from "@/components/ui/scrub-number-input"
import { formatScrubFieldPropsCode } from "@/lib/scrub-props-code"
import { cn } from "@/lib/utils"

export function ScrubRegistryPanel({
  settings,
  className,
}: {
  settings: ScrubFieldSettings
  className?: string
}) {
  const propsCode = useMemo(
    () => formatScrubFieldPropsCode(settings),
    [settings],
  )

  return (
    <section className={cn("landing-demo-registry flex flex-col", className)}>
      <h2 className="landing-section-title mb-2">Props</h2>
      <CodeBlock label="Usage" code={propsCode} />
    </section>
  )
}
