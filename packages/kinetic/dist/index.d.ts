import * as react0 from "react";
import { ComponentProps } from "react";
import { CoarseModifier, FineModifier, clampNumber } from "@/lib/scrub-number-math";

//#region ../../components/ui/scrub-number-input.d.ts
type InputSettings = {
  selectOnEdit: boolean;
};
declare const DEFAULT_INPUT_SETTINGS: InputSettings;
type BoundFeedbackMode = "none" | "shake" | "borderPulse";
declare const BOUND_FEEDBACK_MODES: readonly ["none", "shake", "borderPulse"];
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
  boundFeedback: BoundFeedbackMode;
  fineStep?: number;
  fineModifier?: FineModifier;
  coarseModifier?: CoarseModifier;
  wheelSensitivity?: number;
};
type CalligraphSettings = {
  variant: "number" | "slots";
  animation: "default" | "smooth" | "snappy" | "bouncy";
  stagger: number;
  autoSize: boolean;
};
declare const DEFAULT_CALLIGRAPH_SETTINGS: CalligraphSettings;
declare const LOGO_ICON_OPTIONS: readonly ["GripVertical", "GripHorizontal", "Move", "MoveHorizontal", "MoveVertical", "Percent"];
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
  calligraph: CalligraphSettings;
  input: InputSettings;
  logo: LogoSettings;
  min?: number;
  max?: number;
  step?: number;
  smallStep?: number;
  largeStep?: number;
  direction?: "horizontal" | "vertical";
  pixelSensitivity?: number;
  allowWheelScrub?: boolean;
  boundFeedback?: BoundFeedbackMode;
  format?: Intl.NumberFormatOptions;
};
declare const DEFAULT_SCRUB_FIELD_SETTINGS: ScrubFieldSettings;
declare function normalizeScrubFieldSettings(settings: ScrubFieldSettings): ScrubFieldSettings;
declare function getScrubCursorClass(scrub: Pick<ScrubSettings, "direction">, atBound?: "min" | "max" | null, bounds?: {
  min?: number;
  max?: number;
}): "cursor-not-allowed" | "cursor-n-resize" | "cursor-s-resize" | "cursor-ns-resize" | "cursor-e-resize" | "cursor-w-resize" | "cursor-ew-resize";
type ScrubNumberFieldProps = Omit<ComponentProps<"input">, "onChange" | "type" | "value" | "defaultValue" | "size" | "format"> & {
  allowWheelScrub?: boolean;
  boundFeedback?: BoundFeedbackMode;
  calligraph?: CalligraphSettings;
  defaultResetValue?: number;
  direction?: "horizontal" | "vertical";
  format?: Intl.NumberFormatOptions;
  formatValue?: (value: number) => string;
  grouped?: boolean;
  inputSettings?: InputSettings;
  label?: string;
  labelClassName?: string;
  largeStep?: number;
  logo?: LogoSettings;
  onValueChange?: (value: number) => void;
  onValueCommitted?: (value: number) => void;
  pixelSensitivity?: number;
  smallStep?: number;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  inputClassName?: string;
};
declare function ScrubNumberField({
  allowWheelScrub,
  boundFeedback,
  calligraph,
  className,
  defaultResetValue,
  defaultValue,
  direction,
  disabled,
  format,
  formatValue: formatValueProp,
  grouped,
  inputSettings,
  label,
  labelClassName,
  largeStep,
  logo,
  max,
  min,
  onValueChange,
  onValueCommitted,
  pixelSensitivity,
  smallStep,
  step,
  value: valueProp,
  inputClassName,
  ...props
}: ScrubNumberFieldProps): react0.JSX.Element;
//#endregion
export { BOUND_FEEDBACK_MODES, type BoundFeedbackMode, type BoundFeedbackSource, type BoundFeedbackState, type CalligraphSettings, DEFAULT_CALLIGRAPH_SETTINGS, DEFAULT_INPUT_SETTINGS, DEFAULT_LOGO_SETTINGS, DEFAULT_SCRUB_FIELD_SETTINGS, type InputSettings, LOGO_ICON_OPTIONS, type LogoSettings, type ScrubFieldSettings, ScrubLogoIcon, ScrubNumberField, type ScrubNumberFieldProps, clampNumber, getScrubCursorClass, normalizeScrubFieldSettings };