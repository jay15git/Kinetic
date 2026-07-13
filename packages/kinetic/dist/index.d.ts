import * as react0 from "react";
import { ChangeEvent, ComponentProps, KeyboardEvent, PointerEvent } from "react";
import { CoarseModifier as CoarseModifier$1, FineModifier as FineModifier$1 } from "@/lib/scrub-number-math";

//#region ../../components/ui/scrub-number-input.d.ts
type InputSettings = {
  align: "left" | "center" | "right";
  /** When false (default), edit mode accepts only numeric characters. */
  allowTextInput: boolean;
  selectOnEdit: boolean;
};
declare const DEFAULT_INPUT_SETTINGS: InputSettings;
type FormatSettings = {
  alwaysShowSign: boolean;
  clampDisplay: boolean;
};
declare const DEFAULT_FORMAT_SETTINGS: FormatSettings;
type BoundFeedbackMode = "none" | "rubberBand" | "shake" | "borderPulse" | "combo";
declare const BOUND_FEEDBACK_MODES: readonly ["none", "rubberBand", "shake", "borderPulse", "combo"];
type BoundFeedbackSource = "wheel" | "key" | "scrub";
type BoundFeedbackState = {
  edge: "min" | "max";
  overflow: number;
  source: BoundFeedbackSource;
  tick: number;
};
type ScrubSettings = {
  direction: "horizontal" | "vertical";
  shiftStep: number;
  sensitivity: number;
  threshold?: number;
  wheelEnabled: boolean;
  labelScrubEnabled: boolean;
  boundFeedback: BoundFeedbackMode;
  /** Step used while the fine modifier is held. Defaults to step / 10. */
  fineStep?: number;
  /**
   * Key held for fine step.
   */
  fineModifier?: FineModifier$1;
  /**
   * Key held for coarse step.
   */
  coarseModifier?: CoarseModifier$1;
  /** Accumulated wheel delta (px) required before one step fires. */
  wheelSensitivity?: number;
};
declare const DEFAULT_SCRUB_SETTINGS: ScrubSettings;
type CalligraphSettings = {
  variant: "number" | "slots";
  animation: "default" | "smooth" | "snappy" | "bouncy";
  stagger: number;
  autoSize: boolean;
};
declare const DEFAULT_CALLIGRAPH_SETTINGS: CalligraphSettings;
declare const LOGO_ICON_OPTIONS: readonly ["GripVertical", "GripHorizontal", "Move", "Hash", "CircleDot"];
type LogoIconName = (typeof LOGO_ICON_OPTIONS)[number];
type LogoSettings = {
  enabled: boolean;
  icon: LogoIconName;
};
declare const DEFAULT_LOGO_SETTINGS: LogoSettings;
declare function ScrubLogoIcon({
  className,
  name
}: {
  className?: string;
  name: LogoIconName;
}): react0.JSX.Element;
type ScrubFieldSettings = {
  scrub: ScrubSettings;
  calligraph: CalligraphSettings;
  input: InputSettings;
  format: FormatSettings;
  logo: LogoSettings;
  min?: number;
  max?: number;
  step?: number;
};
declare const DEFAULT_SCRUB_FIELD_SETTINGS: ScrubFieldSettings;
declare function normalizeScrubFieldSettings(settings: ScrubFieldSettings): ScrubFieldSettings;
declare function getScrubCursorClass(scrub: Pick<ScrubSettings, "direction">, atBound?: "min" | "max" | null, bounds?: {
  min?: number;
  max?: number;
}): "cursor-not-allowed" | "cursor-n-resize" | "cursor-s-resize" | "cursor-ns-resize" | "cursor-e-resize" | "cursor-w-resize" | "cursor-ew-resize";
type EditPointerPoint = {
  clientX: number;
  clientY: number;
};
type UseNumberScrubOptions = {
  disabled?: boolean;
  format?: FormatSettings;
  formatValue?: (value: number) => string;
  logo?: LogoSettings;
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  onValueCommit?: (value: number) => void;
  defaultResetValue?: number;
  scrub?: ScrubSettings;
  allowTextInput?: boolean;
  selectOnEdit?: boolean;
  shiftStep?: number;
  step?: number;
  value: number;
};
type ScrubState = ReturnType<typeof useNumberScrub>;
declare function useNumberScrub({
  disabled,
  format,
  formatValue,
  logo,
  max,
  min,
  onChange,
  onValueCommit,
  defaultResetValue,
  scrub,
  allowTextInput,
  selectOnEdit,
  shiftStep,
  step,
  value
}: UseNumberScrubOptions): {
  activateEdit: (point?: EditPointerPoint) => void;
  atBound: any;
  boundFeedback: BoundFeedbackState | null;
  canScrub: boolean;
  clearBoundFeedback: () => void;
  displaySurfaceRef: react0.RefObject<HTMLDivElement | null>;
  displayValue: any;
  editing: boolean;
  handleDisplayKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  inputProps: {
    "aria-invalid": true | undefined;
    "data-slot": string;
    inputMode: "text" | "numeric";
    onBlur: () => void;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onFocus: () => void;
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
    ref: react0.RefObject<HTMLInputElement | null>;
    type: "text";
    value: any;
    "aria-valuemax": number | undefined;
    "aria-valuemin": number | undefined;
    "aria-valuenow": number;
    "aria-valuetext": string | undefined;
    role: "spinbutton";
  };
  inputRef: react0.RefObject<HTMLInputElement | null>;
  interactingRef: react0.RefObject<boolean>;
  interactionEpoch: number;
  invalid: boolean;
  labelScrubHandlers: {
    onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
    onPointerDown: (event: PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  };
  logoScrubHandlers: {
    onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
    onPointerDown: (event: PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  };
  logoScrollEnabled: boolean;
  nudgeTrend: 0 | 1 | -1;
  onDisplayBlur: () => void;
  onDisplayFocus: () => void;
  scrubSurfaceHandlers: {
    onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
    onPointerDown: (event: PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  };
  spinbuttonProps: {
    "aria-valuemax": number | undefined;
    "aria-valuemin": number | undefined;
    "aria-valuenow": number;
    "aria-valuetext": string | undefined;
    role: "spinbutton";
  };
  surfaceRef: react0.RefObject<HTMLDivElement | null>;
};
declare function ScrubNumberInput({
  calligraph,
  className,
  disabled,
  grouped,
  inputClassName,
  inputSettings,
  logo,
  max,
  min,
  scrub,
  scrubSettings,
  ...props
}: {
  calligraph?: CalligraphSettings;
  className?: string;
  disabled?: boolean;
  grouped?: boolean;
  inputClassName?: string;
  inputSettings?: InputSettings;
  logo?: LogoSettings;
  max?: number;
  min?: number;
  scrub: ScrubState;
  scrubSettings?: ScrubSettings;
} & Omit<ComponentProps<"input">, "onChange" | "type" | "value" | "size">): react0.JSX.Element;
type ScrubNumberFieldProps = Omit<ComponentProps<"input">, "onChange" | "type" | "value" | "defaultValue" | "size"> & {
  calligraph?: CalligraphSettings;
  format?: FormatSettings;
  formatValue?: (value: number) => string;
  inputSettings?: InputSettings;
  label?: string;
  labelClassName?: string;
  logo?: LogoSettings;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number) => void;
  scrub?: ScrubSettings;
  shiftStep?: number;
  grouped?: boolean;
  value?: number;
  defaultValue?: number;
  defaultResetValue?: number;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  inputClassName?: string;
};
declare function ScrubNumberField({
  calligraph,
  className,
  defaultResetValue,
  defaultValue,
  disabled,
  format,
  formatValue,
  grouped,
  inputSettings,
  label,
  labelClassName,
  logo,
  max,
  min,
  onValueChange,
  onValueCommit,
  scrub: scrubSettings,
  shiftStep,
  step,
  value: valueProp,
  inputClassName,
  ...props
}: ScrubNumberFieldProps): react0.JSX.Element;
//#endregion
//#region ../../lib/scrub-number-math.d.ts
type DisplayFormat = {
  alwaysShowSign: boolean;
  clampDisplay: boolean;
};
type ResolveActiveStepOptions = {
  step: number;
  shiftStep: number;
  fineStep: number;
  coarse?: boolean;
  fine?: boolean;
};
type ModifierKey = "shift" | "alt" | "meta";
type FineModifier = "shift" | "alt" | "meta";
type CoarseModifier = "shift" | "alt" | "meta";
type ModifierKeys = {
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  getModifierState?: (key: string) => boolean;
};
declare function isMacPlatform(): boolean;
declare function isModifierKeyPressed(event: ModifierKeys, key: ModifierKey): boolean;
declare function resolveFineModifierKey(modifier?: FineModifier): ModifierKey;
declare function resolveCoarseModifierKey(modifier?: CoarseModifier): ModifierKey;
declare function isFineModifierPressed(event: ModifierKeys, modifier?: FineModifier): boolean;
declare function isCoarseModifierPressed(event: ModifierKeys, modifier?: CoarseModifier): boolean;
declare function getFineModifierLabel(modifier?: FineModifier): "Shift" | "Alt" | "Cmd";
declare function getCoarseModifierLabel(modifier?: CoarseModifier): "Shift" | "Alt" | "Cmd";
type ScrubStepModifiers = {
  coarse: boolean;
  fine: boolean;
};
declare function toModifierKeys(event: {
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  getModifierState?: (key: string) => boolean;
}): ModifierKeys;
declare function resolveScrubStepModifiers(event: ModifierKeys, options?: {
  fineModifier?: FineModifier;
  coarseModifier?: CoarseModifier;
}): ScrubStepModifiers;
declare function clampNumber(value: number, min?: number, max?: number): number;
declare function getBoundEdge(current: number, attempted: number, min?: number, max?: number): "min" | "max" | null;
declare function getAtBound(value: number, min?: number, max?: number): "min" | "max" | null;
declare function boundOverflow(attempted: number, edge: "min" | "max", min?: number, max?: number): number;
declare function quantizeNumber(value: number, step: number): number;
declare function getDecimalPlaces(step: number): number;
declare function formatMinimalDisplayValue(value: number): string;
declare function countDraftDecimalPlaces(draft: string): number;
declare function resolveDisplayDecimalPlaces(previousDraft: string, userDecimalPlaces?: number | null, activeStep?: number): number | null;
/** Minimal display by default; decimals only after the user typed them. */
declare function formatDisplayValue(value: number, format: Pick<DisplayFormat, "alwaysShowSign">, userDecimalPlaces?: number | null): string;
declare function resolveActiveStep(options: ResolveActiveStepOptions): number;
declare function getValueDecimalPlaces(value: number): number;
declare function stepFromDecimalPlaces(decimals: number): number;
declare function resolveQuantizeStep(options: {
  step: number;
  fineStep: number;
  fine?: boolean;
  currentValue: number;
  userDecimalPlaces?: number | null;
}): number;
declare function applyStepDelta(current: number, delta: number, options: {
  step: number;
  fineStep: number;
  fine?: boolean;
  userDecimalPlaces?: number | null;
}): number;
/** Keeps the visible draft string when entering edit if it still matches the numeric value. */
declare function preserveDisplayDraft(currentDraft: string, value: number, fallback: string): string;
declare function getScrubPointerDelta(event: {
  clientX: number;
  clientY: number;
}, startX: number, startY: number, direction: "horizontal" | "vertical"): number;
declare function hasExceededScrubThreshold(event: {
  clientX: number;
  clientY: number;
}, startX: number, startY: number, direction: "horizontal" | "vertical", threshold?: number): boolean;
declare function resolveFineStep(step: number, fineStep?: number): number;
/** Keeps only characters valid while typing a numeric draft (+, -, digits, one dot). */
declare function sanitizeNumericDraft(value: string): string;
//#endregion
export { BOUND_FEEDBACK_MODES, type BoundFeedbackMode, type BoundFeedbackSource, type BoundFeedbackState, type CalligraphSettings, type CoarseModifier, DEFAULT_CALLIGRAPH_SETTINGS, DEFAULT_FORMAT_SETTINGS, DEFAULT_INPUT_SETTINGS, DEFAULT_LOGO_SETTINGS, DEFAULT_SCRUB_FIELD_SETTINGS, DEFAULT_SCRUB_SETTINGS, type DisplayFormat, type FineModifier, type FormatSettings, type InputSettings, LOGO_ICON_OPTIONS, type LogoSettings, type ModifierKey, type ScrubFieldSettings, ScrubLogoIcon, ScrubNumberField, type ScrubNumberFieldProps, ScrubNumberInput, type ScrubSettings, type ScrubState, applyStepDelta, boundOverflow, clampNumber, countDraftDecimalPlaces, formatDisplayValue, formatMinimalDisplayValue, getAtBound, getBoundEdge, getCoarseModifierLabel, getDecimalPlaces, getFineModifierLabel, getScrubCursorClass, getScrubPointerDelta, getValueDecimalPlaces, hasExceededScrubThreshold, isCoarseModifierPressed, isFineModifierPressed, isMacPlatform, isModifierKeyPressed, normalizeScrubFieldSettings, preserveDisplayDraft, quantizeNumber, resolveActiveStep, resolveCoarseModifierKey, resolveDisplayDecimalPlaces, resolveFineModifierKey, resolveFineStep, resolveQuantizeStep, resolveScrubStepModifiers, sanitizeNumericDraft, stepFromDecimalPlaces, toModifierKeys, useNumberScrub };