"use client"

import { useRef, type ReactNode } from "react"
import {
  DEFAULT_CALLIGRAPH_SETTINGS,
  DEFAULT_FORMAT_SETTINGS,
  DEFAULT_INPUT_SETTINGS,
  DEFAULT_LOGO_SETTINGS,
  DEFAULT_SCRUB_FIELD_SETTINGS,
  DEFAULT_SCRUB_SETTINGS,
  LOGO_ICON_OPTIONS,
  ScrubLogoIcon,
  ScrubNumberField,
  type BoundFeedbackMode,
  type CalligraphSettings,
  type CoarseModifier,
  type FineModifier,
  type InputSettings,
  type LogoSettings,
  type ScrubFieldSettings,
  type ScrubSettings,
  normalizeScrubFieldSettings,
  resolveFineStep,
} from "@/components/ui/scrub-number-input"
import { Slider } from "@/components/unlumen-ui/slider"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useDisplayOverflowTruncated } from "@/lib/scrub-number-overflow"
import { Calligraph } from "calligraph"
import { useReducedMotion } from "motion/react"

const FINE_MODIFIER_OPTIONS = ["shift", "alt", "meta"] as const satisfies readonly FineModifier[]

const FINE_MODIFIER_LABELS: Record<FineModifier, string> = {
  shift: "Shift",
  alt: "Alt / Option",
  meta: "Cmd",
}

const COARSE_MODIFIER_OPTIONS = [
  "shift",
  "alt",
  "meta",
] as const satisfies readonly CoarseModifier[]

const COARSE_MODIFIER_LABELS: Record<CoarseModifier, string> = {
  shift: "Shift",
  alt: "Alt / Option",
  meta: "Cmd",
}

