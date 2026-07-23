export type ApiReferenceRow = {
  name: string
  type: string
  description: string
  defaultValue?: string
}

export type ApiGestureRow = {
  action: string
  result: string
}

export const SCRUB_NUMBER_FIELD_PROPS: ApiReferenceRow[] = [
  { name: "value", type: "number", description: "Controlled value" },
  { name: "defaultValue", type: "number", description: "Initial value when uncontrolled" },
  {
    name: "onValueChange",
    type: "(n: number) => void",
    description: "Fires on every change (scrub, keys, wheel, typing)",
  },
  {
    name: "onValueCommitted",
    type: "(n: number) => void",
    description: "Fires on blur after edit, or when scrub / wheel ends",
  },
  {
    name: "defaultResetValue",
    type: "number",
    description: "Reset target when double-clicking the logo handle (logo mode)",
  },
  { name: "min", type: "number", description: "Clamp lower bound" },
  { name: "max", type: "number", description: "Clamp upper bound" },
  { name: "step", type: "number", description: "Normal increment", defaultValue: "1" },
  {
    name: "smallStep",
    type: "number",
    description: "Fine increment while Alt is held",
    defaultValue: "0.1",
  },
  {
    name: "largeStep",
    type: "number",
    description: "Coarse increment while Shift is held",
    defaultValue: "10",
  },
  {
    name: "allowWheelScrub",
    type: "boolean",
    description: "Wheel nudge while focused",
    defaultValue: "false",
  },
  {
    name: "direction",
    type: '"horizontal" | "vertical"',
    description: "Scrub axis",
    defaultValue: '"horizontal"',
  },
  {
    name: "pixelSensitivity",
    type: "number",
    description: "Pixels per step while scrubbing (higher = less sensitive)",
    defaultValue: "2",
  },
  {
    name: "format",
    type: "Intl.NumberFormatOptions",
    description: "Display formatting via Intl.NumberFormat",
  },
  {
    name: "boundFeedback",
    type: '"none" | "shake" | "borderPulse"',
    description: "Feedback when value hits min or max",
  },
  {
    name: "calligraph",
    type: "CalligraphSettings",
    description: "Digit animation variant",
  },
  {
    name: "inputSettings",
    type: "InputSettings",
    description: "Select-on-edit behavior",
  },
  { name: "logo", type: "LogoSettings", description: "Logo handle scrub mode; double-click logo to reset" },
  {
    name: "grouped",
    type: "boolean",
    description: "Borderless control for use inside InputGroup",
  },
  { name: "label", type: "string", description: "Optional side label" },
  { name: "disabled", type: "boolean", description: "Disable interaction" },
]

export const CALLIGRAPH_SETTINGS_ROWS: ApiReferenceRow[] = [
  {
    name: "calligraph.variant",
    type: '"number" | "slots"',
    defaultValue: '"slots"',
    description: "Digit animation style",
  },
  {
    name: "calligraph.animation",
    type: '"default" | "smooth" | "snappy" | "bouncy"',
    defaultValue: '"snappy"',
    description: "Transition character",
  },
  {
    name: "calligraph.stagger",
    type: "number",
    defaultValue: "0.02",
    description: "Per-digit stagger delay",
  },
  {
    name: "calligraph.autoSize",
    type: "boolean",
    defaultValue: "false",
    description: "Grow width with digit count",
  },
]

export const INPUT_SETTINGS_ROWS: ApiReferenceRow[] = [
  {
    name: "inputSettings.selectOnEdit",
    type: "boolean",
    defaultValue: "true",
    description: "Select all text when entering edit mode",
  },
]

export const LOGO_SETTINGS_ROWS: ApiReferenceRow[] = [
  {
    name: "logo.enabled",
    type: "boolean",
    defaultValue: "false",
    description: "Show logo handle for scrubbing; double-click to reset",
  },
  {
    name: "logo.icon",
    type: "LogoIconName",
    defaultValue: '"GripVertical"',
    description: "Lucide icon name for the handle",
  },
]

export const SCRUB_GESTURES: ApiGestureRow[] = [
  { action: "Drag field / handle", result: "Scrub by step (pointer-lock gesture)" },
  { action: "Up/Down arrows", result: "Nudge by step" },
  { action: "Alt + drag / Alt + Up/Down / wheel", result: "smallStep" },
  { action: "Shift + drag / Shift + Up/Down / wheel", result: "largeStep" },
  { action: "Wheel (allowWheelScrub)", result: "Step while focused" },
  { action: "Click field", result: "Enter edit mode" },
  { action: "Home / End", result: "Jump to min / max" },
  { action: "Double-click logo handle", result: "Reset to defaultResetValue (logo mode)" },
  { action: "Enter", result: "Commit edit" },
  { action: "Escape", result: "Revert edit" },
]

export const HOW_IT_WORKS_GESTURES: ApiGestureRow[] = [
  {
    action: "Drag",
    result: "Scrub by step. Alt for fine steps, Shift for coarse.",
  },
  {
    action: "Click",
    result: "Edit mode shows the full value, not the clipped display.",
  },
  {
    action: "Up/Down arrows",
    result: "Nudge by step. Alt for fine steps, Shift for coarse.",
  },
  { action: "Home / End", result: "Jump to min or max" },
  { action: "Enter / Escape", result: "Commit or revert edit" },
  {
    action: "Double-click logo",
    result: "Reset to defaultResetValue when logo mode is on",
  },
]

export type ApiReferenceSection = {
  id: string
  title: string
  rows: ApiReferenceRow[]
}

export const API_REFERENCE_SECTIONS: ApiReferenceSection[] = [
  { id: "props", title: "ScrubNumberField", rows: SCRUB_NUMBER_FIELD_PROPS },
  { id: "calligraph", title: "Calligraph", rows: CALLIGRAPH_SETTINGS_ROWS },
  { id: "input", title: "Input", rows: INPUT_SETTINGS_ROWS },
  { id: "logo", title: "Logo handle", rows: LOGO_SETTINGS_ROWS },
]
