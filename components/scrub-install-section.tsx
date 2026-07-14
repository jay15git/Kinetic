"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"

import { CodeBlock, FileCodeBlock, TerminalCodeBlock } from "@/components/code-block"
import { InstallStep, InstallSteps } from "@/components/install-steps"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  readInitialInstallTab,
  type InstallTab,
} from "@/lib/install-tab-pending"
import type { ScrubInstallHighlighted } from "@/lib/scrub-install-highlighted"
import type { ScrubInstallContent } from "@/lib/scrub-install-content"

/** Strong ease-out — Emil / animation audit standard for UI entrances */
const PANEL_EASE = [0.23, 1, 0.32, 1] as const
const PANEL_DURATION = 0.2

function CommandPanel({
  content,
  highlighted,
}: {
  content: ScrubInstallContent
  highlighted: ScrubInstallHighlighted
}) {
  return (
    <div className="flex min-w-0 max-w-full flex-col gap-4">
      <TerminalCodeBlock
        code={content.command}
        initialHighlightedHtml={highlighted.command}
      />
      <p className="landing-hint !mt-0">
        Add the{" "}
        <code className="font-mono text-[var(--landing-ink-2)]">@kinetic</code>{" "}
        registry to{" "}
        <code className="font-mono text-[var(--landing-ink-2)]">
          components.json
        </code>{" "}
        (until listed in the shadcn registry directory), plus shadcn{" "}
        <code className="font-mono text-[var(--landing-ink-2)]">input</code> and{" "}
        <code className="font-mono text-[var(--landing-ink-2)]">input-group</code>
        .
      </p>
      <CodeBlock
        label="components.json"
        code={content.registrySnippet}
        initialHighlightedHtml={highlighted.registrySnippet}
      />
    </div>
  )
}

function ManualPanel({
  content,
  highlighted,
}: {
  content: ScrubInstallContent
  highlighted: ScrubInstallHighlighted
}) {
  return (
    <div className="min-w-0 max-w-full">
      <InstallSteps>
        <InstallStep title="Install dependencies">
          <TerminalCodeBlock
            code={content.dependenciesCommand}
            initialHighlightedHtml={highlighted.dependenciesCommand}
          />
        </InstallStep>

        <InstallStep title="Add shadcn components">
          <TerminalCodeBlock
            code={content.shadcnComponentsCommand}
            initialHighlightedHtml={highlighted.shadcnComponentsCommand}
          />
        </InstallStep>

        <InstallStep title="Copy source files">
          <div className="flex min-w-0 max-w-full flex-col gap-3">
            {content.files.map((file) => (
              <FileCodeBlock
                key={file.path}
                title={file.target}
                code={file.content}
                initialHighlightedHtml={highlighted.files[file.path]}
              />
            ))}
          </div>
        </InstallStep>

        <InstallStep title="Update import paths">
          <p className="landing-hint !mt-0">{content.importPathsNote}</p>
        </InstallStep>
      </InstallSteps>
    </div>
  )
}

function InstallTabPanel({
  active,
  id,
  labelledBy,
  reduceMotion,
  children,
}: {
  active: boolean
  id: string
  labelledBy: string
  reduceMotion: boolean | null
  children: React.ReactNode
}) {
  return (
    <motion.div
      role="tabpanel"
      id={id}
      aria-labelledby={labelledBy}
      aria-hidden={!active}
      inert={!active ? true : undefined}
      className="landing-install-panel"
      data-active={active ? "true" : "false"}
      initial={false}
      animate={{
        opacity: active ? 1 : 0,
        filter: reduceMotion || active ? "blur(0px)" : "blur(2px)",
      }}
      transition={{
        duration: reduceMotion ? 0 : PANEL_DURATION,
        ease: PANEL_EASE,
      }}
    >
      {children}
    </motion.div>
  )
}

export function ScrubInstallSection({
  content,
  highlighted,
}: {
  content: ScrubInstallContent
  highlighted: ScrubInstallHighlighted
}) {
  const [tab, setTab] = useState<InstallTab>(readInitialInstallTab)
  const reduceMotion = useReducedMotion()

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        if (value === "cli" || value === "manual") setTab(value)
      }}
      className="landing-install-tabs"
    >
      <TabsList variant="line" className="landing-install-tab-list">
        <TabsTrigger value="cli" data-install-tab-trigger="cli">
          <span className="landing-tab-label">Command</span>
        </TabsTrigger>
        <TabsTrigger value="manual" data-install-tab-trigger="manual">
          <span className="landing-tab-label">Manual</span>
        </TabsTrigger>
      </TabsList>

      <div className="landing-install-panel-shell">
        <InstallTabPanel
          active={tab === "cli"}
          id="install-panel-cli"
          labelledBy="install-tab-cli"
          reduceMotion={reduceMotion}
        >
          <CommandPanel content={content} highlighted={highlighted} />
        </InstallTabPanel>
        <InstallTabPanel
          active={tab === "manual"}
          id="install-panel-manual"
          labelledBy="install-tab-manual"
          reduceMotion={reduceMotion}
        >
          <ManualPanel content={content} highlighted={highlighted} />
        </InstallTabPanel>
      </div>
    </Tabs>
  )
}