function TextSelect<T extends string>({
  value,
  options,
  onChange,
  disabledOptions = [],
  formatLabel = (option) => option,
  renderOption,
}: {
  value: T
  options: readonly T[]
  onChange: (value: T) => void
  disabledOptions?: readonly T[]
  formatLabel?: (option: T) => string
  renderOption?: (option: T, selected: boolean) => React.ReactNode
}) {
  const disabled = new Set(disabledOptions)

  return (
    <div className="settings-option-group">
      {options.map((option) => {
        const selected = option === value
        const isDisabled = disabled.has(option)
        const label = renderOption
          ? renderOption(option, selected)
          : formatLabel(option)
        const sizerLabel = renderOption
          ? renderOption(option, true)
          : formatLabel(option)

        return (
          <button
            key={option}
            type="button"
            disabled={isDisabled}
            onClick={() => onChange(option)}
            className={cn(
              "settings-option text-xs capitalize outline-none focus-visible:underline",
              isDisabled
                ? "cursor-not-allowed text-muted-foreground/40"
                : "cursor-pointer",
              selected
                ? "text-foreground"
                : isDisabled
                  ? ""
                  : "text-muted-foreground hover:text-foreground/70",
            )}
            aria-disabled={isDisabled || undefined}
            aria-label={renderOption ? option : undefined}
          >
            <span className="settings-option-sizer" aria-hidden>
              {sizerLabel}
            </span>
            <span
              className={cn(
                "settings-option-label",
                selected && "font-medium",
              )}
            >
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function BoundResetIcon({ className }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.85355 2.14645C5.04882 2.34171 5.04882 2.65829 4.85355 2.85355L3.70711 4H9C11.4853 4 13.5 6.01472 13.5 8.5C13.5 10.9853 11.4853 13 9 13H5C4.72386 13 4.5 12.7761 4.5 12.5C4.5 12.2239 4.72386 12 5 12H9C10.933 12 12.5 10.433 12.5 8.5C12.5 6.567 10.933 5 9 5H3.70711L4.85355 6.14645C5.04882 6.34171 5.04882 6.65829 4.85355 6.85355C4.65829 7.04882 4.34171 7.04882 4.14645 6.85355L2.14645 4.85355C1.95118 4.65829 1.95118 4.34171 2.14645 4.14645L4.14645 2.14645C4.34171 1.95118 4.65829 1.95118 4.85355 2.14645Z"
        fill="currentColor"
      />
    </svg>
  )
}

function SettingsScrubNumberField({
  value,
  onChange,
  min,
  max,
  step,
  formatValue,
  "aria-label": ariaLabel,
  settings,
}: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  formatValue?: (value: number) => string
  "aria-label"?: string
  settings: ScrubFieldSettings
}) {
  return (
    <ScrubNumberField
      aria-label={ariaLabel}
      calligraph={settings.calligraph}
      className="settings-scrub w-24"
      format={settings.format}
      formatValue={formatValue}
      inputClassName="font-mono"
      inputSettings={settings.input}
      logo={{ ...settings.logo, enabled: false }}
      max={max}
      min={min}
      onValueChange={onChange}
      scrub={settings.scrub}
      step={step}
      value={value}
    />
  )
}

function SettingsSliderField({
  value,
  onChange,
  min,
  max,
  step,
  formatValue = String,
  calligraph,
  "aria-label": ariaLabel,
}: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  formatValue?: (value: number) => string
  calligraph?: CalligraphSettings
  "aria-label"?: string
}) {
  const shouldReduceMotion = useReducedMotion()
  const formatted = formatValue(value)
  const displayRef = useRef<HTMLSpanElement>(null)
  const isTruncated = useDisplayOverflowTruncated(displayRef, [
    formatted,
    calligraph,
    shouldReduceMotion,
  ])
  const animation =
    calligraph?.animation === "default" ? undefined : calligraph?.animation

  return (
    <div className="settings-scrub flex items-center gap-2">
      <span
        ref={displayRef}
        className="relative min-w-[3.25rem] shrink-0 overflow-hidden text-right font-mono text-xs tabular-nums leading-none text-muted-foreground"
        data-slot={calligraph && !shouldReduceMotion ? "scrub-number-calligraph-value" : undefined}
        data-truncated={isTruncated || undefined}
        title={isTruncated ? formatted : undefined}
      >
        {calligraph && !shouldReduceMotion ? (
          <Calligraph
            animation={animation}
            autoSize={false}
            className="scrub-number-calligraph inline-flex items-center justify-center leading-none"
            stagger={calligraph.stagger}
            variant="slots"
          >
            {formatted}
          </Calligraph>
        ) : (
          formatted
        )}
      </span>
      <Slider
        aria-label={ariaLabel}
        className="w-24"
        value={value}
        onChange={(next) => onChange(typeof next === "number" ? next : next[0])}
        min={min}
        max={max}
        step={step}
        showValue={false}
      />
    </div>
  )
}

function SettingsSection({
  title,
  children,
}: {
  title?: ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="settings-section">
      {title ? <h3 className="settings-section-heading">{title}</h3> : null}
      <div className="settings-section-rows">{children}</div>
    </section>
  )
}

function SettingsRow({
  label,
  multiline = false,
  children,
}: {
  label: string
  multiline?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn("settings-row", multiline && "settings-row-multiline")}>
      <span className="settings-row-label">{label}</span>
      <div className="settings-row-control">{children}</div>
    </div>
  )
}

function SettingsField({
  label,
  multiline = false,
  children,
}: {
  label: string
  multiline?: boolean
  children: React.ReactNode
}) {
  return (
    <SettingsRow label={label} multiline={multiline}>
      {children}
    </SettingsRow>
  )
}

function SettingsReveal({
  open,
  children,
}: {
  open: boolean
  children: React.ReactNode
}) {
  return (
    <div className="settings-reveal" data-open={open}>
      <div className="settings-reveal-inner">
        <div
          className="t-panel-slide"
          data-open={open}
          aria-hidden={!open}
          inert={!open}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function SwitchSettingsField({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <SettingsRow label={label}>
      <Switch
        label={label}
        checked={checked}
        onToggle={onToggle}
        className="settings-switch-control"
      />
    </SettingsRow>
  )
}

function BoundScrubNumberField({
  value,
  onChange,
  ariaLabel,
  settings,
  bound,
}: {
  value?: number
  onChange: (value: number | undefined) => void
  ariaLabel: string
  settings: ScrubFieldSettings
  bound: "min" | "max"
}) {
  const sharedFieldProps = {
    calligraph: settings.calligraph,
    format: settings.format,
    inputSettings: settings.input,
    inputClassName: "font-mono",
    logo: { ...settings.logo, enabled: false },
    scrub: settings.scrub,
    step: settings.step ?? 1,
    className: "w-24",
    min: bound === "max" ? settings.min : undefined,
    max: bound === "min" ? settings.max : undefined,
  }

  return (
    <div className="flex items-center gap-2">
        {value != null ? (
          <button
            type="button"
            aria-label={`Clear ${ariaLabel}`}
            className={cn(
              "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md",
              "text-muted-foreground transition-colors outline-none",
              "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
            )}
            onClick={() => onChange(undefined)}
          >
            <BoundResetIcon />
          </button>
        ) : (
          <span className="size-7 shrink-0" aria-hidden />
        )}
        {value == null ? (
          <button
            type="button"
            aria-label={`Set ${ariaLabel}`}
            className={cn(
              "flex h-7 w-24 items-center justify-center rounded-[20px] border border-input",
              "bg-[var(--input-fill)] px-2 font-mono text-[0.8rem] tabular-nums text-muted-foreground",
              "transition-colors hover:text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
            onClick={() => onChange(bound === "min" ? 0 : 100)}
          >
            —
          </button>
        ) : (
          <ScrubNumberField
            aria-label={ariaLabel}
            value={value}
            onValueChange={onChange}
            {...sharedFieldProps}
          />
        )}
    </div>
  )
}

export function ScrubSettingsPanel({
  value,
  onChange,
}: {
  value: ScrubFieldSettings
  onChange: (settings: ScrubFieldSettings) => void
}) {
  const settings = normalizeScrubFieldSettings(value)

  const patch = (partial: Partial<ScrubFieldSettings>) => {
    onChange(normalizeScrubFieldSettings({ ...settings, ...partial }))
  }

  const patchScrub = (partial: Partial<ScrubSettings>) => {
    onChange(
      normalizeScrubFieldSettings({
        ...settings,
        scrub: { ...settings.scrub, ...partial },
      }),
    )
  }

  const patchCalligraph = (partial: Partial<CalligraphSettings>) => {
    onChange(
      normalizeScrubFieldSettings({
        ...settings,
        calligraph: { ...settings.calligraph, ...partial },
      }),
    )
  }

  const patchInput = (partial: Partial<InputSettings>) => {
    onChange(
      normalizeScrubFieldSettings({
        ...settings,
        input: { ...settings.input, ...partial },
      }),
    )
  }

  const patchLogo = (partial: Partial<LogoSettings>) => {
    onChange(
      normalizeScrubFieldSettings({
        ...settings,
        logo: { ...settings.logo, ...partial },
      }),
    )
  }

  const fieldStep = settings.step ?? 1
  const resolvedFineStep = resolveFineStep(fieldStep, settings.scrub.fineStep)
  const fineModifier = settings.scrub.fineModifier ?? "alt"
  const coarseModifier = settings.scrub.coarseModifier ?? "shift"

  return (
    <div className="settings-panel">
      <SettingsSection title="Input">
        <SwitchSettingsField
          label="Select all on edit"
          checked={settings.input.selectOnEdit}
          onToggle={() =>
            patchInput({ selectOnEdit: !settings.input.selectOnEdit })
          }
        />

        <SwitchSettingsField
          label="Logo scroll"
          checked={settings.logo.enabled}
          onToggle={() => patchLogo({ enabled: !settings.logo.enabled })}
        />

        <SettingsReveal open={settings.logo.enabled}>
          <SettingsField label="Logo icon">
            <TextSelect
              value={settings.logo.icon}
              options={LOGO_ICON_OPTIONS}
              onChange={(icon) => patchLogo({ icon })}
              renderOption={(icon, selected) => (
                <ScrubLogoIcon
                  className={cn(
                    "size-3.5",
                    selected ? "text-foreground" : "text-muted-foreground",
                  )}
                  name={icon}
                />
              )}
            />
          </SettingsField>
        </SettingsReveal>

        <SwitchSettingsField
          label="Wheel scroll"
          checked={settings.scrub.wheelEnabled}
          onToggle={() =>
            patchScrub({ wheelEnabled: !settings.scrub.wheelEnabled })
          }
        />

        <SettingsReveal open={settings.scrub.wheelEnabled}>
          <SettingsField label="Wheel sensitivity">
            <SettingsScrubNumberField
              aria-label="Wheel sensitivity"
              min={1}
              max={200}
              settings={settings}
              step={1}
              value={settings.scrub.wheelSensitivity ?? 20}
              onChange={(wheelSensitivity) => patchScrub({ wheelSensitivity })}
            />
          </SettingsField>
        </SettingsReveal>

        <SettingsField label="Direction">
          <TextSelect
            value={settings.scrub.direction}
            options={["horizontal", "vertical"] as const}
            onChange={(direction) => patchScrub({ direction })}
          />
        </SettingsField>

        <SettingsField label="Sensitivity">
          <SettingsSliderField
            aria-label="Sensitivity"
            min={0.25}
            max={4}
            step={0.25}
            value={settings.scrub.sensitivity}
            onChange={(sensitivity) => patchScrub({ sensitivity })}
            formatValue={(v) => v.toFixed(2)}
            calligraph={settings.calligraph}
          />
        </SettingsField>

        <SettingsField label="Threshold">
          <SettingsSliderField
            aria-label="Scrub threshold"
            min={1}
            max={10}
            step={1}
            value={settings.scrub.threshold ?? 3}
            onChange={(threshold) => patchScrub({ threshold })}
            calligraph={settings.calligraph}
          />
        </SettingsField>
      </SettingsSection>

      <SettingsSection title="Limits">
        <SettingsField label="Start">
          <BoundScrubNumberField
            ariaLabel="Start"
            bound="min"
            settings={settings}
            value={settings.min}
            onChange={(min) => patch({ min })}
          />
        </SettingsField>

        <SettingsField label="End">
          <BoundScrubNumberField
            ariaLabel="End"
            bound="max"
            settings={settings}
            value={settings.max}
            onChange={(max) => patch({ max })}
          />
        </SettingsField>

        <SettingsField label="Bound feedback">
          <TextSelect
            value={settings.scrub.boundFeedback}
            options={
              [
                "none",
                "shake",
                "borderPulse",
              ] as const satisfies readonly BoundFeedbackMode[]
            }
            formatLabel={(option) =>
              option === "borderPulse" ? "border" : option
            }
            onChange={(boundFeedback) => patchScrub({ boundFeedback })}
          />
        </SettingsField>
      </SettingsSection>

      <SettingsSection title="Keyboard nudge">
        <SettingsField label="Step">
          <SettingsScrubNumberField
            aria-label="Step"
            min={0.001}
            max={10}
            settings={settings}
            step={0.001}
            value={fieldStep}
            onChange={(step) => patch({ step })}
          />
        </SettingsField>

        <SettingsField label="Fine step">
          <SettingsScrubNumberField
            aria-label="Fine step"
            min={0.001}
            max={Math.max(fieldStep, 1)}
            settings={settings}
            step={0.001}
            value={resolvedFineStep}
            onChange={(fineStep) => patchScrub({ fineStep })}
          />
        </SettingsField>

        <SettingsField label="Fine modifier">
          <TextSelect
            value={fineModifier}
            options={FINE_MODIFIER_OPTIONS}
            disabledOptions={[coarseModifier]}
            formatLabel={(option) => FINE_MODIFIER_LABELS[option]}
            onChange={(fineModifier) => patchScrub({ fineModifier })}
          />
        </SettingsField>

        <SettingsField label="Coarse step">
          <SettingsScrubNumberField
            aria-label="Coarse step"
            min={1}
            max={100}
            settings={settings}
            step={1}
            value={settings.scrub.shiftStep}
            onChange={(shiftStep) => patchScrub({ shiftStep })}
          />
        </SettingsField>

        <SettingsField label="Coarse modifier">
          <TextSelect
            value={coarseModifier}
            options={COARSE_MODIFIER_OPTIONS}
            disabledOptions={[fineModifier]}
            formatLabel={(option) => COARSE_MODIFIER_LABELS[option]}
            onChange={(coarseModifier) => patchScrub({ coarseModifier })}
          />
        </SettingsField>
      </SettingsSection>

      <SettingsSection
        title={
          <>
            animation{" "}
            <span className="settings-section-heading-suffix">
              by{" "}
              <a
                className="settings-section-heading-link"
                href="https://calligraph.raphaelsalaja.com/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Calligraph
              </a>
            </span>
          </>
        }
      >
        <SettingsField label="Variant">
          <TextSelect
            value={settings.calligraph.variant}
            options={["slots", "number"] as const}
            onChange={(variant) => patchCalligraph({ variant })}
          />
        </SettingsField>

        <SettingsField label="Animation">
          <TextSelect
            value={settings.calligraph.animation}
            options={["default", "smooth", "snappy", "bouncy"] as const}
            onChange={(animation) => patchCalligraph({ animation })}
          />
        </SettingsField>

        <SettingsField label="Stagger">
          <SettingsSliderField
            aria-label="Stagger"
            min={0}
            max={0.1}
            step={0.005}
            value={settings.calligraph.stagger}
            onChange={(stagger) => patchCalligraph({ stagger })}
            formatValue={(v) => v.toFixed(3)}
            calligraph={settings.calligraph}
          />
        </SettingsField>

        <SwitchSettingsField
          label="Auto-size"
          checked={settings.calligraph.autoSize}
          onToggle={() =>
            patchCalligraph({ autoSize: !settings.calligraph.autoSize })
          }
        />

      </SettingsSection>
    </div>
  )
}

export {
  DEFAULT_CALLIGRAPH_SETTINGS,
  DEFAULT_FORMAT_SETTINGS,
  DEFAULT_INPUT_SETTINGS,
  DEFAULT_LOGO_SETTINGS,
  DEFAULT_SCRUB_FIELD_SETTINGS,
  DEFAULT_SCRUB_SETTINGS,
}
