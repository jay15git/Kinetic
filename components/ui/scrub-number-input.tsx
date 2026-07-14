"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react"
import { NumberField } from "@base-ui/react/number-field"
import { Calligraph } from "calligraph"
import {
  GripHorizontal,
  GripVertical,
  Move,
  MoveHorizontal,
  MoveVertical,
  Percent,
  type LucideIcon,
} from "lucide-react"
import { useReducedMotion, motion } from "motion/react"

import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { useControllableState } from "@/hooks/use-controllable-state"
import { useDisplayOverflowTruncated } from "@/lib/scrub-number-overflow"
import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"

import "./scrub-number-input.css"

const SCRUB_NUMBER_FIELD_CLASS = "tabular-nums"

const SCRUB_NUMBER_SPINNER_HIDE_CLASS =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

const scrubFieldVariants = cva(
  "w-full min-w-0 rounded-[12px] border border-input bg-[var(--input-fill)] py-1 text-start text-base text-foreground transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-7 px-2 text-[0.8rem]",
)

export function clampNumber(value: number, min?: number, max?: number) {
  let bounded = value

  if (min != null && Number.isFinite(min)) {
    bounded = Math.max(min, bounded)
  }

  if (max != null && Number.isFinite(max)) {
    bounded = Math.min(max, bounded)
  }

  return bounded
}

export type InputSettings = {
  selectOnEdit: boolean
}

export const DEFAULT_INPUT_SETTINGS: InputSettings = {
  selectOnEdit: true,
}

export type BoundFeedbackMode = "none" | "shake" | "borderPulse"

export const BOUND_FEEDBACK_MODES = [
  "none",
  "shake",
  "borderPulse",
] as const satisfies readonly BoundFeedbackMode[]

export type BoundFeedbackSource = "wheel" | "key" | "scrub"

export type BoundFeedbackState = {
  edge: "min" | "max"
  overflow: number
  source: BoundFeedbackSource
  tick: number
}

export type CalligraphSettings = {
  variant: "number" | "slots"
  animation: "default" | "smooth" | "snappy" | "bouncy"
  stagger: number
  autoSize: boolean
}

export const DEFAULT_CALLIGRAPH_SETTINGS: CalligraphSettings = {
  variant: "slots",
  animation: "snappy",
  stagger: 0.02,
  autoSize: false,
}

export const LOGO_ICON_OPTIONS = [
  "GripVertical",
  "GripHorizontal",
  "Move",
  "MoveHorizontal",
  "MoveVertical",
  "Percent",
] as const

export type LogoIconName = (typeof LOGO_ICON_OPTIONS)[number]

export type LogoSettings = {
  enabled: boolean
  icon: LogoIconName
}

export const DEFAULT_LOGO_SETTINGS: LogoSettings = {
  enabled: false,
  icon: "GripVertical",
}

const LOGO_ICONS: Record<LogoIconName, LucideIcon> = {
  GripVertical,
  GripHorizontal,
  Move,
  MoveHorizontal,
  MoveVertical,
  Percent,
}

export function ScrubLogoIcon({
  className,
  name,
}: {
  className?: string
  name: LogoIconName
}) {
  const Icon = LOGO_ICONS[name]
  return <Icon aria-hidden className={className} />
}

export type ScrubFieldSettings = {
  calligraph: CalligraphSettings
  input: InputSettings
  logo: LogoSettings
  min?: number
  max?: number
  step?: number
  smallStep?: number
  largeStep?: number
  direction?: "horizontal" | "vertical"
  pixelSensitivity?: number
  allowWheelScrub?: boolean
  boundFeedback?: BoundFeedbackMode
  format?: Intl.NumberFormatOptions
}

export const DEFAULT_SCRUB_FIELD_SETTINGS: ScrubFieldSettings = {
  calligraph: DEFAULT_CALLIGRAPH_SETTINGS,
  input: DEFAULT_INPUT_SETTINGS,
  logo: DEFAULT_LOGO_SETTINGS,
  step: 1,
  smallStep: 0.1,
  largeStep: 10,
  direction: "horizontal",
  pixelSensitivity: 2,
  allowWheelScrub: false,
  boundFeedback: "none",
}

