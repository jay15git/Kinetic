"use client"

import { useState, type ReactNode } from "react"
import { ChevronDownIcon } from "lucide-react"

import { CodeBlock } from "@/components/code-block"
import {
  API_REFERENCE_SECTIONS,
  HEADLESS_USAGE_CODE,
  SCRUB_GESTURES,
  type ApiGestureRow,
  type ApiReferenceRow,
  type ApiReferenceSection,
} from "@/lib/scrub-api-reference"
import { cn } from "@/lib/utils"

function summarizeApiType(type: string): string {
  const trimmed = type.trim()

  if (trimmed.includes("=>") || trimmed.startsWith("(")) return "function"
  if (trimmed.endsWith("[]")) return "array"
  if (trimmed.includes("|")) return trimmed.split("|")[0]?.trim().replace(/"/g, "") ?? trimmed

  return trimmed
}

function ApiPanelReveal({
  open,
  id,
  labelledBy,
  children,
}: {
  open: boolean
  id: string
  labelledBy: string
  children: ReactNode
}) {
  return (
    <div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      className="settings-reveal landing-api-accordion-reveal"
      data-open={open}
    >
      <div className="settings-reveal-inner">
        <div
          className="t-panel-slide landing-api-accordion-panel"
          data-open={open}
          aria-hidden={!open}
          inert={!open ? true : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function ApiAccordionItem({
  id,
  name,
  summaryType,
  open,
  onToggle,
  children,
}: {
  id: string
  name: string
  summaryType: string
  open: boolean
  onToggle: (id: string) => void
  children: ReactNode
}) {
  return (
    <div className="landing-api-accordion-item">
      <button
        type="button"
        className="landing-api-accordion-trigger"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        id={`${id}-trigger`}
        onClick={() => onToggle(id)}
      >
        <code className="landing-api-accordion-prop">{name}</code>
        <code className="landing-api-accordion-type-summary">{summaryType}</code>
        <ChevronDownIcon
          aria-hidden
          className={cn(
            "landing-api-accordion-chevron",
            open && "landing-api-accordion-chevron-open",
          )}
        />
      </button>
      <ApiPanelReveal
        open={open}
        id={`${id}-panel`}
        labelledBy={`${id}-trigger`}
      >
        {children}
      </ApiPanelReveal>
    </div>
  )
}

function ApiReferenceDetail({ row }: { row: ApiReferenceRow }) {
  return (
    <>
      <p className="landing-api-accordion-description">{row.description}</p>
      <div className="landing-api-type-block">
        <span className="landing-api-type-label">Type</span>
        <code className="landing-api-type-value">{row.type}</code>
      </div>
      {row.defaultValue ? (
        <div className="landing-api-type-block">
          <span className="landing-api-type-label">Default</span>
          <code className="landing-api-type-value">{row.defaultValue}</code>
        </div>
      ) : null}
    </>
  )
}

function ApiReferenceSectionAccordion({
  section,
  openId,
  onToggle,
}: {
  section: ApiReferenceSection
  openId: string | null
  onToggle: (id: string) => void
}) {
  return (
    <section className="landing-api-section">
      <h4 className="landing-api-section-title">{section.title}</h4>
      <div className="landing-api-table">
        <div className="landing-api-table-header" aria-hidden="true">
          <span>Prop</span>
          <span>Type</span>
        </div>
        <div className="landing-api-accordion-list">
          {section.rows.map((row) => {
            const id = `${section.id}:${row.name}`
            return (
              <ApiAccordionItem
                key={id}
                id={id}
                name={row.name}
                summaryType={summarizeApiType(row.type)}
                open={openId === id}
                onToggle={onToggle}
              >
                <ApiReferenceDetail row={row} />
              </ApiAccordionItem>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ApiGestureSectionAccordion({
  openId,
  onToggle,
}: {
  openId: string | null
  onToggle: (id: string) => void
}) {
  return (
    <section className="landing-api-section">
      <h4 className="landing-api-section-title">Gestures</h4>
      <div className="landing-api-table">
        <div className="landing-api-table-header" aria-hidden="true">
          <span>Action</span>
          <span>Result</span>
        </div>
        <div className="landing-api-accordion-list">
          {SCRUB_GESTURES.map((row) => {
            const id = `gesture:${row.action}`
            return (
              <ApiAccordionItem
                key={id}
                id={id}
                name={row.action}
                summaryType="gesture"
                open={openId === id}
                onToggle={onToggle}
              >
                <ApiGestureDetail row={row} />
              </ApiAccordionItem>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ApiGestureDetail({ row }: { row: ApiGestureRow }) {
  return (
    <>
      <p className="landing-api-accordion-description">{row.result}</p>
      <div className="landing-api-type-block">
        <span className="landing-api-type-label">Action</span>
        <code className="landing-api-type-value">{row.action}</code>
      </div>
    </>
  )
}

export function ScrubApiPanel() {
  const [openId, setOpenId] = useState<string | null>(null)

  const handleToggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id))
  }

  return (
    <div className="landing-api-panel">
      <h3 className="landing-api-heading">API reference</h3>

      {API_REFERENCE_SECTIONS.map((section) => (
        <ApiReferenceSectionAccordion
          key={section.id}
          section={section}
          openId={openId}
          onToggle={handleToggle}
        />
      ))}

      <ApiGestureSectionAccordion openId={openId} onToggle={handleToggle} />

      <section className="landing-api-section">
        <h4 className="landing-api-section-title">Headless</h4>
        <p className="landing-hint !mt-0">
          Use{" "}
          <code className="font-mono text-[var(--landing-ink-2)]">useNumberScrub</code>{" "}
          with{" "}
          <code className="font-mono text-[var(--landing-ink-2)]">ScrubNumberInput</code>{" "}
          for custom layouts.
        </p>
        <CodeBlock label="Headless" code={HEADLESS_USAGE_CODE} />
      </section>
    </div>
  )
}
