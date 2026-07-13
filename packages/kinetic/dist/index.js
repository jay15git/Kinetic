import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Calligraph } from "calligraph";
import { CircleDot, GripHorizontal, GripVertical, Hash, Move } from "lucide-react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { useControllableState } from "@/hooks/use-controllable-state";
import { applyStepDelta as applyStepDelta$1, boundOverflow as boundOverflow$1, clampNumber as clampNumber$1, consumeWheelDelta, countDraftDecimalPlaces as countDraftDecimalPlaces$1, formatDisplayValue as formatDisplayValue$1, getAtBound as getAtBound$1, getBoundEdge as getBoundEdge$1, getScrubPointerDelta as getScrubPointerDelta$1, hasExceededScrubThreshold as hasExceededScrubThreshold$1, isFineModifierPressed as isFineModifierPressed$1, normalizeCoarseModifier, normalizeFineModifier, normalizeWheelDelta, preserveDisplayDraft as preserveDisplayDraft$1, quantizeNumber as quantizeNumber$1, resolveActiveStep as resolveActiveStep$1, resolveDisplayDecimalPlaces as resolveDisplayDecimalPlaces$1, resolveExclusiveModifiers, resolveFineStep as resolveFineStep$1, resolveQuantizeStep as resolveQuantizeStep$1, resolveScrubStepModifiers as resolveScrubStepModifiers$1, sanitizeNumericDraft as sanitizeNumericDraft$1, toModifierKeys as toModifierKeys$1 } from "@/lib/scrub-number-math";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import { cva } from "class-variance-authority";
import { jsx, jsxs } from "react/jsx-runtime";