export function normalizeScrubFieldSettings(
  settings: ScrubFieldSettings,
): ScrubFieldSettings {
  let min = settings.min
  let max = settings.max

  if (
    min != null &&
    max != null &&
    Number.isFinite(min) &&
    Number.isFinite(max) &&
    min > max
  ) {
    ;[min, max] = [max, min]
  }

  const step =
    typeof settings.step === "number" && Number.isFinite(settings.step) && settings.step > 0
      ? settings.step
      : 1

  let smallStep = settings.smallStep ?? 0.1
  if (!Number.isFinite(smallStep) || smallStep <= 0 || smallStep >= step) {
    smallStep = Math.min(step / 10, step) || 0.1
  }

  let largeStep = settings.largeStep ?? 10
  if (!Number.isFinite(largeStep) || largeStep < step) {
    largeStep = Math.max(step, 10)
  }

  const requestedLogoIcon = settings.logo?.icon
  const logoIcon =
    requestedLogoIcon &&
    LOGO_ICON_OPTIONS.includes(requestedLogoIcon as LogoIconName)
      ? requestedLogoIcon
      : DEFAULT_LOGO_SETTINGS.icon

  const pixelSensitivity =
    typeof settings.pixelSensitivity === "number" &&
    Number.isFinite(settings.pixelSensitivity) &&
    settings.pixelSensitivity > 0
      ? settings.pixelSensitivity
      : 2

  return {
    calligraph: { ...DEFAULT_CALLIGRAPH_SETTINGS, ...settings.calligraph },
    input: { ...DEFAULT_INPUT_SETTINGS, ...settings.input },
    logo: {
      ...DEFAULT_LOGO_SETTINGS,
      ...settings.logo,
      icon: logoIcon,
    },
    min,
    max,
    step,
    smallStep,
    largeStep,
    direction: settings.direction === "vertical" ? "vertical" : "horizontal",
    pixelSensitivity,
    allowWheelScrub: Boolean(settings.allowWheelScrub),
    boundFeedback: settings.boundFeedback ?? "none",
    format: settings.format,
  }
}

export function getScrubCursorClass(
  direction: "horizontal" | "vertical",
  atBound: "min" | "max" | null = null,
  bounds?: { min?: number; max?: number },
) {
  if (
    bounds?.min != null &&
    bounds?.max != null &&
    bounds.min === bounds.max
  ) {
    return "cursor-not-allowed"
  }

  if (direction === "vertical") {
    if (atBound === "min") return "cursor-n-resize"
    if (atBound === "max") return "cursor-s-resize"
    return "cursor-ns-resize"
  }

  if (atBound === "min") return "cursor-e-resize"
  if (atBound === "max") return "cursor-w-resize"
  return "cursor-ew-resize"
}

function getAtBound(
  value: number,
  min?: number,
  max?: number,
): "min" | "max" | null {
  if (max != null && value >= max) return "max"
  if (min != null && value <= min) return "min"
  return null
}

function formatFieldValue(
  value: number | null,
  format?: Intl.NumberFormatOptions,
) {
  if (value == null || !Number.isFinite(value)) {
    return ""
  }

  return new Intl.NumberFormat(undefined, format).format(value)
}

const SCRUB_BOUND_FEEDBACK_MS = 80 * 2 + 60 * 2
const SCRUB_BOUND_REVERT_HOLD_MS = 600

function restartBoundShake(targets: HTMLElement[]) {
  for (const element of targets) {
    element.classList.remove("is-shaking")
    void element.offsetWidth
    element.classList.add("is-shaking")
  }
}

function clearBoundShake(targets: HTMLElement[]) {
  for (const element of targets) {
    element.classList.remove("is-shaking")
  }
}

