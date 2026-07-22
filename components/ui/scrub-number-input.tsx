"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react"
import { flushSync } from "react-dom"
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

function getInputPaddingInline(input: HTMLInputElement) {
  const style = getComputedStyle(input)
  return (
    parseFloat(style.paddingLeft) + parseFloat(style.borderLeftWidth || "0")
  )
}

function placeInputCaretAtPoint(
  input: HTMLInputElement,
  clientX: number,
  clientY: number,
) {
  input.focus({ preventScroll: true })

  const text = input.value

  if (!text.length) {
    input.setSelectionRange(0, 0)
    return
  }

  try {
    const doc = input.ownerDocument

    if (typeof doc.caretRangeFromPoint === "function") {
      const range = doc.caretRangeFromPoint(clientX, clientY)

      if (range?.startContainer === input) {
        const offset = Math.max(0, Math.min(text.length, range.startOffset))
        input.setSelectionRange(offset, offset)
        return
      }
    }

    if (typeof doc.caretPositionFromPoint === "function") {
      const position = doc.caretPositionFromPoint(clientX, clientY)

      if (position?.offsetNode === input) {
        const offset = Math.max(0, Math.min(text.length, position.offset))
        input.setSelectionRange(offset, offset)
        return
      }
    }
  } catch {
    // Fall through to width-based placement.
  }

  const rect = input.getBoundingClientRect()
  const style = getComputedStyle(input)
  const canvas = input.ownerDocument.createElement("canvas")
  const context = canvas.getContext("2d")

  if (!context) {
    input.setSelectionRange(text.length, text.length)
    return
  }

  context.font = `${style.fontStyle} ${style.fontVariant} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  const relativeX = Math.max(0, clientX - rect.left - getInputPaddingInline(input))

  let offset = text.length

  for (let index = 0; index <= text.length; index++) {
    const width = context.measureText(text.slice(0, index)).width

    if (width >= relativeX) {
      offset = index
      break
    }
  }

  try {
    input.setSelectionRange(offset, offset)
  } catch {
    input.setSelectionRange(text.length, text.length)
  }
}

function focusInputForEdit(
  input: HTMLInputElement,
  pointerPoint?: EditPointerPoint,
) {
  input.focus({ preventScroll: true })

  try {
    if (pointerPoint) {
      placeInputCaretAtPoint(
        input,
        pointerPoint.clientX,
        pointerPoint.clientY,
      )
      return
    }

    const length = input.value.length
    input.setSelectionRange(length, length)
  } catch {
    // jsdom can throw if focus/selection is not ready yet.
  }
}

type EditPointerPoint = {
  clientX: number
  clientY: number
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

type ScrubFieldBodyProps = {
  calligraph: CalligraphSettings
  direction: "horizontal" | "vertical"
  pixelSensitivity: number
  boundFeedback: BoundFeedbackMode
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
  onDoubleClickReset: () => void
  resetOnDoubleClick: boolean
  scrubbing: boolean
  inputProps?: Omit<ComponentProps<"input">, "onChange" | "type" | "value" | "size">
  inputRef: RefObject<HTMLInputElement | null>
}

function ScrubFieldBody({
  calligraph,
  direction,
  pixelSensitivity,
  boundFeedback,
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
  onDoubleClickReset,
  resetOnDoubleClick,
  scrubbing,
  inputProps,
  inputRef,
}: ScrubFieldBodyProps) {
  const fieldChromeClass = getFieldClasses()
  const fieldClass = getFieldClasses(inputClassName)
  const calligraphClipRef = useRef<HTMLDivElement>(null)
  const calligraphContentRef = useRef<HTMLSpanElement>(null)
  const boundLatchedRef = useRef({ min: false, max: false })
  const scrubGestureRef = useRef<{
    active: boolean
    moved: boolean
    delta: number
    clientX: number
    clientY: number
  }>({ active: false, moved: false, delta: 0, clientX: 0, clientY: 0 })
  const [scrubHolding, setScrubHolding] = useState(false)
  const pendingSelectAllRef = useRef(false)

  const logoScrollEnabled = logo.enabled
  const usesInputGroup = logoScrollEnabled
  const usesGroupedControl = grouped || logoScrollEnabled
  const atBound = getAtBound(numericValue, min, max)
  const scrubBounds = { min, max }
  const showNativeInput = editing && !scrubHolding
  const showDisplaySurface = !showNativeInput
  const displayContentClass = cn(
    "h-full w-full px-2 py-1 text-start text-[0.8rem] leading-none tabular-nums",
    inputClassName,
  )

  const isDisplayTruncated = useDisplayOverflowTruncated(
    calligraphClipRef,
    [displayValue, inputClassName, showNativeInput, nudgeTrend],
    calligraphContentRef,
  )

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

  const enterEditMode = useCallback(
    (pointerPoint?: EditPointerPoint) => {
      if (disabled) {
        return
      }

      setScrubHolding(false)
      scrubGestureRef.current = {
        active: false,
        moved: false,
        delta: 0,
        clientX: 0,
        clientY: 0,
      }
      pendingSelectAllRef.current = inputSettings.selectOnEdit

      flushSync(() => {
        onEditingChange(true)
      })

      requestAnimationFrame(() => {
        const input = inputRef.current

        if (!input) {
          return
        }

        if (inputSettings.selectOnEdit) {
          input.focus({ preventScroll: true })
          requestAnimationFrame(() => {
            try {
              input.select()
            } catch {
              // jsdom can throw if focus/selection is not ready yet.
            }
          })
          return
        }

        focusInputForEdit(input, pointerPoint)
      })
    },
    [disabled, inputSettings.selectOnEdit, onEditingChange, inputRef],
  )

  const scheduleEditMode = useCallback(
    (pointerPoint?: EditPointerPoint) => enterEditMode(pointerPoint),
    [enterEditMode],
  )

  const handleScrubGestureDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      scrubGestureRef.current = {
        active: true,
        moved: false,
        delta: 0,
        clientX: event.clientX,
        clientY: event.clientY,
      }
      setScrubHolding(true)
    },
    [],
  )

  const finishScrubGesture = useCallback(
    () => {
      const gesture = scrubGestureRef.current

      if (!gesture.active) {
        return
      }

      const pointerPoint = {
        clientX: gesture.clientX,
        clientY: gesture.clientY,
      }

      scrubGestureRef.current = {
        active: false,
        moved: false,
        delta: 0,
        clientX: 0,
        clientY: 0,
      }
      setScrubHolding(false)

      if (disabled) {
        return
      }

      if (gesture.moved) {
        onEditingChange(false)
        inputRef.current?.blur()
        return
      }

      scheduleEditMode(pointerPoint)
    },
    [disabled, inputRef, onEditingChange, scheduleEditMode],
  )

  const handleDisplayClick = useCallback(() => {
    if (logoScrollEnabled) {
      scheduleEditMode()
      return
    }

    finishScrubGesture()
  }, [finishScrubGesture, logoScrollEnabled, scheduleEditMode])

  const handleDisplayDoubleClick = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled || !resetOnDoubleClick) {
        return
      }

      event.preventDefault()

      scrubGestureRef.current = {
        active: false,
        moved: false,
        delta: 0,
        clientX: 0,
        clientY: 0,
      }
      setScrubHolding(false)
      onEditingChange(false)
      inputRef.current?.blur()
      onDoubleClickReset()
    },
    [disabled, inputRef, onDoubleClickReset, onEditingChange, resetOnDoubleClick],
  )

  const handleDisplayKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        scheduleEditMode()
      }
    },
    [disabled, scheduleEditMode],
  )

  // Track scrub movement on window (pointer lock) and finalize on pointerup.
  useEffect(() => {
    if (logoScrollEnabled) {
      return
    }

    const handleWindowPointerMove = (event: globalThis.PointerEvent) => {
      const gesture = scrubGestureRef.current

      if (!gesture.active || gesture.moved) {
        return
      }

      const axisDelta =
        direction === "vertical" ? event.movementY : event.movementX
      gesture.delta += axisDelta

      if (Math.abs(gesture.delta) >= pixelSensitivity) {
        gesture.moved = true
      }
    }

    const handleWindowPointerUp = () => {
      queueMicrotask(() => {
        finishScrubGesture()
      })
    }

    window.addEventListener("pointermove", handleWindowPointerMove, true)
    window.addEventListener("pointerup", handleWindowPointerUp, true)

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove, true)
      window.removeEventListener("pointerup", handleWindowPointerUp, true)
    }
  }, [direction, finishScrubGesture, logoScrollEnabled, pixelSensitivity])

  const calligraphLayoutKey = usesGroupedControl ? "group" : "field"

  const fieldShellClass = cn(
    usesGroupedControl
      ? "relative flex min-w-0 flex-1 overflow-hidden"
      : cn(
          fieldChromeClass,
          "scrub-bound-field relative isolate shrink-0 w-full px-0 py-0 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        ),
  )

  const nativeInputClass = cn(
    fieldClass,
    usesGroupedControl
      ? "w-full rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
      : "scrub-bound-field border-0 bg-transparent shadow-none focus-visible:ring-0",
    "absolute inset-0 z-[1] text-start leading-none",
    showNativeInput
      ? "cursor-text caret-current text-foreground"
      : "pointer-events-none opacity-0",
  )

  const displayOverlayShellClass = cn(
    "absolute inset-0 z-[2] flex min-w-0 items-center justify-start overflow-hidden text-foreground",
    !logoScrollEnabled && getScrubCursorClass(direction, atBound, scrubBounds),
    !logoScrollEnabled && "select-none",
    logoScrollEnabled && "cursor-text",
    disabled && "cursor-not-allowed opacity-50",
  )

  const calligraphOverlay = (
    <div
      className={cn(
        displayOverlayShellClass,
        showDisplaySurface
          ? "opacity-100"
          : "pointer-events-none opacity-0",
      )}
      data-slot="scrub-number-display-overlay"
    >
      <motion.div
        {...(grouped ? {} : { layoutRoot: true })}
        ref={calligraphClipRef}
        className={cn(
          "pointer-events-none relative flex min-w-0 items-center justify-start overflow-hidden",
          displayContentClass,
        )}
        data-slot="scrub-number-calligraph-value"
        style={{ height: "100%", minHeight: 0 }}
      >
        <CalligraphNumber
          contentRef={calligraphContentRef}
          layoutKey={calligraphLayoutKey}
          settings={calligraph}
          trend={nudgeTrend}
          value={displayValue}
        />
      </motion.div>
    </div>
  )

  const displayLayer = (
    <div
      aria-label={typeof inputProps?.["aria-label"] === "string" ? inputProps["aria-label"] : undefined}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={numericValue}
      aria-valuetext={isDisplayTruncated ? displayValue : undefined}
      aria-hidden={!showDisplaySurface}
      className={cn(
        "relative z-[3] flex min-w-0 flex-1 items-stretch",
        !showDisplaySurface && "pointer-events-none",
      )}
      data-slot={usesGroupedControl ? "input-group-control" : "scrub-number-scrubbable"}
      role="spinbutton"
      tabIndex={disabled || !showDisplaySurface ? -1 : 0}
      title={isDisplayTruncated ? displayValue : undefined}
      onFocus={() => {
        if (!disabled && !editing && !scrubHolding) {
          scheduleEditMode()
        }
      }}
      onClick={logoScrollEnabled ? handleDisplayClick : undefined}
      onDoubleClick={handleDisplayDoubleClick}
      onKeyDown={handleDisplayKeyDown}
    />
  )

  const scrubWrappedDisplay = logoScrollEnabled ? (
    displayLayer
  ) : (
    <NumberField.ScrubArea
      className={cn(
        "absolute inset-0 z-[2] flex min-w-0 items-stretch",
        getScrubCursorClass(direction, atBound, scrubBounds),
        "select-none",
        !showDisplaySurface && "pointer-events-none",
      )}
      direction={direction}
      pixelSensitivity={pixelSensitivity}
    >
      <NumberField.ScrubAreaCursor />
      <div
        className="relative flex min-w-0 flex-1"
        onClick={handleDisplayClick}
        onDoubleClick={handleDisplayDoubleClick}
        onKeyDown={handleDisplayKeyDown}
        onPointerDown={handleScrubGestureDown}
      >
        {displayLayer}
      </div>
    </NumberField.ScrubArea>
  )

  const fieldContent = (
    <div
      className={fieldShellClass}
    >
      <NumberField.Input
        {...inputProps}
        aria-hidden={!showNativeInput}
        className={nativeInputClass}
        data-editing={showNativeInput ? "" : undefined}
        disabled={disabled}
        data-slot={usesGroupedControl ? "input-group-control" : undefined}
        tabIndex={showNativeInput ? undefined : -1}
        onBlur={() => {
          scrubGestureRef.current = {
            active: false,
            moved: false,
            delta: 0,
            clientX: 0,
            clientY: 0,
          }
          setScrubHolding(false)
          onEditingChange(false)
        }}
        onFocus={(event) => {
          if (disabled) {
            return
          }

          if (scrubGestureRef.current.active || scrubHolding) {
            return
          }

          onEditingChange(true)

          if (!pendingSelectAllRef.current) {
            return
          }

          pendingSelectAllRef.current = false
          const input = event.currentTarget

          queueMicrotask(() => {
            try {
              input.select()
            } catch {
              // jsdom can throw if focus/selection is not ready yet.
            }
          })
        }}
        onDoubleClick={
          resetOnDoubleClick
            ? (event) => {
                event.preventDefault()
                scrubGestureRef.current = {
                  active: false,
                  moved: false,
                  delta: 0,
                  clientX: 0,
                  clientY: 0,
                }
                setScrubHolding(false)
                onEditingChange(false)
                event.currentTarget.blur()
                onDoubleClickReset()
              }
            : undefined
        }
        style={{
          caretColor: showNativeInput ? "currentColor" : "transparent",
          height: "100%",
          minHeight: 0,
        }}
      />
      {calligraphOverlay}
      {scrubWrappedDisplay}
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
  const scrubbingRef = useRef(false)
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
          scrubbingRef.current = true
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

        if (!editing && scrubbingRef.current) {
          inputRef.current?.blur()
        }

        scrubbingRef.current = false
      }
    },
    [editing, onValueCommitted],
  )

  const resetOnDoubleClick = defaultResetValue != null

  const handleDoubleClickReset = useCallback(() => {
    const resetValue = defaultResetValue ?? defaultValue

    if (resetValue == null) {
      return
    }

    const bounded = clampNumber(resetValue, min, max)
    prevValueRef.current = bounded
    setValue(bounded)
    onValueCommitted?.(bounded)
  }, [
    defaultResetValue,
    defaultValue,
    max,
    min,
    onValueCommitted,
    setValue,
  ])

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
          onDoubleClickReset={handleDoubleClickReset}
          resetOnDoubleClick={resetOnDoubleClick}
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