//#region ../../components/ui/scrub-number-input.tsx
const SCRUB_NUMBER_FIELD_CLASS = "tabular-nums";
const SCRUB_NUMBER_SPINNER_HIDE_CLASS = "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
const scrubFieldVariants = cva("w-full min-w-0 rounded-[20px] border border-input bg-[var(--input-fill)] py-1 text-base text-foreground transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-7 px-2 text-[0.8rem]", {
	variants: { align: {
		left: "text-left",
		center: "text-center",
		right: "text-right"
	} },
	defaultVariants: { align: "center" }
});
const DEFAULT_INPUT_SETTINGS = {
	align: "center",
	allowTextInput: false,
	selectOnEdit: true
};
const DEFAULT_FORMAT_SETTINGS = {
	alwaysShowSign: false,
	clampDisplay: false
};
const BOUND_FEEDBACK_MODES = [
	"none",
	"rubberBand",
	"shake",
	"borderPulse",
	"combo"
];
const DEFAULT_SCRUB_SETTINGS = {
	direction: "horizontal",
	shiftStep: 10,
	sensitivity: 1,
	threshold: 3,
	wheelEnabled: false,
	labelScrubEnabled: false,
	boundFeedback: "none",
	fineModifier: "alt",
	coarseModifier: "shift",
	wheelSensitivity: 20
};
const DEFAULT_CALLIGRAPH_SETTINGS = {
	variant: "number",
	animation: "snappy",
	stagger: .02,
	autoSize: false
};
const KEY_REPEAT_KEYS = new Set([
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"PageUp",
	"PageDown"
]);
const LOGO_ICON_OPTIONS = [
	"GripVertical",
	"GripHorizontal",
	"Move",
	"Hash",
	"CircleDot"
];
const DEFAULT_LOGO_SETTINGS = {
	enabled: false,
	icon: "GripVertical"
};
const LOGO_ICONS = {
	GripVertical,
	GripHorizontal,
	Move,
	Hash,
	CircleDot
};
function ScrubLogoIcon({ className, name }) {
	const Icon = LOGO_ICONS[name];
	return /* @__PURE__ */ jsx(Icon, {
		"aria-hidden": true,
		className
	});
}
const DEFAULT_SCRUB_FIELD_SETTINGS = {
	scrub: DEFAULT_SCRUB_SETTINGS,
	calligraph: DEFAULT_CALLIGRAPH_SETTINGS,
	input: DEFAULT_INPUT_SETTINGS,
	format: DEFAULT_FORMAT_SETTINGS,
	logo: DEFAULT_LOGO_SETTINGS
};
function normalizeScrubFieldSettings(settings) {
	let min = typeof settings.min === "number" && Number.isFinite(settings.min) ? settings.min : void 0;
	let max = typeof settings.max === "number" && Number.isFinite(settings.max) ? settings.max : void 0;
	if (min != null && max != null && min > max) [min, max] = [max, min];
	const resolvedStep = typeof settings.step === "number" && Number.isFinite(settings.step) ? settings.step : 1;
	const scrub = {
		...DEFAULT_SCRUB_SETTINGS,
		...settings.scrub
	};
	let fineStep = scrub.fineStep;
	if (fineStep != null && Number.isFinite(fineStep) && fineStep > 0) {
		if (fineStep >= resolvedStep) fineStep = resolveFineStep$1(resolvedStep);
	}
	let shiftStep = scrub.shiftStep;
	if (!Number.isFinite(shiftStep) || shiftStep < resolvedStep) shiftStep = Math.max(resolvedStep, DEFAULT_SCRUB_SETTINGS.shiftStep);
	let threshold = scrub.threshold ?? DEFAULT_SCRUB_SETTINGS.threshold ?? 3;
	threshold = clampNumber$1(threshold, 1, 20);
	const exclusiveModifiers = resolveExclusiveModifiers(normalizeFineModifier(scrub.fineModifier, DEFAULT_SCRUB_SETTINGS.fineModifier), normalizeCoarseModifier(scrub.coarseModifier, DEFAULT_SCRUB_SETTINGS.coarseModifier));
	let wheelSensitivity = scrub.wheelSensitivity ?? DEFAULT_SCRUB_SETTINGS.wheelSensitivity ?? 20;
	wheelSensitivity = clampNumber$1(wheelSensitivity, 1, 200);
	return {
		scrub: {
			...scrub,
			fineStep,
			fineModifier: exclusiveModifiers.fine,
			coarseModifier: exclusiveModifiers.coarse,
			shiftStep,
			threshold,
			wheelSensitivity,
			boundFeedback: scrub.boundFeedback === "rubberBand" ? "none" : scrub.boundFeedback
		},
		calligraph: {
			...DEFAULT_CALLIGRAPH_SETTINGS,
			...settings.calligraph
		},
		input: {
			...DEFAULT_INPUT_SETTINGS,
			...settings.input
		},
		format: {
			alwaysShowSign: Boolean(settings.format?.alwaysShowSign),
			clampDisplay: Boolean(settings.format?.clampDisplay)
		},
		logo: {
			...DEFAULT_LOGO_SETTINGS,
			...settings.logo
		},
		min,
		max,
		step: typeof settings.step === "number" && Number.isFinite(settings.step) ? settings.step : void 0
	};
}
function getScrubCursorClass(scrub, atBound = null, bounds) {
	if (bounds?.min != null && bounds?.max != null && bounds.min === bounds.max) return "cursor-not-allowed";
	if (scrub.direction === "vertical") {
		if (atBound === "min") return "cursor-n-resize";
		if (atBound === "max") return "cursor-s-resize";
		return "cursor-ns-resize";
	}
	if (atBound === "min") return "cursor-e-resize";
	if (atBound === "max") return "cursor-w-resize";
	return "cursor-ew-resize";
}
function approximateCaretFromX(input, clientX) {
	const text = input.value;
	const rect = input.getBoundingClientRect();
	const style = getComputedStyle(input);
	const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
	const paddingRight = Number.parseFloat(style.paddingRight) || 0;
	const contentWidth = rect.width - paddingLeft - paddingRight;
	const ctx = document.createElement("canvas").getContext("2d");
	if (!ctx) {
		input.setSelectionRange(text.length, text.length);
		return;
	}
	ctx.font = `${style.fontStyle} ${style.fontVariant} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
	ctx.letterSpacing = style.letterSpacing;
	const textWidth = ctx.measureText(text).width;
	let textStart = paddingLeft;
	if (style.textAlign === "center") textStart += Math.max(0, (contentWidth - textWidth) / 2);
	else if (style.textAlign === "right") textStart += Math.max(0, contentWidth - textWidth);
	const relativeX = clientX - rect.left - textStart;
	if (relativeX <= 0) {
		input.setSelectionRange(0, 0);
		return;
	}
	if (relativeX >= textWidth) {
		input.setSelectionRange(text.length, text.length);
		return;
	}
	let offset = 0;
	for (let index = 1; index <= text.length; index++) {
		if (ctx.measureText(text.slice(0, index)).width >= relativeX) {
			const previousWidth = index > 1 ? ctx.measureText(text.slice(0, index - 1)).width : 0;
			const characterWidth = ctx.measureText(text[index - 1] ?? "").width;
			offset = relativeX - previousWidth < characterWidth / 2 ? index - 1 : index;
			break;
		}
		offset = index;
	}
	input.setSelectionRange(offset, offset);
}
function placeCaretAtPoint(input, clientX, clientY) {
	const doc = input.ownerDocument;
	if (typeof doc.caretRangeFromPoint === "function") {
		const range = doc.caretRangeFromPoint(clientX, clientY);
		if (range && input.contains(range.startContainer)) {
			const offset = Math.min(range.startOffset, input.value.length);
			input.setSelectionRange(offset, offset);
			return true;
		}
	}
	if (typeof doc.caretPositionFromPoint === "function") {
		const position = doc.caretPositionFromPoint(clientX, clientY);
		if (position && (input === position.offsetNode || input.contains(position.offsetNode))) {
			const offset = Math.min(position.offset, input.value.length);
			input.setSelectionRange(offset, offset);
			return true;
		}
	}
	approximateCaretFromX(input, clientX);
	return true;
}
function focusInputForEdit(input, selectOnEdit, point) {
	input.focus({ preventScroll: true });
	if (selectOnEdit) {
		input.select();
		return;
	}
	if (point) {
		placeCaretAtPoint(input, point.clientX, point.clientY);
		return;
	}
	const length = input.value.length;
	input.setSelectionRange(length, length);
}
const RUBBER_BAND_MAX_OFFSET = 6;
const SCRUB_BOUND_SHAKE_MS = 280;
const SCRUB_BOUND_REVERT_HOLD_MS = 600;
function restartBoundShake(targets) {
	for (const element of targets) {
		element.classList.remove("is-shaking");
		element.offsetWidth;
		element.classList.add("is-shaking");
	}
}
function clearBoundShake(targets) {
	for (const element of targets) element.classList.remove("is-shaking");
}
function resolveActiveFeedbackMode(mode, source) {
	if (mode === "combo") return source === "scrub" ? "rubberBand" : "shake";
	return mode;
}
function ScrubBoundFeedback({ atBound, boundFeedback, children, className, direction, mode, onFeedbackComplete }) {
	const shouldReduceMotion = useReducedMotion();
	const offsetX = useMotionValue(0);
	const offsetY = useMotionValue(0);
	const wrapRef = useRef(null);
	const [boundHit, setBoundHit] = useState(null);
	const [boundError, setBoundError] = useState(false);
	const scrubbingAtEdgeRef = useRef(false);
	useEffect(() => {
		if (!boundFeedback || mode === "none") {
			scrubbingAtEdgeRef.current = false;
			offsetX.set(0);
			offsetY.set(0);
			setBoundError(false);
			return;
		}
		const activeMode = resolveActiveFeedbackMode(mode, boundFeedback.source);
		const sign = boundFeedback.edge === "min" ? -1 : 1;
		const axis = direction === "vertical" ? offsetY : offsetX;
		const otherAxis = direction === "vertical" ? offsetX : offsetY;
		const shakeTargets = wrapRef.current ? Array.from(wrapRef.current.querySelectorAll(".scrub-bound-field")) : [];
		if (activeMode === "rubberBand") {
			const offset = sign * Math.min(RUBBER_BAND_MAX_OFFSET, 2 + Math.sqrt(boundFeedback.overflow) * 1.25);
			if (boundFeedback.source === "scrub") {
				scrubbingAtEdgeRef.current = true;
				axis.set(shouldReduceMotion ? 0 : offset);
				otherAxis.set(0);
				return;
			}
			scrubbingAtEdgeRef.current = false;
			if (shouldReduceMotion) {
				axis.set(0);
				otherAxis.set(0);
				onFeedbackComplete();
				return;
			}
			const controls = animate(axis, [offset, 0], {
				...spring.fast,
				onComplete: onFeedbackComplete
			});
			return () => {
				controls.stop();
			};
		}
		scrubbingAtEdgeRef.current = false;
		axis.set(0);
		otherAxis.set(0);
		if (activeMode === "shake") {
			setBoundError(true);
			if (!shouldReduceMotion && shakeTargets.length > 0) restartBoundShake(shakeTargets);
			const completeTimer = window.setTimeout(() => {
				onFeedbackComplete();
			}, shouldReduceMotion ? 0 : SCRUB_BOUND_SHAKE_MS);
			const revertTimer = window.setTimeout(() => {
				setBoundError(false);
				clearBoundShake(shakeTargets);
			}, shouldReduceMotion ? 0 : SCRUB_BOUND_SHAKE_MS + SCRUB_BOUND_REVERT_HOLD_MS);
			return () => {
				window.clearTimeout(completeTimer);
				window.clearTimeout(revertTimer);
			};
		}
		if (activeMode === "borderPulse") {
			setBoundHit(boundFeedback.edge);
			const timeout = window.setTimeout(() => {
				setBoundHit(null);
				onFeedbackComplete();
			}, shouldReduceMotion ? 0 : 250);
			return () => {
				window.clearTimeout(timeout);
			};
		}
	}, [
		boundFeedback,
		direction,
		mode,
		offsetX,
		offsetY,
		onFeedbackComplete,
		shouldReduceMotion
	]);
	const showPassiveEdge = mode === "combo" ? atBound : null;
	return /* @__PURE__ */ jsx(motion.div, {
		className,
		style: {
			x: offsetX,
			y: offsetY
		},
		children: /* @__PURE__ */ jsx("div", {
			ref: wrapRef,
			"data-slot": "scrub-bound-feedback",
			"data-at-bound": showPassiveEdge ?? void 0,
			"data-bound-direction": direction,
			"data-bound-hit": boundHit ?? void 0,
			className: cn("scrub-bound-wrap", boundError && "is-bound-error"),
			children
		})
	});
}
function useNumberScrub({ disabled = false, format = DEFAULT_FORMAT_SETTINGS, formatValue, logo = DEFAULT_LOGO_SETTINGS, max, min, onChange, onValueCommit, defaultResetValue, scrub = DEFAULT_SCRUB_SETTINGS, allowTextInput = false, selectOnEdit = true, shiftStep, step = 1, value }) {
	const effectiveShiftStep = shiftStep ?? scrub.shiftStep;
	const fineStep = resolveFineStep$1(step, scrub.fineStep);
	const wheelSensitivity = scrub.wheelSensitivity ?? DEFAULT_SCRUB_SETTINGS.wheelSensitivity ?? 20;
	const fineModifier = normalizeFineModifier(scrub.fineModifier, DEFAULT_SCRUB_SETTINGS.fineModifier ?? "alt");
	const coarseModifier = normalizeCoarseModifier(scrub.coarseModifier, DEFAULT_SCRUB_SETTINGS.coarseModifier ?? "shift");
	const scrubThreshold = scrub.threshold ?? 3;
	const logoScrollEnabled = logo.enabled;
	const userDecimalPlacesRef = useRef(null);
	const displayDecimalPlacesRef = useRef(null);
	const wheelDeltaRef = useRef(0);
	const wheelModifierRef = useRef(null);
	const formatForDisplay = useCallback((nextValue) => {
		if (formatValue) return formatValue(nextValue);
		return formatDisplayValue$1(nextValue, format, userDecimalPlacesRef.current ?? displayDecimalPlacesRef.current);
	}, [format, formatValue]);
	const [draft, setDraft] = useState(() => formatForDisplay(value));
	const draftRef = useRef(draft);
	draftRef.current = draft;
	const [editing, setEditing] = useState(false);
	const editingRef = useRef(false);
	editingRef.current = editing;
	const [invalid, setInvalid] = useState(false);
	const [boundFeedback, setBoundFeedback] = useState(null);
	const boundFeedbackRef = useRef(boundFeedback);
	boundFeedbackRef.current = boundFeedback;
	const boundFeedbackTickRef = useRef(0);
	const boundFeedbackLatchedRef = useRef({
		max: false,
		min: false
	});
	const interactingRef = useRef(false);
	const lastCommittedValueRef = useRef(value);
	const lastNudgeDirectionRef = useRef(0);
	const [interactionEpoch, setInteractionEpoch] = useState(0);
	const lastClickRef = useRef(null);
	const inputRef = useRef(null);
	const displaySurfaceRef = useRef(null);
	const surfaceRef = useRef(null);
	const scrubRef = useRef(null);
	const scrubSessionGuardRef = useRef(null);
	const pendingEditKeyboardNudgeRef = useRef(null);
	const detachScrubSessionGuard = useCallback(() => {
		scrubSessionGuardRef.current?.();
		scrubSessionGuardRef.current = null;
	}, []);
	const notifyCommit = useCallback((committedValue) => {
		onValueCommit?.(committedValue);
	}, [onValueCommit]);
	const resetToDefault = useCallback(() => {
		if (defaultResetValue == null) return false;
		const bounded = clampNumber$1(defaultResetValue, min, max);
		onChange(bounded);
		lastCommittedValueRef.current = bounded;
		setDraft(formatForDisplay(bounded));
		notifyCommit(bounded);
		return true;
	}, [
		defaultResetValue,
		formatForDisplay,
		max,
		min,
		notifyCommit,
		onChange
	]);
	const finishInteraction = useCallback(() => {
		if (!interactingRef.current) return;
		interactingRef.current = false;
		setInteractionEpoch((epoch) => epoch + 1);
	}, []);
	useEffect(() => {
		if (interactingRef.current) return;
		const parsedDraft = Number(draftRef.current.replace(/^\+/, ""));
		if (Number.isFinite(parsedDraft) && parsedDraft !== value && lastCommittedValueRef.current !== value) {
			userDecimalPlacesRef.current = null;
			displayDecimalPlacesRef.current = null;
		}
		const nextDraft = preserveDisplayDraft$1(draftRef.current, value, formatForDisplay(value));
		displayDecimalPlacesRef.current = resolveDisplayDecimalPlaces$1(nextDraft, userDecimalPlacesRef.current);
		draftRef.current = nextDraft;
		setDraft(nextDraft);
		lastCommittedValueRef.current = value;
	}, [formatForDisplay, value]);
	useEffect(() => {
		if (min != null && value > min) boundFeedbackLatchedRef.current.min = false;
		if (max != null && value < max) boundFeedbackLatchedRef.current.max = false;
	}, [
		max,
		min,
		value
	]);
	const clearBoundFeedback = useCallback(() => {
		if (boundFeedbackRef.current === null) return;
		setBoundFeedback(null);
	}, []);
	const triggerBoundFeedback = useCallback((edge, source, attempted) => {
		if (scrub.boundFeedback === "none") return;
		const isContinuousScrubRubberBand = source === "scrub" && resolveActiveFeedbackMode(scrub.boundFeedback, source) === "rubberBand";
		if (!isContinuousScrubRubberBand && boundFeedbackLatchedRef.current[edge]) return;
		if (!isContinuousScrubRubberBand) boundFeedbackLatchedRef.current[edge] = true;
		boundFeedbackTickRef.current += 1;
		setBoundFeedback({
			edge,
			overflow: boundOverflow$1(attempted, edge, min, max),
			source,
			tick: boundFeedbackTickRef.current
		});
	}, [
		max,
		min,
		scrub.boundFeedback
	]);
	const getCurrentNumericValue = useCallback(() => {
		const current = Number(draftRef.current.replace(/^\+/, ""));
		return Number.isFinite(current) ? current : value;
	}, [value]);
	const resolveCommitQuantizeStep = useCallback((currentValue, fine = false) => resolveQuantizeStep$1({
		step,
		fineStep,
		fine,
		currentValue,
		userDecimalPlaces: userDecimalPlacesRef.current
	}), [fineStep, step]);
	const commit = useCallback((nextValue, source, quantizeStep = step, activeStep = step, direction) => {
		const current = getCurrentNumericValue();
		const attempted = quantizeNumber$1(nextValue, quantizeStep);
		const bounded = clampNumber$1(attempted, min, max);
		if (source) {
			const edge = getBoundEdge$1(current, attempted, min, max);
			if (edge) triggerBoundFeedback(edge, source, attempted);
			else if (source === "scrub" && boundFeedbackRef.current !== null) setBoundFeedback(null);
		}
		if (direction) lastNudgeDirectionRef.current = direction;
		else if (bounded !== current) lastNudgeDirectionRef.current = bounded > current ? 1 : -1;
		onChange(bounded);
		displayDecimalPlacesRef.current = resolveDisplayDecimalPlaces$1(draftRef.current, userDecimalPlacesRef.current, activeStep);
		const nextDraft = formatForDisplay(bounded);
		draftRef.current = nextDraft;
		setDraft(nextDraft);
		lastCommittedValueRef.current = bounded;
		return bounded;
	}, [
		formatForDisplay,
		getCurrentNumericValue,
		max,
		min,
		onChange,
		step,
		triggerBoundFeedback
	]);
	const getActiveStep = useCallback((modifiers) => resolveActiveStep$1({
		step,
		shiftStep: effectiveShiftStep,
		fineStep,
		coarse: modifiers.coarse,
		fine: modifiers.fine
	}), [
		effectiveShiftStep,
		fineStep,
		step
	]);
	const resetWheelAccumulator = useCallback(() => {
		wheelDeltaRef.current = 0;
		wheelModifierRef.current = null;
	}, []);
	const getStepModifiers = useCallback((event) => resolveScrubStepModifiers$1(toModifierKeys$1(event), {
		fineModifier,
		coarseModifier
	}), [coarseModifier, fineModifier]);
	const getDomStepModifiers = useCallback((event) => getStepModifiers(event), [getStepModifiers]);
	const applyDisplayNudge = useCallback((direction, modifiers, source, count = 1) => {
		if (editingRef.current) return false;
		const current = getCurrentNumericValue();
		const fine = modifiers.fine ?? false;
		const activeStep = getActiveStep({
			coarse: modifiers.coarse ?? false,
			fine
		});
		const attempted = applyStepDelta$1(current, direction * activeStep * count, {
			step,
			fineStep,
			fine,
			userDecimalPlaces: userDecimalPlacesRef.current
		});
		const bounded = clampNumber$1(attempted, min, max);
		if (bounded === current) {
			const edge = getBoundEdge$1(current, attempted, min, max);
			if (edge) triggerBoundFeedback(edge, source, attempted);
			return true;
		}
		interactingRef.current = true;
		lastNudgeDirectionRef.current = direction;
		displayDecimalPlacesRef.current = resolveDisplayDecimalPlaces$1(draftRef.current, userDecimalPlacesRef.current, activeStep);
		const nextDraft = formatForDisplay(bounded);
		draftRef.current = nextDraft;
		setDraft(nextDraft);
		lastCommittedValueRef.current = bounded;
		onChange(bounded);
		return true;
	}, [
		fineStep,
		formatForDisplay,
		getActiveStep,
		getCurrentNumericValue,
		max,
		min,
		onChange,
		step,
		triggerBoundFeedback
	]);
	const applyWheelNudge = useCallback((event) => {
		const modifiers = getDomStepModifiers({
			shiftKey: event.shiftKey,
			altKey: event.altKey,
			metaKey: event.metaKey,
			getModifierState: (key) => event.getModifierState(key)
		});
		const modifierKey = `${modifiers.coarse}:${modifiers.fine}`;
		if (wheelModifierRef.current !== modifierKey) {
			wheelDeltaRef.current = 0;
			wheelModifierRef.current = modifierKey;
		}
		const normalizedDelta = normalizeWheelDelta(event.deltaY, event.deltaMode);
		const { accumulated, direction, steps } = consumeWheelDelta(wheelDeltaRef.current, normalizedDelta, wheelSensitivity);
		wheelDeltaRef.current = accumulated;
		if (steps === 0 || direction === 0) {
			event.preventDefault();
			return;
		}
		if (applyDisplayNudge(direction, modifiers, "wheel", steps)) event.preventDefault();
	}, [
		applyDisplayNudge,
		getDomStepModifiers,
		wheelSensitivity
	]);
	useEffect(() => {
		const node = surfaceRef.current;
		if (!node || disabled || logoScrollEnabled) return;
		const handleWheel = (event) => {
			if (!scrub.wheelEnabled) return;
			applyWheelNudge(event);
		};
		const handlePointerLeave = () => {
			resetWheelAccumulator();
		};
		node.addEventListener("wheel", handleWheel, { passive: false });
		node.addEventListener("pointerleave", handlePointerLeave);
		return () => {
			node.removeEventListener("wheel", handleWheel);
			node.removeEventListener("pointerleave", handlePointerLeave);
		};
	}, [
		applyWheelNudge,
		disabled,
		logoScrollEnabled,
		resetWheelAccumulator,
		scrub.wheelEnabled
	]);
	const jumpToBound = useCallback((target) => {
		commit(target, "key");
	}, [commit]);
	const handleKeyboardNudge = useCallback((event) => {
		if (disabled) return false;
		const wasEditing = editingRef.current && KEY_REPEAT_KEYS.has(event.key);
		if (wasEditing) {
			editingRef.current = false;
			setEditing(false);
		}
		const modifiers = getDomStepModifiers({
			shiftKey: event.shiftKey,
			altKey: event.altKey,
			metaKey: event.metaKey,
			getModifierState: (key) => event.getModifierState(key)
		});
		const scheduleOrApplyNudge = (direction, nudgeModifiers, source) => {
			event.preventDefault();
			if (wasEditing) {
				pendingEditKeyboardNudgeRef.current = {
					direction,
					modifiers: nudgeModifiers,
					source
				};
				return true;
			}
			return applyDisplayNudge(direction, nudgeModifiers, source);
		};
		switch (event.key) {
			case "ArrowUp":
			case "ArrowRight": return scheduleOrApplyNudge(1, modifiers, "key");
			case "ArrowDown":
			case "ArrowLeft": return scheduleOrApplyNudge(-1, modifiers, "key");
			case "PageUp": return scheduleOrApplyNudge(1, { coarse: true }, "key");
			case "PageDown": return scheduleOrApplyNudge(-1, { coarse: true }, "key");
			case "Home":
				if (min != null) {
					event.preventDefault();
					jumpToBound(min);
					return true;
				}
				return false;
			case "End":
				if (max != null) {
					event.preventDefault();
					jumpToBound(max);
					return true;
				}
				return false;
			default: return false;
		}
	}, [
		applyDisplayNudge,
		disabled,
		getDomStepModifiers,
		jumpToBound,
		max,
		min
	]);
	useLayoutEffect(() => {
		const pending = pendingEditKeyboardNudgeRef.current;
		if (editing || !pending) return;
		pendingEditKeyboardNudgeRef.current = null;
		applyDisplayNudge(pending.direction, pending.modifiers, pending.source);
	}, [applyDisplayNudge, editing]);
	useEffect(() => {
		const handleKeyUp = (event) => {
			if (KEY_REPEAT_KEYS.has(event.key)) requestAnimationFrame(() => {
				finishInteraction();
			});
		};
		window.addEventListener("keyup", handleKeyUp);
		return () => {
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [finishInteraction]);
	const enterEditMode = useCallback((point) => {
		if (disabled) return;
		editingRef.current = true;
		setEditing(true);
		interactingRef.current = true;
		setDraft((current) => preserveDisplayDraft$1(current, value, formatForDisplay(value)));
		requestAnimationFrame(() => {
			if (!inputRef.current) return;
			requestAnimationFrame(() => {
				if (!inputRef.current) return;
				focusInputForEdit(inputRef.current, selectOnEdit, point);
			});
		});
	}, [
		disabled,
		formatForDisplay,
		selectOnEdit,
		value
	]);
	const canScrub = !disabled && !editing;
	const endScrubSession = useCallback((event, allowEditOnClick) => {
		const state = scrubRef.current;
		if (!state) return;
		const wasScrubbing = state.scrubbing;
		scrubRef.current = null;
		detachScrubSessionGuard();
		if (state.captureTarget) try {
			state.captureTarget.releasePointerCapture(event.pointerId);
		} catch {}
		if (wasScrubbing) {
			finishInteraction();
			if (boundFeedbackRef.current !== null) setBoundFeedback(null);
			setDraft((current) => {
				const nextDraft = preserveDisplayDraft$1(current, value, formatForDisplay(value));
				draftRef.current = nextDraft;
				displayDecimalPlacesRef.current = resolveDisplayDecimalPlaces$1(nextDraft, userDecimalPlacesRef.current);
				return nextDraft;
			});
			notifyCommit(value);
			event.preventDefault();
			return;
		}
		if (isFineModifierPressed$1(toModifierKeys$1({
			shiftKey: event.shiftKey,
			altKey: event.altKey,
			metaKey: event.metaKey,
			getModifierState: (key) => event.getModifierState(key)
		}), fineModifier) && resetToDefault()) {
			event.preventDefault();
			return;
		}
		const now = Date.now();
		const lastClick = lastClickRef.current;
		if (lastClick && now - lastClick.time < 300 && Math.hypot(event.clientX - lastClick.x, event.clientY - lastClick.y) < 5) {
			lastClickRef.current = null;
			if (resetToDefault()) {
				event.preventDefault();
				return;
			}
		} else lastClickRef.current = {
			time: now,
			x: event.clientX,
			y: event.clientY
		};
		if (allowEditOnClick && state.source === "input") enterEditMode({
			clientX: event.clientX,
			clientY: event.clientY
		});
	}, [
		detachScrubSessionGuard,
		enterEditMode,
		fineModifier,
		finishInteraction,
		formatForDisplay,
		notifyCommit,
		resetToDefault,
		value
	]);
	const attachScrubSessionGuard = useCallback(() => {
		detachScrubSessionGuard();
		const handleGlobalPointerEnd = (event) => {
			const state = scrubRef.current;
			if (!state || event.pointerId !== state.pointerId) return;
			endScrubSession(event, state.source === "input");
		};
		document.addEventListener("pointerup", handleGlobalPointerEnd);
		document.addEventListener("pointercancel", handleGlobalPointerEnd);
		scrubSessionGuardRef.current = () => {
			document.removeEventListener("pointerup", handleGlobalPointerEnd);
			document.removeEventListener("pointercancel", handleGlobalPointerEnd);
		};
	}, [detachScrubSessionGuard, endScrubSession]);
	const applyScrubDelta = useCallback((event) => {
		const state = scrubRef.current;
		if (!state) return;
		if (event.pointerType === "mouse" && event.buttons === 0) {
			endScrubSession(event, state.source === "input");
			return;
		}
		const pointerDelta = getScrubPointerDelta$1(event, state.startX, state.startY, scrub.direction);
		if (!state.scrubbing && hasExceededScrubThreshold$1(event, state.startX, state.startY, scrub.direction, scrubThreshold)) {
			state.scrubbing = true;
			interactingRef.current = true;
		}
		if (state.scrubbing) {
			const modifiers = getDomStepModifiers({
				shiftKey: event.shiftKey,
				altKey: event.altKey,
				metaKey: event.metaKey,
				getModifierState: (key) => event.getModifierState(key)
			});
			const delta = getActiveStep(modifiers);
			const effectiveDelta = pointerDelta / scrub.sensitivity;
			const attempted = applyStepDelta$1(state.startValue, effectiveDelta * delta, {
				step,
				fineStep,
				fine: modifiers.fine,
				userDecimalPlaces: userDecimalPlacesRef.current
			});
			const scrubDirection = effectiveDelta === 0 ? void 0 : effectiveDelta > 0 ? 1 : -1;
			commit(attempted, "scrub", resolveCommitQuantizeStep(state.startValue, modifiers.fine), delta, scrubDirection);
		}
	}, [
		commit,
		endScrubSession,
		fineStep,
		getActiveStep,
		getDomStepModifiers,
		resolveCommitQuantizeStep,
		scrub.direction,
		scrub.sensitivity,
		scrubThreshold,
		step
	]);
	const beginLabelScrub = useCallback((event) => {
		if (!canScrub) return;
		if (event.pointerType === "mouse" && event.button !== 0) return;
		const current = Number(draft.replace(/^\+/, ""));
		if (!Number.isFinite(current)) return;
		scrubRef.current = {
			captureTarget: event.currentTarget,
			pointerId: event.pointerId,
			scrubbing: false,
			source: "label",
			startValue: current,
			startX: event.clientX,
			startY: event.clientY
		};
		attachScrubSessionGuard();
		event.preventDefault();
		event.currentTarget.setPointerCapture(event.pointerId);
	}, [
		attachScrubSessionGuard,
		canScrub,
		draft
	]);
	const beginInputScrub = useCallback((event) => {
		if (!canScrub) return;
		if (event.pointerType === "mouse" && event.button !== 0) return;
		const current = Number(draft.replace(/^\+/, ""));
		if (!Number.isFinite(current)) return;
		scrubRef.current = {
			captureTarget: null,
			pointerId: event.pointerId,
			scrubbing: false,
			source: "input",
			startValue: current,
			startX: event.clientX,
			startY: event.clientY
		};
		attachScrubSessionGuard();
		event.preventDefault();
	}, [
		attachScrubSessionGuard,
		canScrub,
		draft
	]);
	const onInputPointerMove = useCallback((event) => {
		const state = scrubRef.current;
		if (!state) return;
		if (!state.scrubbing && hasExceededScrubThreshold$1(event, state.startX, state.startY, scrub.direction, scrubThreshold)) {
			state.scrubbing = true;
			interactingRef.current = true;
			state.captureTarget = event.currentTarget;
			event.currentTarget.blur();
			event.preventDefault();
			event.currentTarget.setPointerCapture(event.pointerId);
		}
		applyScrubDelta(event);
	}, [
		applyScrubDelta,
		scrub.direction,
		scrubThreshold
	]);
	const labelScrubHandlers = useMemo(() => ({
		onPointerCancel: (event) => {
			endScrubSession(event, false);
		},
		onPointerDown: beginLabelScrub,
		onPointerMove: applyScrubDelta,
		onPointerUp: (event) => {
			endScrubSession(event, false);
		}
	}), [
		applyScrubDelta,
		beginLabelScrub,
		endScrubSession
	]);
	const scrubSurfaceHandlers = useMemo(() => ({
		onPointerCancel: (event) => {
			endScrubSession(event, false);
		},
		onPointerDown: beginInputScrub,
		onPointerMove: onInputPointerMove,
		onPointerUp: (event) => {
			endScrubSession(event, true);
		}
	}), [
		beginInputScrub,
		endScrubSession,
		onInputPointerMove
	]);
	const logoScrubHandlers = useMemo(() => ({
		onPointerCancel: (event) => {
			endScrubSession(event, false);
		},
		onPointerDown: beginLabelScrub,
		onPointerMove: applyScrubDelta,
		onPointerUp: (event) => {
			endScrubSession(event, false);
		}
	}), [
		applyScrubDelta,
		beginLabelScrub,
		endScrubSession
	]);
	const focusDisplaySurface = useCallback(() => {
		requestAnimationFrame(() => {
			displaySurfaceRef.current?.focus();
		});
	}, []);
	const onDisplayFocus = useCallback(() => {
		interactingRef.current = true;
	}, []);
	const onDisplayBlur = useCallback(() => {
		finishInteraction();
		resetWheelAccumulator();
	}, [finishInteraction, resetWheelAccumulator]);
	const activateEdit = enterEditMode;
	const atBound = getAtBound$1(value, min, max);
	const ariaValueText = format.clampDisplay && (min != null || max != null) ? `${value}${min != null ? `, min ${min}` : ""}${max != null ? `, max ${max}` : ""}` : void 0;
	const spinbuttonProps = {
		"aria-valuemax": max,
		"aria-valuemin": min,
		"aria-valuenow": value,
		"aria-valuetext": ariaValueText,
		role: "spinbutton"
	};
	const inputProps = {
		...spinbuttonProps,
		"aria-invalid": invalid || void 0,
		"data-slot": "scrub-number-scrubbable",
		inputMode: allowTextInput ? "text" : "numeric",
		onBlur: () => {
			interactingRef.current = false;
			editingRef.current = false;
			setEditing(false);
			const currentDraft = draftRef.current;
			const draftBody = currentDraft.replace(/^\+/, "").trim();
			if (draftBody === "" || draftBody === "-" || draftBody === "+" || draftBody === ".") {
				setInvalid(true);
				setDraft(formatForDisplay(value));
				window.setTimeout(() => {
					setInvalid(false);
				}, 600);
				return;
			}
			const parsed = Number(draftBody);
			if (Number.isFinite(parsed)) {
				setInvalid(false);
				const decimalPlaces = countDraftDecimalPlaces$1(currentDraft);
				userDecimalPlacesRef.current = decimalPlaces > 0 ? decimalPlaces : null;
				notifyCommit(commit(parsed, void 0, resolveCommitQuantizeStep(parsed)));
				return;
			}
			setInvalid(true);
			setDraft(formatForDisplay(value));
			window.setTimeout(() => {
				setInvalid(false);
			}, 600);
		},
		onChange: (event) => {
			setInvalid(false);
			setDraft(allowTextInput ? event.currentTarget.value : sanitizeNumericDraft$1(event.currentTarget.value));
		},
		onFocus: () => {
			interactingRef.current = true;
			setInvalid(false);
		},
		onKeyDown: (event) => {
			if (event.key === "Enter") {
				event.currentTarget.blur();
				return;
			}
			if (event.key === "Escape") {
				setInvalid(false);
				const revertedDraft = formatForDisplay(value);
				draftRef.current = revertedDraft;
				setDraft(revertedDraft);
				editingRef.current = false;
				setEditing(false);
				event.currentTarget.blur();
				return;
			}
			if (handleKeyboardNudge(event)) {
				editingRef.current = false;
				event.currentTarget.blur();
				focusDisplaySurface();
				return;
			}
		},
		ref: inputRef,
		type: "text",
		value: draft
	};
	return {
		activateEdit,
		atBound,
		boundFeedback,
		canScrub,
		clearBoundFeedback,
		displaySurfaceRef,
		displayValue: draft,
		editing,
		handleDisplayKeyDown: useCallback((event) => {
			if (disabled) return;
			if (handleKeyboardNudge(event)) return;
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				enterEditMode();
			}
		}, [
			disabled,
			enterEditMode,
			handleKeyboardNudge
		]),
		inputProps,
		inputRef,
		interactingRef,
		interactionEpoch,
		invalid,
		labelScrubHandlers,
		logoScrubHandlers,
		logoScrollEnabled,
		nudgeTrend: lastNudgeDirectionRef.current,
		onDisplayBlur,
		onDisplayFocus,
		scrubSurfaceHandlers,
		spinbuttonProps,
		surfaceRef
	};
}
function splitSignedDisplayValue(value) {
	if (value.startsWith("-")) return {
		body: value.slice(1),
		sign: "-"
	};
	if (value.startsWith("+")) return {
		body: value.slice(1),
		sign: "+"
	};
	return {
		body: value,
		sign: ""
	};
}
function mirrorInputTypography(source) {
	const computed = getComputedStyle(source);
	return {
		fontFamily: computed.fontFamily,
		fontFeatureSettings: computed.fontFeatureSettings,
		fontSize: computed.fontSize,
		fontStyle: computed.fontStyle,
		fontVariantNumeric: computed.fontVariantNumeric,
		fontWeight: computed.fontWeight,
		letterSpacing: computed.letterSpacing,
		lineHeight: computed.lineHeight
	};
}
function mirrorCalligraphTypography(source) {
	getComputedStyle(source);
	const { lineHeight: _lineHeight,...typography } = mirrorInputTypography(source);
	return {
		...typography,
		lineHeight: 1
	};
}
function CalligraphNumber({ layoutKey, settings = DEFAULT_CALLIGRAPH_SETTINGS, style, trend = 0, value }) {
	const shouldReduceMotion = useReducedMotion();
	const { body, sign } = splitSignedDisplayValue(value);
	const animation = settings.animation === "default" ? void 0 : settings.animation;
	if (shouldReduceMotion) return /* @__PURE__ */ jsx("span", {
		style,
		children: value
	});
	return /* @__PURE__ */ jsxs("span", {
		className: "inline-flex items-center justify-center",
		style,
		children: [sign ? /* @__PURE__ */ jsx("span", {
			"aria-hidden": "true",
			className: "inline-block",
			style,
			children: sign
		}) : null, /* @__PURE__ */ jsx(Calligraph, {
			animation,
			autoSize: settings.autoSize,
			className: "scrub-number-calligraph inline-flex items-center justify-center leading-none",
			stagger: settings.stagger,
			style,
			trend,
			variant: settings.variant,
			children: body
		}, layoutKey)]
	});
}
function getFieldClasses(inputSettings, inputClassName, extra) {
	return cn(scrubFieldVariants({ align: inputSettings.align }), SCRUB_NUMBER_FIELD_CLASS, SCRUB_NUMBER_SPINNER_HIDE_CLASS, extra, inputClassName);
}
function ScrubNumberInput({ calligraph = DEFAULT_CALLIGRAPH_SETTINGS, className, disabled, grouped = false, inputClassName, inputSettings = DEFAULT_INPUT_SETTINGS, logo = DEFAULT_LOGO_SETTINGS, max, min, scrub, scrubSettings = DEFAULT_SCRUB_SETTINGS,...props }) {
	const scrubBounds = {
		min,
		max
	};
	const fieldClass = getFieldClasses(inputSettings, inputClassName);
	const ariaLabel = props["aria-label"];
	const mirrorRef = useRef(null);
	const [mirroredTypography, setMirroredTypography] = useState({});
	const prevTypographyRef = useRef("");
	const logoScrollEnabled = scrub.logoScrollEnabled;
	const usesInputGroup = logoScrollEnabled;
	const usesGroupedControl = grouped || logoScrollEnabled;
	const syncMirroredTypography = useCallback(() => {
		if (scrub.interactingRef.current) return;
		const source = scrub.editing ? scrub.inputRef.current : mirrorRef.current;
		if (!source) return;
		const nextTypography = mirrorCalligraphTypography(source);
		const nextKey = JSON.stringify(nextTypography);
		const typographyChanged = nextKey !== prevTypographyRef.current;
		prevTypographyRef.current = nextKey;
		if (!typographyChanged) return;
		setMirroredTypography(nextTypography);
	}, [
		scrub.editing,
		scrub.inputRef,
		scrub.interactingRef
	]);
	useLayoutEffect(() => {
		syncMirroredTypography();
		const source = scrub.editing ? scrub.inputRef.current : mirrorRef.current;
		if (!source || typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver(syncMirroredTypography);
		observer.observe(source);
		return () => {
			observer.disconnect();
		};
	}, [
		scrub.displayValue,
		scrub.editing,
		scrub.interactionEpoch,
		syncMirroredTypography
	]);
	const groupControlClass = "relative z-[1] flex min-w-0 flex-1 items-center overflow-hidden rounded-none border-0 bg-transparent text-foreground shadow-none dark:bg-transparent";
	const calligraphLayoutKey = useMemo(() => [
		inputSettings.align,
		usesGroupedControl ? "group" : "field",
		logoScrollEnabled ? "logo" : ""
	].join("|"), [
		inputSettings.align,
		logoScrollEnabled,
		usesGroupedControl
	]);
	const scrubSurface = scrub.editing ? /* @__PURE__ */ jsx(Input, {
		...props,
		...scrub.inputProps,
		className: cn(fieldClass, usesGroupedControl ? "rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent" : "relative z-[1] scrub-bound-field"),
		disabled,
		"data-slot": usesGroupedControl ? "input-group-control" : void 0
	}) : /* @__PURE__ */ jsx("div", {
		ref: scrub.displaySurfaceRef,
		...logoScrollEnabled ? {} : scrub.scrubSurfaceHandlers,
		...scrub.spinbuttonProps,
		"aria-label": typeof ariaLabel === "string" ? ariaLabel : void 0,
		"aria-invalid": scrub.invalid || void 0,
		className: cn(fieldClass, usesGroupedControl ? groupControlClass : cn("relative z-[1] flex items-center text-foreground scrub-bound-field", inputSettings.align === "center" && "justify-center", inputSettings.align === "right" && "justify-end", inputSettings.align === "left" && "justify-start"), !logoScrollEnabled && scrub.canScrub && getScrubCursorClass(scrubSettings, scrub.atBound, scrubBounds), !logoScrollEnabled && scrub.canScrub && "select-none", logoScrollEnabled && "cursor-text", disabled && "cursor-not-allowed opacity-50", scrub.invalid && "is-bound-error"),
		"data-slot": usesGroupedControl ? "input-group-control" : "scrub-number-scrubbable",
		tabIndex: disabled ? -1 : 0,
		onClick: logoScrollEnabled && !disabled ? () => {
			scrub.activateEdit();
		} : void 0,
		onBlur: scrub.onDisplayBlur,
		onFocus: scrub.onDisplayFocus,
		onKeyDown: scrub.handleDisplayKeyDown,
		children: /* @__PURE__ */ jsx(motion.div, {
			...grouped ? {} : { layoutRoot: true },
			className: cn("pointer-events-none flex w-full items-center text-foreground", inputSettings.align === "center" && "justify-center", inputSettings.align === "right" && "justify-end", inputSettings.align === "left" && "justify-start"),
			"data-slot": "scrub-number-calligraph-value",
			style: mirroredTypography,
			children: /* @__PURE__ */ jsx(CalligraphNumber, {
				layoutKey: calligraphLayoutKey,
				settings: calligraph,
				style: mirroredTypography,
				trend: scrub.nudgeTrend,
				value: scrub.displayValue
			})
		})
	});
	const fieldContent = /* @__PURE__ */ jsxs("div", {
		className: cn("relative", usesGroupedControl ? "flex min-w-0 flex-1 overflow-hidden" : "shrink-0"),
		children: [/* @__PURE__ */ jsx(Input, {
			ref: mirrorRef,
			"aria-hidden": true,
			className: fieldClass,
			readOnly: true,
			tabIndex: -1,
			value: scrub.displayValue,
			style: {
				inset: 0,
				opacity: 0,
				pointerEvents: "none",
				position: "absolute",
				zIndex: 0
			}
		}), scrubSurface]
	});
	const inputGroup = /* @__PURE__ */ jsxs(InputGroup, {
		className: cn("h-7 scrub-bound-field w-full"),
		children: [fieldContent, logoScrollEnabled ? /* @__PURE__ */ jsx(InputGroupAddon, {
			align: "inline-start",
			...scrub.logoScrubHandlers,
			className: cn("select-none pl-1.5", scrub.canScrub && getScrubCursorClass(scrubSettings, scrub.atBound, scrubBounds)),
			"data-slot": "scrub-number-logo-scroll",
			onClick: (event) => {
				event.preventDefault();
			},
			children: /* @__PURE__ */ jsx(ScrubLogoIcon, {
				className: "pointer-events-none size-3.5 text-muted-foreground",
				name: logo.icon
			})
		}) : null]
	});
	return /* @__PURE__ */ jsx("div", {
		ref: scrub.surfaceRef,
		className: cn("relative shrink-0", className),
		children: /* @__PURE__ */ jsx(ScrubBoundFeedback, {
			atBound: scrub.atBound,
			boundFeedback: scrub.boundFeedback,
			className: usesInputGroup || grouped ? "w-full min-w-0" : void 0,
			direction: scrubSettings.direction,
			mode: scrubSettings.boundFeedback,
			onFeedbackComplete: scrub.clearBoundFeedback,
			children: usesInputGroup ? inputGroup : fieldContent
		})
	});
}
function ScrubNumberField({ calligraph, className, defaultResetValue, defaultValue, disabled, format = DEFAULT_FORMAT_SETTINGS, formatValue, grouped = false, inputSettings = DEFAULT_INPUT_SETTINGS, label, labelClassName, logo = DEFAULT_LOGO_SETTINGS, max, min, onValueChange, onValueCommit, scrub: scrubSettings = DEFAULT_SCRUB_SETTINGS, shiftStep, step, value: valueProp, inputClassName,...props }) {
	const [value, setValue] = useControllableState({
		prop: valueProp,
		defaultProp: defaultValue ?? 0,
		onChange: onValueChange,
		caller: "ScrubNumberField"
	});
	const scrub = useNumberScrub({
		disabled,
		format,
		formatValue,
		logo,
		max: typeof max === "number" ? max : void 0,
		min: typeof min === "number" ? min : void 0,
		onChange: setValue,
		onValueCommit,
		defaultResetValue: defaultResetValue ?? defaultValue,
		scrub: scrubSettings,
		allowTextInput: inputSettings.allowTextInput,
		selectOnEdit: inputSettings.selectOnEdit,
		shiftStep,
		step: typeof step === "number" ? step : void 0,
		value
	});
	const field = /* @__PURE__ */ jsx("div", {
		className: "min-w-0",
		children: /* @__PURE__ */ jsx(ScrubNumberInput, {
			...props,
			calligraph,
			className: cn(grouped ? "min-w-0 flex-1" : logo.enabled ? "w-[6.75rem]" : "w-[4.75rem]", className),
			disabled,
			grouped,
			inputClassName,
			inputSettings,
			logo,
			max,
			min,
			scrub,
			scrubSettings
		})
	});
	if (!label) return field;
	const labelScrubEnabled = scrubSettings.labelScrubEnabled;
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-3",
		children: [/* @__PURE__ */ jsx("span", {
			...labelScrubEnabled ? scrub.labelScrubHandlers : {},
			className: cn("w-16 text-sm font-medium text-muted-foreground", labelScrubEnabled && getScrubCursorClass(scrubSettings, scrub.atBound, {
				min,
				max
			}), labelScrubEnabled && "select-none", labelClassName),
			children: label
		}), field]
	});
}

//#endregion
//#region ../../lib/scrub-number-math.ts
const DEFAULT_SCRUB_THRESHOLD = 3;
function isMacPlatform() {
	if (typeof navigator === "undefined") return false;
	const platform = navigator.platform ?? "";
	const userAgent = navigator.userAgent ?? "";
	return /Mac|iPhone|iPad|iPod/.test(platform) || /Mac OS X/.test(userAgent);
}
function isModifierKeyPressed(event, key) {
	const getState = event.getModifierState?.bind(event);
	switch (key) {
		case "shift": return event.shiftKey || getState?.("Shift") === true;
		case "alt": return event.altKey || getState?.("Alt") === true;
		case "meta": return event.metaKey || getState?.("Meta") === true;
	}
}
function resolveFineModifierKey(modifier = "alt") {
	return modifier;
}
function resolveCoarseModifierKey(modifier = "shift") {
	return modifier;
}
function isFineModifierPressed(event, modifier = "alt") {
	return isModifierKeyPressed(event, resolveFineModifierKey(modifier));
}
function isCoarseModifierPressed(event, modifier = "shift") {
	return isModifierKeyPressed(event, resolveCoarseModifierKey(modifier));
}
function getModifierLabel(key) {
	switch (key) {
		case "shift": return "Shift";
		case "alt": return "Alt";
		case "meta": return "Cmd";
	}
}
function getFineModifierLabel(modifier = "alt") {
	return getModifierLabel(resolveFineModifierKey(modifier));
}
function getCoarseModifierLabel(modifier = "shift") {
	return getModifierLabel(resolveCoarseModifierKey(modifier));
}
function toModifierKeys(event) {
	return {
		shiftKey: event.shiftKey,
		altKey: event.altKey,
		metaKey: event.metaKey,
		getModifierState: event.getModifierState ? (key) => event.getModifierState(key) : void 0
	};
}
function resolveScrubStepModifiers(event, options = {}) {
	return {
		coarse: isCoarseModifierPressed(event, options.coarseModifier),
		fine: isFineModifierPressed(event, options.fineModifier)
	};
}
function clampNumber(value, min, max) {
	let bounded = value;
	if (min != null) bounded = Math.max(min, bounded);
	if (max != null) bounded = Math.min(max, bounded);
	return bounded;
}
function getBoundEdge(current, attempted, min, max) {
	if (attempted > current && max != null && current >= max) return "max";
	if (attempted < current && min != null && current <= min) return "min";
	return null;
}
function getAtBound(value, min, max) {
	if (max != null && value >= max) return "max";
	if (min != null && value <= min) return "min";
	return null;
}
function boundOverflow(attempted, edge, min, max) {
	if (edge === "max" && max != null) return Math.max(0, attempted - max);
	if (edge === "min" && min != null) return Math.max(0, min - attempted);
	return 1;
}
function quantizeNumber(value, step) {
	if (!Number.isFinite(step) || step <= 0) return value;
	const quantized = Math.round(value / step) * step;
	if (Number.isInteger(step)) return quantized;
	const decimals = step.toString().split(".")[1]?.length ?? 0;
	return parseFloat(quantized.toFixed(decimals));
}
function getDecimalPlaces(step) {
	if (!Number.isFinite(step) || Number.isInteger(step)) return 0;
	return step.toString().split(".")[1]?.length ?? 0;
}
function formatMinimalDisplayValue(value) {
	const normalized = Number(value.toPrecision(12));
	if (Number.isInteger(normalized)) return String(Math.trunc(normalized));
	return normalized.toString();
}
function countDraftDecimalPlaces(draft) {
	const body = draft.trim().replace(/^[+-]/, "");
	if (!body.includes(".")) return 0;
	return body.split(".")[1]?.length ?? 0;
}
function resolveDisplayDecimalPlaces(previousDraft, userDecimalPlaces, activeStep) {
	if (userDecimalPlaces != null && userDecimalPlaces > 0) return userDecimalPlaces;
	const fromDraft = countDraftDecimalPlaces(previousDraft);
	if (fromDraft > 0) return fromDraft;
	const fromStep = activeStep != null ? getDecimalPlaces(activeStep) : 0;
	return fromStep > 0 ? fromStep : null;
}
/** Minimal display by default; decimals only after the user typed them. */
function formatDisplayValue(value, format, userDecimalPlaces = null) {
	const formatted = userDecimalPlaces != null && userDecimalPlaces > 0 ? value.toFixed(userDecimalPlaces) : formatMinimalDisplayValue(value);
	if (format.alwaysShowSign && value > 0) return `+${formatted}`;
	return formatted;
}
function resolveActiveStep(options) {
	const { step, shiftStep, fineStep, coarse = false, fine = false } = options;
	if (coarse) return shiftStep;
	if (fine) return fineStep;
	return step;
}
function getValueDecimalPlaces(value) {
	if (!Number.isFinite(value)) return 0;
	const normalized = Number(value.toPrecision(12));
	if (Number.isInteger(normalized)) return 0;
	const text = normalized.toString();
	if (text.includes("e") || text.includes("E")) return getValueDecimalPlaces(Number(normalized.toFixed(12)));
	return text.split(".")[1]?.length ?? 0;
}
function stepFromDecimalPlaces(decimals) {
	if (decimals <= 0) return 1;
	return Number((1 / 10 ** decimals).toFixed(decimals));
}
function resolveQuantizeStep(options) {
	const activeStep = options.fine ? options.fineStep : options.step;
	const valuePrecision = Math.max(getValueDecimalPlaces(options.currentValue), options.userDecimalPlaces ?? 0);
	if (valuePrecision > getDecimalPlaces(activeStep)) return stepFromDecimalPlaces(valuePrecision);
	return activeStep;
}
function applyStepDelta(current, delta, options) {
	const next = current + delta;
	if (options.userDecimalPlaces != null && options.userDecimalPlaces > 0) return parseFloat(next.toFixed(options.userDecimalPlaces));
	return quantizeNumber(next, resolveQuantizeStep({
		step: options.step,
		fineStep: options.fineStep,
		fine: options.fine,
		currentValue: current,
		userDecimalPlaces: options.userDecimalPlaces
	}));
}
/** Keeps the visible draft string when entering edit if it still matches the numeric value. */
function preserveDisplayDraft(currentDraft, value, fallback) {
	const parsed = Number(currentDraft.replace(/^\+/, ""));
	if (currentDraft !== "" && Number.isFinite(parsed) && parsed === value) return currentDraft;
	return fallback;
}
function getScrubPointerDelta(event, startX, startY, direction) {
	if (direction === "vertical") return startY - event.clientY;
	return event.clientX - startX;
}
function hasExceededScrubThreshold(event, startX, startY, direction, threshold = DEFAULT_SCRUB_THRESHOLD) {
	const effectiveThreshold = Math.max(1, threshold);
	if (direction === "vertical") return Math.abs(event.clientY - startY) > effectiveThreshold;
	return Math.abs(event.clientX - startX) > effectiveThreshold;
}
function resolveFineStep(step, fineStep) {
	if (fineStep != null && Number.isFinite(fineStep) && fineStep > 0) return fineStep;
	return quantizeNumber(step / 10, step) || step / 10;
}
/** Keeps only characters valid while typing a numeric draft (+, -, digits, one dot). */
function sanitizeNumericDraft(value) {
	if (value === "") return "";
	let sign = "";
	let rest = value;
	if (rest.startsWith("+") || rest.startsWith("-")) {
		sign = rest[0];
		rest = rest.slice(1);
	}
	let hasDot = false;
	let body = "";
	for (const character of rest) {
		if (character >= "0" && character <= "9") {
			body += character;
			continue;
		}
		if (character === "." && !hasDot) {
			hasDot = true;
			body += character;
		}
	}
	return sign + body;
}

//#endregion
export { BOUND_FEEDBACK_MODES, DEFAULT_CALLIGRAPH_SETTINGS, DEFAULT_FORMAT_SETTINGS, DEFAULT_INPUT_SETTINGS, DEFAULT_LOGO_SETTINGS, DEFAULT_SCRUB_FIELD_SETTINGS, DEFAULT_SCRUB_SETTINGS, LOGO_ICON_OPTIONS, ScrubLogoIcon, ScrubNumberField, ScrubNumberInput, applyStepDelta, boundOverflow, clampNumber, countDraftDecimalPlaces, formatDisplayValue, formatMinimalDisplayValue, getAtBound, getBoundEdge, getCoarseModifierLabel, getDecimalPlaces, getFineModifierLabel, getScrubCursorClass, getScrubPointerDelta, getValueDecimalPlaces, hasExceededScrubThreshold, isCoarseModifierPressed, isFineModifierPressed, isMacPlatform, isModifierKeyPressed, normalizeScrubFieldSettings, preserveDisplayDraft, quantizeNumber, resolveActiveStep, resolveCoarseModifierKey, resolveDisplayDecimalPlaces, resolveFineModifierKey, resolveFineStep, resolveQuantizeStep, resolveScrubStepModifiers, sanitizeNumericDraft, stepFromDecimalPlaces, toModifierKeys, useNumberScrub };