function ScrubBoundFeedback({
  boundFeedback,
  children,
  className,
  mode,
  onFeedbackComplete,
}: {
  boundFeedback: BoundFeedbackState | null
  children: React.ReactNode
  className?: string
  mode: BoundFeedbackMode
  onFeedbackComplete: () => void
}) {
  const shouldReduceMotion = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [boundHit, setBoundHit] = useState<"min" | "max" | null>(null)
  const [boundError, setBoundError] = useState(false)

  useEffect(() => {
    if (!boundFeedback || mode === "none") {
      setBoundError(false)
      return
    }

    const shakeTargets = wrapRef.current
      ? Array.from(
          wrapRef.current.querySelectorAll<HTMLElement>(".scrub-bound-field"),
        )
      : []

    if (mode === "shake") {
      setBoundError(true)

      if (!shouldReduceMotion && shakeTargets.length > 0) {
        restartBoundShake(shakeTargets)
      }

      const completeTimer = window.setTimeout(() => {
        onFeedbackComplete()
      }, shouldReduceMotion ? 0 : SCRUB_BOUND_FEEDBACK_MS)

      const revertTimer = window.setTimeout(() => {
        setBoundError(false)
        clearBoundShake(shakeTargets)
      }, shouldReduceMotion
        ? 0
        : SCRUB_BOUND_FEEDBACK_MS + SCRUB_BOUND_REVERT_HOLD_MS)

      return () => {
        window.clearTimeout(completeTimer)
        window.clearTimeout(revertTimer)
      }
    }

    if (mode === "borderPulse") {
      setBoundHit(boundFeedback.edge)
      const timeout = window.setTimeout(() => {
        setBoundHit(null)
        onFeedbackComplete()
      }, shouldReduceMotion ? 0 : SCRUB_BOUND_FEEDBACK_MS)

      return () => {
        window.clearTimeout(timeout)
      }
    }
  }, [boundFeedback, mode, onFeedbackComplete, shouldReduceMotion])

  return (
    <div className={className}>
      <div
        ref={wrapRef}
        data-slot="scrub-bound-feedback"
        data-bound-hit={boundHit ?? undefined}
        className={cn("scrub-bound-wrap", boundError && "is-bound-error")}
      >
        {children}
      </div>
    </div>
  )
}

function splitSignedDisplayValue(value: string) {
  if (value.startsWith("-")) {
    return { body: value.slice(1), sign: "-" }
  }

  if (value.startsWith("+")) {
    return { body: value.slice(1), sign: "+" }
  }

  return { body: value, sign: "" }
}

function mirrorInputTypography(source: HTMLElement): CSSProperties {
  const computed = getComputedStyle(source)

  return {
    fontFamily: computed.fontFamily,
    fontFeatureSettings: computed.fontFeatureSettings,
    fontSize: computed.fontSize,
    fontStyle: computed.fontStyle,
    fontVariantNumeric: computed.fontVariantNumeric as CSSProperties["fontVariantNumeric"],
    fontWeight: computed.fontWeight,
    letterSpacing: computed.letterSpacing,
    lineHeight: computed.lineHeight,
  }
}

function mirrorCalligraphTypography(source: HTMLElement): CSSProperties {
  return {
    ...mirrorInputTypography(source),
    lineHeight: 1,
  }
}

function CalligraphNumber({
  contentRef,
  layoutKey,
  settings = DEFAULT_CALLIGRAPH_SETTINGS,
  style,
  trend = 0,
  value,
}: {
  contentRef?: RefObject<HTMLSpanElement | null>
  layoutKey?: string
  settings?: CalligraphSettings
  style?: CSSProperties
  trend?: 1 | -1 | 0
  value: string
}) {
  const shouldReduceMotion = useReducedMotion()
  const { body, sign } = splitSignedDisplayValue(value)

  const animation =
    settings.animation === "default" ? undefined : settings.animation

  if (shouldReduceMotion) {
    return (
      <span
        ref={contentRef}
        data-slot="scrub-number-calligraph-content"
        style={style}
      >
        {value}
      </span>
    )
  }

  return (
    <span
      ref={contentRef}
      className="inline-flex items-center justify-start"
      data-slot="scrub-number-calligraph-content"
      style={style}
    >
      {sign ? (
        <span aria-hidden="true" className="inline-block" style={style}>
          {sign}
        </span>
      ) : null}
      <Calligraph
        key={layoutKey}
        animation={animation}
        autoSize={settings.autoSize}
        className="scrub-number-calligraph inline-flex items-center justify-start leading-none"
        stagger={settings.stagger}
        style={style}
        trend={trend}
        variant={settings.variant}
      >
        {body}
      </Calligraph>
    </span>
  )
}

