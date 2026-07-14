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
    description: "Fires on every change (scrub, keys, wheel)",
  },
  {
    name: "onValueCommit",
    type: "(n: number) => void",
    description: "Fires on blur/Enter after edit, or when scrub ends",
  },
  {
    name: "defaultResetValue",
    type: "number",
    description: "Target for double-click / fine-modifier+click reset",
  },
  { name: "min", type: "number", description: "Clamp lower bound" },
  { name: "max", type: "number", description: "Clamp upper bound" },
  { name: "step", type: "number", description: "Quantization increment", defaultValue: "1" },
  {
    name: "shiftStep",
    type: "number",
    description: "Large step for Shift / Page Up/Down",
  },
  {
    name: "format",
    type: "FormatSettings",
    description: "Sign prefix (`alwaysShowSign`)",
  },
  {
    name: "formatValue",
    type: "(n: number) => string",
    description: "Custom display formatter",
  },
  {
    name: "scrub",
    type: "ScrubSettings",
    description: "Direction, sensitivity, fine/coarse step, wheel, feedback",
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
  { name: "logo", type: "LogoSettings", description: "Handle icon scrub mode" },
  {
    name: "grouped",
    type: "boolean",
    description: "Borderless control for use inside InputGroup",
  },
  { name: "label", type: "string", description: "Optional side label" },
  { name: "disabled", type: "boolean", description: "Disable interaction" },
]

export const SCRUB_SETTINGS_ROWS: ApiReferenceRow[] = [
  {
    name: "step",
    type: "number",
    defaultValue: "1",
    description: "Normal increment (drag, wheel, Up/Down arrows)",
  },
  {
    name: "scrub.fineStep",
    type: "number",
    defaultValue: "step / 10",
    description: "Fine increment (modifier + drag / wheel / Up/Down arrows)",
  },
  {
    name: "scrub.fineModifier",
    type: '"shift" | "alt" | "meta"',
    defaultValue: '"alt"',
    description: "Key for fine step",
  },
  {
    name: "scrub.shiftStep",
    type: "number",
    defaultValue: "10",
    description: "Coarse increment (modifier + drag / wheel / Up/Down arrows)",
  },
  {
    name: "scrub.coarseModifier",
    type: '"shift" | "alt" | "meta"',
    defaultValue: '"shift"',
    description: "Key for coarse step",
  },
  {
    name: "scrub.sensitivity",
    type: "number",
    defaultValue: "1",
    description: "Pixels per step unit while dragging",
  },
  {
    name: "scrub.threshold",
    type: "number",
    defaultValue: "3",
    description: "Pointer movement (px) before scrub starts",
  },
  {
    name: "scrub.wheelEnabled",
    type: "boolean",
    defaultValue: "false",
    description: "Enable wheel scroll",
  },
  {
    name: "scrub.wheelSensitivity",
    type: "number",
    defaultValue: "20",
    description: "Accumulated wheel delta (px) per step when wheel is enabled",
  },
  {
    name: "scrub.direction",
    type: '"horizontal" | "vertical"',
    defaultValue: '"horizontal"',
    description: "Scrub axis while dragging",
  },
  {
    name: "scrub.boundFeedback",
    type: '"none" | "shake" | "borderPulse"',
    defaultValue: '"none"',
    description: "Feedback when value hits min or max",
  },
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

export const FORMAT_SETTINGS_ROWS: ApiReferenceRow[] = [
  {
    name: "format.alwaysShowSign",
    type: "boolean",
    defaultValue: "false",
    description: "Always prefix positive values with +",
  },
]

export const LOGO_SETTINGS_ROWS: ApiReferenceRow[] = [
  {
    name: "logo.enabled",
    type: "boolean",
    defaultValue: "false",
    description: "Show handle icon for scrub surface",
  },
  {
    name: "logo.icon",
    type: "LogoIconName",
    defaultValue: '"GripVertical"',
    description: "Lucide icon name for the handle",
  },
]

export const SCRUB_GESTURES: ApiGestureRow[] = [
  { action: "Drag field", result: "Scrub by step" },
  {
    action: "Fine modifier + drag / Up/Down / wheel",
    result: "Fine step",
  },
  {
    action: "Coarse modifier + drag / Up/Down / Page Up-Down / wheel",
    result: "Coarse step",
  },
  {
    action: "Wheel",
    result: "Stepped scroll using the same step ladder (with fine/coarse modifiers)",
  },
  { action: "Click field", result: "Enter edit mode" },
  { action: "Home / End", result: "Jump to min / max" },
  {
    action: "Double-click / fine-modifier+click",
    result: "Reset to defaultResetValue",
  },
  { action: "Enter", result: "Commit edit" },
  { action: "Escape", result: "Revert edit" },
]

export const HOW_IT_WORKS_GESTURES: ApiGestureRow[] = [
  {
    action: "Drag",
    result: "Scrub by step — hold Alt (fine) or Shift (coarse) for smaller or larger steps",
  },
  {
    action: "Click",
    result: "Edit with full precision — never a clipped preview",
  },
  {
    action: "Arrow keys",
    result: "Nudge by step — Shift and Alt modifiers apply coarse and fine steps",
  },
  { action: "Home / End", result: "Jump to min or max" },
  { action: "Enter / Escape", result: "Commit or revert edit" },
  {
    action: "Double-click",
    result: "Reset to defaultResetValue when set",
  },
]

export const HEADLESS_USAGE_CODE = `import {
  ScrubNumberInput,
  useNumberScrub,
} from "@/components/ui/scrub-number-input"

const scrub = useNumberScrub({
  value,
  onChange: setValue,
  onValueCommit: handleCommit,
  min: 0,
  max: 100,
  step: 0.1,
})

return <ScrubNumberInput aria-label="Amount" scrub={scrub} />`

export type ApiReferenceSection = {
  id: string
  title: string
  rows: ApiReferenceRow[]
}

export const API_REFERENCE_SECTIONS: ApiReferenceSection[] = [
  { id: "props", title: "ScrubNumberField", rows: SCRUB_NUMBER_FIELD_PROPS },
  { id: "scrub", title: "Scrub settings", rows: SCRUB_SETTINGS_ROWS },
  { id: "calligraph", title: "Calligraph", rows: CALLIGRAPH_SETTINGS_ROWS },
  { id: "input", title: "Input", rows: INPUT_SETTINGS_ROWS },
  { id: "format", title: "Format", rows: FORMAT_SETTINGS_ROWS },
  { id: "logo", title: "Logo handle", rows: LOGO_SETTINGS_ROWS },
]