function getFieldClasses(inputClassName?: string, extra?: string) {
  return cn(
    scrubFieldVariants(),
    SCRUB_NUMBER_FIELD_CLASS,
    SCRUB_NUMBER_SPINNER_HIDE_CLASS,
    extra,
    inputClassName,
  )
}

function focusInputForEdit(
  input: HTMLInputElement,
  selectOnEdit: boolean,
) {
  input.focus({ preventScroll: true })

  if (selectOnEdit) {
    input.select()
  } else {
    const length = input.value.length
    input.setSelectionRange(length, length)
  }
}

type ScrubFieldBodyProps = {
  calligraph: CalligraphSettings
  direction: "horizontal" | "vertical"
  pixelSensitivity: number
  boundFeedback: BoundFeedbackMode
  defaultResetValue?: number
  disabled?: boolean
  displayValue: string
  editing: boolean
  grouped?: boolean
  inputClassName?: string
  inputSettings: InputSettings
  logo: LogoSettings
  min?: number
  max?: number
  nudgeTrend: 1 | -1 | 0
  numericValue: number
  onBoundFeedback: (edge: "min" | "max", source: BoundFeedbackSource) => void
  onEditingChange: (editing: boolean) => void
  onReset: (clientX: number, clientY: number) => boolean
  scrubbing: boolean
  inputProps?: Omit<ComponentProps<"input">, "onChange" | "type" | "value" | "size">
  inputRef: RefObject<HTMLInputElement | null>
}

function ScrubFieldBody({
  calligraph,
  direction,
  pixelSensitivity,
  boundFeedback,
  defaultResetValue,
  disabled,
  displayValue,
  editing,
  grouped = false,
  inputClassName,
  inputSettings,
  logo,
  min,
  max,
  nudgeTrend,
  numericValue,
  onBoundFeedback,
  onEditingChange,
  onReset,
  scrubbing,
  inputProps,
  inputRef,
}: ScrubFieldBodyProps) {
  const fieldClass = getFieldClasses(inputClassName)
  const calligraphClipRef = useRef<HTMLDivElement>(null)
  const calligraphContentRef = useRef<HTMLSpanElement>(null)
  const [mirroredTypography, setMirroredTypography] = useState<CSSProperties>({})
  const prevTypographyRef = useRef("")
  const lastClickRef = useRef<{ time: number; x: number; y: number } | null>(null)
  const boundLatchedRef = useRef({ min: false, max: false })
  const editTimerRef = useRef<number | null>(null)

  const logoScrollEnabled = logo.enabled
  const usesInputGroup = logoScrollEnabled
  const usesGroupedControl = grouped || logoScrollEnabled
  const atBound = getAtBound(numericValue, min, max)
  const scrubBounds = { min, max }

  const isDisplayTruncated = useDisplayOverflowTruncated(
    calligraphClipRef,
    [displayValue, mirroredTypography, editing, nudgeTrend],
    inputRef,
  )

  useLayoutEffect(() => {
    const syncMirroredTypography = () => {
      const source = inputRef.current

      if (!source) {
        return
      }

      const nextTypography = mirrorCalligraphTypography(source)
      const nextKey = JSON.stringify(nextTypography)

      if (nextKey === prevTypographyRef.current) {
        return
      }

      prevTypographyRef.current = nextKey
      setMirroredTypography(nextTypography)
    }

    syncMirroredTypography()

    const source = inputRef.current

    if (!source || typeof ResizeObserver === "undefined") {
      return
    }

    const observer = new ResizeObserver(syncMirroredTypography)
    observer.observe(source)

    return () => {
      observer.disconnect()
    }
  }, [displayValue, editing])

  useEffect(() => {
    return () => {
      if (editTimerRef.current != null) {
        window.clearTimeout(editTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (min != null && numericValue > min) {
      boundLatchedRef.current.min = false
    }

    if (max != null && numericValue < max) {
      boundLatchedRef.current.max = false
    }
  }, [max, min, numericValue])

  useEffect(() => {
    if (!scrubbing || boundFeedback === "none") {
      return
    }

    const handlePointerMove = () => {
      if (max != null && numericValue >= max && !boundLatchedRef.current.max) {
        boundLatchedRef.current.max = true
        onBoundFeedback("max", "scrub")
      }

      if (min != null && numericValue <= min && !boundLatchedRef.current.min) {
        boundLatchedRef.current.min = true
        onBoundFeedback("min", "scrub")
      }
    }

    window.addEventListener("pointermove", handlePointerMove)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
    }
  }, [boundFeedback, numericValue, max, min, onBoundFeedback, scrubbing])

  const enterEditMode = useCallback(() => {
    if (disabled) {
      return
    }

    onEditingChange(true)

    requestAnimationFrame(() => {
      const input = inputRef.current

      if (input) {
        focusInputForEdit(input, inputSettings.selectOnEdit)
      }
    })
  }, [disabled, inputSettings.selectOnEdit, onEditingChange])

  const handleDisplayClick = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled) {
        return
      }

      if (onReset(event.clientX, event.clientY)) {
        if (editTimerRef.current != null) {
          window.clearTimeout(editTimerRef.current)
          editTimerRef.current = null
        }
        event.preventDefault()
        event.stopPropagation()
        return
      }

      if (editTimerRef.current != null) {
        window.clearTimeout(editTimerRef.current)
      }

      editTimerRef.current = window.setTimeout(() => {
        editTimerRef.current = null
        enterEditMode()
      }, 250)
    },
    [disabled, enterEditMode, onReset],
  )

  const handleDisplayKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        enterEditMode()
      }
    },
    [disabled, enterEditMode],
  )

  const groupControlClass =
    "relative z-[1] flex min-w-0 w-full flex-1 items-center justify-start overflow-hidden rounded-none border-0 bg-transparent text-foreground shadow-none dark:bg-transparent"

  const calligraphLayoutKey = usesGroupedControl ? "group" : "field"

  const hiddenInputClass = cn(
    fieldClass,
    usesGroupedControl
      ? "w-full rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
      : "relative z-[1] scrub-bound-field",
    "text-start",
    editing
      ? "relative z-[2]"
      : "pointer-events-none absolute inset-0 z-0 opacity-0",
  )

  const displayLayer = (
    <div
      aria-label={typeof inputProps?.["aria-label"] === "string" ? inputProps["aria-label"] : undefined}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={numericValue}
      aria-valuetext={isDisplayTruncated ? displayValue : undefined}
      className={cn(
        fieldClass,
        usesGroupedControl
          ? groupControlClass
          : "relative z-[1] flex items-center justify-start text-foreground scrub-bound-field",
        !logoScrollEnabled &&
          getScrubCursorClass(direction, atBound, scrubBounds),
        !logoScrollEnabled && "select-none",
        logoScrollEnabled && "cursor-text",
        disabled && "cursor-not-allowed opacity-50",
      )}
      data-slot={usesGroupedControl ? "input-group-control" : "scrub-number-scrubbable"}
      role="spinbutton"
      tabIndex={disabled ? -1 : 0}
      title={isDisplayTruncated ? displayValue : undefined}
      onFocus={() => {
        if (!disabled && !editing) {
          inputRef.current?.focus({ preventScroll: true })
        }
      }}
      onClick={logoScrollEnabled ? handleDisplayClick : undefined}
      onKeyDown={handleDisplayKeyDown}
    >
      <motion.div
        {...(grouped ? {} : { layoutRoot: true })}
        ref={calligraphClipRef}
        className="pointer-events-none relative flex w-full min-w-0 items-center justify-start overflow-hidden text-foreground"
        data-slot="scrub-number-calligraph-value"
        style={mirroredTypography}
      >
        <CalligraphNumber
          contentRef={calligraphContentRef}
          layoutKey={calligraphLayoutKey}
          settings={calligraph}
          style={mirroredTypography}
          trend={nudgeTrend}
          value={displayValue}
        />
      </motion.div>
    </div>
  )

  const scrubWrappedDisplay = logoScrollEnabled ? (
    displayLayer
  ) : (
    <NumberField.ScrubArea
      className={cn(
        "relative flex min-w-0 flex-1 items-stretch",
        getScrubCursorClass(direction, atBound, scrubBounds),
        "select-none",
      )}
      direction={direction}
      pixelSensitivity={pixelSensitivity}
    >
      <NumberField.ScrubAreaCursor />
      <div
        className="relative flex min-w-0 flex-1"
        onClick={handleDisplayClick}
        onKeyDown={handleDisplayKeyDown}
      >
        {displayLayer}
      </div>
    </NumberField.ScrubArea>
  )

  const fieldContent = (
    <div
      className={cn(
        "relative",
        usesGroupedControl ? "flex min-w-0 flex-1 overflow-hidden" : "shrink-0",
      )}
    >
      {!editing ? scrubWrappedDisplay : null}
      <NumberField.Input
        {...inputProps}
        className={hiddenInputClass}
        disabled={disabled}
        data-slot={usesGroupedControl ? "input-group-control" : undefined}
        onBlur={() => {
          onEditingChange(false)
        }}
        style={editing ? undefined : { caretColor: "transparent" }}
      />
    </div>
  )

  const inputGroup = (
    <InputGroup
      className={cn("h-7 scrub-bound-field w-full")}
      data-logo-scroll={logoScrollEnabled ? "" : undefined}
    >
      {fieldContent}
      {logoScrollEnabled ? (
        <InputGroupAddon
          align="inline-end"
          className={cn(
            "shrink-0 select-none pr-1.5",
            getScrubCursorClass(direction, atBound, scrubBounds),
          )}
          data-slot="scrub-number-logo-scroll"
        >
          <NumberField.ScrubArea
            className="flex size-7 items-center justify-center"
            direction={direction}
            pixelSensitivity={pixelSensitivity}
          >
            <NumberField.ScrubAreaCursor />
            <ScrubLogoIcon
              className="pointer-events-none size-3.5 shrink-0 text-muted-foreground"
              name={logo.icon}
            />
          </NumberField.ScrubArea>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )

  return usesInputGroup ? inputGroup : fieldContent
}

export type ScrubNumberFieldProps = Omit<
  ComponentProps<"input">,
  "onChange" | "type" | "value" | "defaultValue" | "size" | "format"
> & {
  allowWheelScrub?: boolean
  boundFeedback?: BoundFeedbackMode
  calligraph?: CalligraphSettings
  defaultResetValue?: number
  direction?: "horizontal" | "vertical"
  format?: Intl.NumberFormatOptions
  grouped?: boolean
  inputSettings?: InputSettings
  label?: string
  labelClassName?: string
  largeStep?: number
  logo?: LogoSettings
  onValueChange?: (value: number) => void
  onValueCommitted?: (value: number) => void
  pixelSensitivity?: number
  smallStep?: number
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  className?: string
  inputClassName?: string
}

export function ScrubNumberField({
  allowWheelScrub = false,
  boundFeedback = "none",
  calligraph = DEFAULT_CALLIGRAPH_SETTINGS,
  className,
  defaultResetValue,
  defaultValue,
  direction = "horizontal",
  disabled,
  format,
  grouped = false,
  inputSettings = DEFAULT_INPUT_SETTINGS,
  label,
  labelClassName,
  largeStep = 10,
  logo = DEFAULT_LOGO_SETTINGS,
  max,
  min,
  onValueChange,
  onValueCommitted,
  pixelSensitivity = 2,
  smallStep = 0.1,
  step = 1,
  value: valueProp,
  inputClassName,
  ...props
}: ScrubNumberFieldProps) {
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue ?? 0,
    onChange: onValueChange,
    caller: "ScrubNumberField",
  })

  const [editing, setEditing] = useState(false)
  const [scrubbing, setScrubbing] = useState(false)
  const [boundFeedbackState, setBoundFeedbackState] =
    useState<BoundFeedbackState | null>(null)
  const [nudgeTrend, setNudgeTrend] = useState<1 | -1 | 0>(0)
  const boundFeedbackTickRef = useRef(0)
  const prevValueRef = useRef(value)
  const lastClickRef = useRef<{ time: number; x: number; y: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const displayValue = formatFieldValue(value, format)

  const triggerBoundFeedback = useCallback(
    (edge: "min" | "max", source: BoundFeedbackSource) => {
      if (boundFeedback === "none") {
        return
      }

      boundFeedbackTickRef.current += 1
      setBoundFeedbackState({
        edge,
        overflow: 1,
        source,
        tick: boundFeedbackTickRef.current,
      })
    },
    [boundFeedback],
  )

  const handleValueChange = useCallback(
    (
      next: number | null,
      eventDetails: NumberField.Root.ChangeEventDetails,
    ) => {
      const num = next ?? 0
      const reason = eventDetails.reason
      const prev = prevValueRef.current

      if (
        boundFeedback !== "none" &&
        (reason === "scrub" || reason === "wheel" || reason === "keyboard")
      ) {
        if (reason === "scrub") {
          setScrubbing(true)
        }

        const source: BoundFeedbackSource =
          reason === "wheel" ? "wheel" : reason === "scrub" ? "scrub" : "key"

        if (max != null && num >= max && prev < max) {
          triggerBoundFeedback("max", source)
        }

        if (min != null && num <= min && prev > min) {
          triggerBoundFeedback("min", source)
        }
      }

      if (num !== prev) {
        setNudgeTrend(num > prev ? 1 : -1)
      }

      prevValueRef.current = num
      setValue(num)
    },
    [boundFeedback, max, min, setValue, triggerBoundFeedback],
  )

  const handleValueCommitted = useCallback(
    (
      next: number | null,
      eventDetails: NumberField.Root.CommitEventDetails,
    ) => {
      const num = next ?? 0
      onValueCommitted?.(num)

      if (eventDetails.reason === "scrub") {
        setScrubbing(false)
      }
    },
    [onValueCommitted],
  )

  const handleResetGesture = useCallback(
    (clientX: number, clientY: number) => {
      const resetValue = defaultResetValue ?? defaultValue

      if (resetValue == null) {
        return false
      }

      const now = Date.now()
      const lastClick = lastClickRef.current

      if (
        lastClick &&
        now - lastClick.time < 300 &&
        Math.hypot(clientX - lastClick.x, clientY - lastClick.y) < 5
      ) {
        lastClickRef.current = null
        const bounded = clampNumber(resetValue, min, max)
        prevValueRef.current = bounded
        setValue(bounded)
        onValueCommitted?.(bounded)
        return true
      }

      lastClickRef.current = {
        time: now,
        x: clientX,
        y: clientY,
      }

      return false
    },
    [defaultResetValue, defaultValue, max, min, onValueCommitted, setValue],
  )

  const field = (
    <NumberField.Root
      allowWheelScrub={allowWheelScrub}
      className={cn("relative shrink-0", className)}
      disabled={disabled}
      format={format}
      inputRef={inputRef}
      largeStep={largeStep}
      max={max}
      min={min}
      onValueChange={handleValueChange}
      onValueCommitted={handleValueCommitted}
      smallStep={smallStep}
      step={step}
      value={value}
    >
      <ScrubBoundFeedback
        boundFeedback={boundFeedbackState}
        className={logo.enabled || grouped ? "w-full min-w-0" : undefined}
        mode={boundFeedback}
        onFeedbackComplete={() => {
          setBoundFeedbackState(null)
        }}
      >
        <ScrubFieldBody
          boundFeedback={boundFeedback}
          calligraph={calligraph}
          direction={direction}
          disabled={disabled}
          displayValue={displayValue}
          editing={editing}
          grouped={grouped}
          inputClassName={inputClassName}
          inputProps={props}
          inputRef={inputRef}
          inputSettings={inputSettings}
          logo={logo}
          max={max}
          min={min}
          nudgeTrend={nudgeTrend}
          numericValue={value}
          onBoundFeedback={triggerBoundFeedback}
          onEditingChange={setEditing}
          onReset={handleResetGesture}
          pixelSensitivity={pixelSensitivity}
          scrubbing={scrubbing}
        />
      </ScrubBoundFeedback>
    </NumberField.Root>
  )

  if (!label) {
    return field
  }

  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "w-16 text-sm font-medium text-muted-foreground",
          labelClassName,
        )}
      >
        {label}
      </span>
      {field}
    </div>
  )
}
