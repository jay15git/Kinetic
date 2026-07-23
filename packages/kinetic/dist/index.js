import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Calligraph } from "calligraph";
import { GripHorizontal, GripVertical, Move, MoveHorizontal, MoveVertical, Percent } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { useControllableState } from "@/hooks/use-controllable-state";
import { useDisplayOverflowTruncated } from "@/lib/scrub-number-overflow";
import { applyStepDelta, boundOverflow, clampNumber, clampNumber as clampNumber$1, consumeWheelDelta, countDraftDecimalPlaces, formatDisplayValue, getAtBound, getBoundEdge, getScrubPointerDelta, hasExceededScrubThreshold, isFineModifierPressed, normalizeCoarseModifier, normalizeFineModifier, normalizeFiniteNumber, normalizeNumberFieldBounds, normalizePositiveFiniteStep, normalizeScrubThreshold, normalizeWheelDelta, normalizeWheelSensitivity, preserveDisplayDraft, quantizeNumber, resolveActiveStep, resolveDisplayDecimalPlaces, resolveFineStep, resolveQuantizeStep, resolveScrubStepModifiers, sanitizeNumericDraft, toModifierKeys } from "@/lib/scrub-number-math";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { jsx, jsxs } from "react/jsx-runtime";

//#region ../../components/ui/scrub-number-input.tsx
const SCRUB_NUMBER_FIELD_CLASS = "tabular-nums";
const SCRUB_NUMBER_SPINNER_HIDE_CLASS = "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
const scrubFieldVariants = cva("w-full min-w-0 rounded-[12px] border border-input bg-[var(--input-fill)] py-1 text-start text-base text-foreground transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-7 px-2 text-[0.8rem]");
const DEFAULT_INPUT_SETTINGS = { selectOnEdit: true };
const DEFAULT_FORMAT_SETTINGS = { alwaysShowSign: false };
const BOUND_FEEDBACK_MODES = [
	"none",
	"shake",
	"borderPulse"
];
const DEFAULT_SCRUB_SETTINGS = {
	direction: "horizontal",
	shiftStep: 10,
	sensitivity: 1,
	threshold: 3,
	wheelEnabled: false,
	boundFeedback: "none",
	fineModifier: "alt",
	coarseModifier: "shift",
	wheelSensitivity: 20
};
const DEFAULT_CALLIGRAPH_SETTINGS = {
	variant: "slots",
	animation: "snappy",
	stagger: .02,
	autoSize: false
};
const VALUE_NUDGE_KEYS = new Set([
	"ArrowUp",
	"ArrowDown",
	"PageUp",
	"PageDown"
]);
const LOGO_ICON_OPTIONS = [
	"GripVertical",
	"GripHorizontal",
	"Move",
	"MoveHorizontal",
	"MoveVertical",
	"Percent"
];
const DEFAULT_LOGO_SETTINGS = {
	enabled: false,
	icon: "GripVertical"
};
const LOGO_ICONS = {
	GripVertical,
	GripHorizontal,
	Move,
	MoveHorizontal,
	MoveVertical,
	Percent
};
function ScrubLogoIcon({ className, name }) {
	const Icon = LOGO_ICONS[name];
	return /* @__PURE__ */ jsx(Icon, {
		"aria-hidden": true,
		className
	});
}
const DEFAULT_SCRUB_FIELD_SETTINGS = {
	calligraph: DEFAULT_CALLIGRAPH_SETTINGS,
	input: DEFAULT_INPUT_SETTINGS,
	logo: DEFAULT_LOGO_SETTINGS,
	step: 1,
	smallStep: .1,
	largeStep: 10,
	direction: "horizontal",
	pixelSensitivity: 2,
	allowWheelScrub: false,
	boundFeedback: "none"
};
function flatSettingsToScrubSettings(settings) {
	const step = normalizePositiveFiniteStep(settings.step);
	let fineStep = settings.smallStep ?? .1;
	if (!Number.isFinite(fineStep) || fineStep <= 0 || fineStep >= step) fineStep = resolveFineStep(step);
	let shiftStep = settings.largeStep ?? DEFAULT_SCRUB_SETTINGS.shiftStep;
	if (!Number.isFinite(shiftStep) || shiftStep < step) shiftStep = Math.max(step, DEFAULT_SCRUB_SETTINGS.shiftStep);
	const sensitivity = typeof settings.pixelSensitivity === "number" && Number.isFinite(settings.pixelSensitivity) && settings.pixelSensitivity > 0 ? settings.pixelSensitivity : DEFAULT_SCRUB_SETTINGS.sensitivity;
	return {
		...DEFAULT_SCRUB_SETTINGS,
		direction: settings.direction === "vertical" ? "vertical" : "horizontal",
		boundFeedback: settings.boundFeedback ?? "none",
		wheelEnabled: Boolean(settings.allowWheelScrub),
		sensitivity,
		fineStep,
		shiftStep
	};
}
function normalizeScrubFieldSettings(settings) {
	let min = settings.min;
	let max = settings.max;
	if (min != null && max != null && Number.isFinite(min) && Number.isFinite(max) && min > max) [min, max] = [max, min];
	const step = typeof settings.step === "number" && Number.isFinite(settings.step) && settings.step > 0 ? settings.step : 1;
	let smallStep = settings.smallStep ?? .1;
	if (!Number.isFinite(smallStep) || smallStep <= 0 || smallStep >= step) smallStep = Math.min(step / 10, step) || .1;
	let largeStep = settings.largeStep ?? 10;
	if (!Number.isFinite(largeStep) || largeStep < step) largeStep = Math.max(step, 10);
	const requestedLogoIcon = settings.logo?.icon;
	const logoIcon = requestedLogoIcon && LOGO_ICON_OPTIONS.includes(requestedLogoIcon) ? requestedLogoIcon : DEFAULT_LOGO_SETTINGS.icon;
	const pixelSensitivity = typeof settings.pixelSensitivity === "number" && Number.isFinite(settings.pixelSensitivity) && settings.pixelSensitivity > 0 ? settings.pixelSensitivity : 2;
	return {
		calligraph: {
			...DEFAULT_CALLIGRAPH_SETTINGS,
			...settings.calligraph
		},
		input: {
			...DEFAULT_INPUT_SETTINGS,
			...settings.input
		},
		logo: {
			...DEFAULT_LOGO_SETTINGS,
			...settings.logo,
			icon: logoIcon
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
		format: settings.format
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
		scrollCaretIntoView(input);
		return;
	}
	ctx.font = `${style.fontStyle} ${style.fontVariant} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
	ctx.letterSpacing = style.letterSpacing;
	const textWidth = ctx.measureText(text).width;
	let textStart = paddingLeft + input.scrollLeft;
	const textAlign = style.textAlign;
	if (textAlign === "center") textStart += Math.max(0, (contentWidth - textWidth) / 2);
	else if (textAlign === "right" || textAlign === "end") textStart += Math.max(0, contentWidth - textWidth);
	const relativeX = clientX - rect.left - textStart;
	if (relativeX <= 0) {
		input.setSelectionRange(0, 0);
		scrollCaretIntoView(input);
		return;
	}
	if (relativeX >= textWidth) {
		input.setSelectionRange(text.length, text.length);
		scrollCaretIntoView(input);
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
	scrollCaretIntoView(input);
}
function placeCaretAtPoint(input, clientX, clientY) {
	const doc = input.ownerDocument;
	if (typeof doc.caretRangeFromPoint === "function") {
		const range = doc.caretRangeFromPoint(clientX, clientY);
		if (range && input.contains(range.startContainer)) {
			const offset = Math.min(range.startOffset, input.value.length);
			input.setSelectionRange(offset, offset);
			scrollCaretIntoView(input);
			return true;
		}
	}
	if (typeof doc.caretPositionFromPoint === "function") {
		const position = doc.caretPositionFromPoint(clientX, clientY);
		if (position && (input === position.offsetNode || input.contains(position.offsetNode))) {
			const offset = Math.min(position.offset, input.value.length);
			input.setSelectionRange(offset, offset);
			scrollCaretIntoView(input);
			return true;
		}
	}
	approximateCaretFromX(input, clientX);
	return true;
}
function inputTextOverflows(input) {
	return input.scrollWidth > input.clientWidth + 1;
}
function scrollCaretIntoView(input) {
	if (!inputTextOverflows(input)) return;
	const caret = input.selectionStart ?? input.value.length;
	const style = getComputedStyle(input);
	const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
	const paddingRight = Number.parseFloat(style.paddingRight) || 0;
	const contentWidth = input.clientWidth - paddingLeft - paddingRight;
	const ctx = document.createElement("canvas").getContext("2d");
	if (!ctx || contentWidth <= 0) return;
	ctx.font = `${style.fontStyle} ${style.fontVariant} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
	ctx.letterSpacing = style.letterSpacing;
	const textBeforeCaret = input.value.slice(0, caret);
	const caretX = ctx.measureText(textBeforeCaret).width;
	const maxScroll = Math.max(0, input.scrollWidth - input.clientWidth);
	if (caretX - input.scrollLeft < paddingLeft) {
		input.scrollLeft = Math.max(0, caretX - paddingLeft);
		return;
	}
	if (caretX > input.scrollLeft + contentWidth - paddingRight) input.scrollLeft = Math.min(maxScroll, caretX - contentWidth + paddingRight);
}
function focusCaretAtEnd(input) {
	const length = input.value.length;
	input.setSelectionRange(length, length);
	scrollCaretIntoView(input);
}
function focusInputForEdit(input, selectOnEdit, point) {
	input.focus({ preventScroll: true });
	if (selectOnEdit) {
		input.select();
		scrollCaretIntoView(input);
		return;
	}
	if (point) {
		placeCaretAtPoint(input, point.clientX, point.clientY);
		return;
	}
	focusCaretAtEnd(input);
}
const SCRUB_BOUND_FEEDBACK_MS = 280;
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
function ScrubBoundFeedback({ boundFeedback, children, className, mode, onFeedbackComplete }) {
	const shouldReduceMotion = useReducedMotion();
	const wrapRef = useRef(null);
	const [boundHit, setBoundHit] = useState(null);
	const [boundError, setBoundError] = useState(false);
	useEffect(() => {
		if (!boundFeedback || mode === "none") {
			setBoundError(false);
			return;
		}
		const shakeTargets = wrapRef.current ? Array.from(wrapRef.current.querySelectorAll(".scrub-bound-field")) : [];
		if (mode === "shake") {
			setBoundError(true);
			if (!shouldReduceMotion && shakeTargets.length > 0) restartBoundShake(shakeTargets);
			const completeTimer = window.setTimeout(() => {
				onFeedbackComplete();
			}, shouldReduceMotion ? 0 : SCRUB_BOUND_FEEDBACK_MS);
			const revertTimer = window.setTimeout(() => {
				setBoundError(false);
				clearBoundShake(shakeTargets);
			}, shouldReduceMotion ? 0 : SCRUB_BOUND_FEEDBACK_MS + SCRUB_BOUND_REVERT_HOLD_MS);
			return () => {
				window.clearTimeout(completeTimer);
				window.clearTimeout(revertTimer);
			};
		}
		if (mode === "borderPulse") {
			setBoundHit(boundFeedback.edge);
			const timeout = window.setTimeout(() => {
				setBoundHit(null);
				onFeedbackComplete();
			}, shouldReduceMotion ? 0 : SCRUB_BOUND_FEEDBACK_MS);
			return () => {
				window.clearTimeout(timeout);
			};
		}
	}, [
		boundFeedback,
		mode,
		onFeedbackComplete,
		shouldReduceMotion
	]);
	return /* @__PURE__ */ jsx("div", {
		className,
		children: /* @__PURE__ */ jsx("div", {
			ref: wrapRef,
			"data-slot": "scrub-bound-feedback",
			"data-bound-hit": boundHit ?? void 0,
			className: cn("scrub-bound-wrap", boundError && "is-bound-error"),
			children
		})
	});
}
function useNumberScrub({ disabled = false, format = DEFAULT_FORMAT_SETTINGS, formatValue, logo = DEFAULT_LOGO_SETTINGS, max: maxProp, min: minProp, onChange, onValueCommit, defaultResetValue, scrub = DEFAULT_SCRUB_SETTINGS, selectOnEdit = true, shiftStep: shiftStepProp, step: stepProp = 1, value: valueProp }) {
	const { min, max } = normalizeNumberFieldBounds(minProp, maxProp);
	const value = normalizeFiniteNumber(valueProp) ?? 0;
	const step = normalizePositiveFiniteStep(stepProp);
	const effectiveShiftStep = normalizePositiveFiniteStep(shiftStepProp ?? scrub.shiftStep, Math.max(step, DEFAULT_SCRUB_SETTINGS.shiftStep));
	const fineStep = resolveFineStep(step, scrub.fineStep);
	const wheelSensitivity = normalizeWheelSensitivity(scrub.wheelSensitivity);
	const fineModifier = normalizeFineModifier(scrub.fineModifier, DEFAULT_SCRUB_SETTINGS.fineModifier ?? "alt");
	const coarseModifier = normalizeCoarseModifier(scrub.coarseModifier, DEFAULT_SCRUB_SETTINGS.coarseModifier ?? "shift");
	const scrubThreshold = normalizeScrubThreshold(scrub.threshold);
	const logoScrollEnabled = logo.enabled;
	const userDecimalPlacesRef = useRef(null);
	const displayDecimalPlacesRef = useRef(null);
	const wheelDeltaRef = useRef(0);
	const wheelModifierRef = useRef(null);
	const formatForEdit = useCallback((nextValue) => formatDisplayValue(nextValue, format, userDecimalPlacesRef.current ?? displayDecimalPlacesRef.current), [format]);
	const formatForDisplay = useCallback((nextValue) => {
		if (formatValue) return formatValue(nextValue);
		return formatForEdit(nextValue);
	}, [formatForEdit, formatValue]);
	const [draft, setDraft] = useState(() => formatForEdit(value));
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
		setDraft(formatForEdit(bounded));
		notifyCommit(bounded);
		return true;
	}, [
		defaultResetValue,
		formatForEdit,
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
		const nextDraft = preserveDisplayDraft(draftRef.current, value, formatForEdit(value));
		displayDecimalPlacesRef.current = resolveDisplayDecimalPlaces(nextDraft, userDecimalPlacesRef.current);
		draftRef.current = nextDraft;
		setDraft(nextDraft);
		lastCommittedValueRef.current = value;
	}, [formatForEdit, value]);
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
		if (boundFeedbackLatchedRef.current[edge]) return;
		boundFeedbackLatchedRef.current[edge] = true;
		boundFeedbackTickRef.current += 1;
		setBoundFeedback({
			edge,
			overflow: boundOverflow(attempted, edge, min, max),
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
	const resolveCommitQuantizeStep = useCallback((currentValue, fine = false) => resolveQuantizeStep({
		step,
		fineStep,
		fine,
		currentValue,
		userDecimalPlaces: userDecimalPlacesRef.current
	}), [fineStep, step]);
	const commit = useCallback((nextValue, source, quantizeStep = step, activeStep = step, direction) => {
		const current = getCurrentNumericValue();
		const attempted = quantizeNumber(nextValue, quantizeStep);
		const bounded = clampNumber$1(attempted, min, max);
		if (source) {
			const edge = getBoundEdge(current, attempted, min, max);
			if (edge) triggerBoundFeedback(edge, source, attempted);
			else if (source === "scrub" && boundFeedbackRef.current !== null) setBoundFeedback(null);
		}
		if (direction) lastNudgeDirectionRef.current = direction;
		else if (bounded !== current) lastNudgeDirectionRef.current = bounded > current ? 1 : -1;
		onChange(bounded);
		displayDecimalPlacesRef.current = resolveDisplayDecimalPlaces(draftRef.current, userDecimalPlacesRef.current, activeStep);
		const nextDraft = formatForEdit(bounded);
		draftRef.current = nextDraft;
		setDraft(nextDraft);
		lastCommittedValueRef.current = bounded;
		return bounded;
	}, [
		formatForEdit,
		getCurrentNumericValue,
		max,
		min,
		onChange,
		step,
		triggerBoundFeedback
	]);
	const getActiveStep = useCallback((modifiers) => resolveActiveStep({
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
	const getStepModifiers = useCallback((event) => resolveScrubStepModifiers(toModifierKeys(event), {
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
		const attempted = applyStepDelta(current, direction * activeStep * count, {
			step,
			fineStep,
			fine,
			userDecimalPlaces: userDecimalPlacesRef.current
		});
		const bounded = clampNumber$1(attempted, min, max);
		if (bounded === current) {
			const edge = getBoundEdge(current, attempted, min, max);
			if (edge) triggerBoundFeedback(edge, source, attempted);
			return true;
		}
		interactingRef.current = true;
		lastNudgeDirectionRef.current = direction;
		displayDecimalPlacesRef.current = resolveDisplayDecimalPlaces(draftRef.current, userDecimalPlacesRef.current, activeStep);
		const nextDraft = formatForEdit(bounded);
		draftRef.current = nextDraft;
		setDraft(nextDraft);
		lastCommittedValueRef.current = bounded;
		onChange(bounded);
		return true;
	}, [
		fineStep,
		formatForEdit,
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
		const wasEditing = editingRef.current && VALUE_NUDGE_KEYS.has(event.key);
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
			case "ArrowUp": return scheduleOrApplyNudge(1, modifiers, "key");
			case "ArrowDown": return scheduleOrApplyNudge(-1, modifiers, "key");
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
			if (VALUE_NUDGE_KEYS.has(event.key)) requestAnimationFrame(() => {
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
		setDraft((current) => preserveDisplayDraft(current, value, formatForEdit(value)));
		requestAnimationFrame(() => {
			if (!inputRef.current) return;
			requestAnimationFrame(() => {
				if (!inputRef.current) return;
				focusInputForEdit(inputRef.current, selectOnEdit, point);
			});
		});
	}, [
		disabled,
		formatForEdit,
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
				const nextDraft = preserveDisplayDraft(current, value, formatForEdit(value));
				draftRef.current = nextDraft;
				displayDecimalPlacesRef.current = resolveDisplayDecimalPlaces(nextDraft, userDecimalPlacesRef.current);
				return nextDraft;
			});
			notifyCommit(value);
			event.preventDefault();
			return;
		}
		if (isFineModifierPressed(toModifierKeys({
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
		formatForEdit,
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
	const beginPointerCapture = useCallback((captureTarget, pointerId) => {
		const state = scrubRef.current;
		if (!state || !captureTarget) return;
		state.captureTarget = captureTarget;
		captureTarget.blur();
		try {
			captureTarget.setPointerCapture(pointerId);
		} catch {}
	}, []);
	const activateScrubbing = useCallback((event, captureTarget) => {
		const state = scrubRef.current;
		if (!state || state.scrubbing) return;
		state.scrubbing = true;
		interactingRef.current = true;
		event.preventDefault();
		beginPointerCapture(captureTarget, event.pointerId);
	}, [beginPointerCapture]);
	const applyScrubDelta = useCallback((event) => {
		const state = scrubRef.current;
		if (!state) return;
		if (event.pointerType === "mouse" && event.buttons === 0) {
			endScrubSession(event, state.source === "input");
			return;
		}
		if (!state.scrubbing && hasExceededScrubThreshold(event, state.startX, state.startY, scrub.direction, scrubThreshold)) activateScrubbing(event, event.currentTarget);
		if (!state.scrubbing) return;
		const pointerDelta = getScrubPointerDelta(event, state.startX, state.startY, scrub.direction);
		const modifiers = getDomStepModifiers({
			shiftKey: event.shiftKey,
			altKey: event.altKey,
			metaKey: event.metaKey,
			getModifierState: (key) => event.getModifierState(key)
		});
		const delta = getActiveStep(modifiers);
		const effectiveDelta = pointerDelta / scrub.sensitivity;
		const attempted = applyStepDelta(state.startValue, effectiveDelta * delta, {
			step,
			fineStep,
			fine: modifiers.fine,
			userDecimalPlaces: userDecimalPlacesRef.current
		});
		const scrubDirection = effectiveDelta === 0 ? void 0 : effectiveDelta > 0 ? 1 : -1;
		commit(attempted, "scrub", resolveCommitQuantizeStep(state.startValue, modifiers.fine), delta, scrubDirection);
	}, [
		activateScrubbing,
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
	const onInputPointerMove = applyScrubDelta;
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
	const atBound = getAtBound(value, min, max);
	const spinbuttonProps = {
		"aria-valuemax": max,
		"aria-valuemin": min,
		"aria-valuenow": value,
		role: "spinbutton"
	};
	const inputProps = {
		...spinbuttonProps,
		"aria-invalid": invalid || void 0,
		"data-slot": "scrub-number-scrubbable",
		inputMode: "decimal",
		onBlur: () => {
			interactingRef.current = false;
			editingRef.current = false;
			setEditing(false);
			const currentDraft = draftRef.current;
			const draftBody = currentDraft.replace(/^\+/, "").trim();
			if (draftBody === "" || draftBody === "-" || draftBody === "+" || draftBody === ".") {
				setInvalid(true);
				setDraft(formatForEdit(value));
				window.setTimeout(() => {
					setInvalid(false);
				}, 600);
				return;
			}
			const parsed = Number(draftBody);
			if (Number.isFinite(parsed)) {
				setInvalid(false);
				const decimalPlaces = countDraftDecimalPlaces(currentDraft);
				userDecimalPlacesRef.current = decimalPlaces > 0 ? decimalPlaces : null;
				notifyCommit(commit(parsed, void 0, resolveCommitQuantizeStep(parsed)));
				return;
			}
			setInvalid(true);
			setDraft(formatForEdit(value));
			window.setTimeout(() => {
				setInvalid(false);
			}, 600);
		},
		onChange: (event) => {
			setInvalid(false);
			const nextValue = sanitizeNumericDraft(event.currentTarget.value, draftRef.current);
			draftRef.current = nextValue;
			setDraft(nextValue);
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
				const revertedDraft = formatForEdit(value);
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
	const handleDisplayKeyDown = useCallback((event) => {
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
	]);
	return {
		activateEdit,
		atBound,
		boundFeedback,
		canScrub,
		clearBoundFeedback,
		displaySurfaceRef,
		displayValue: (() => {
			if (editing) return draft;
			const draftNumeric = Number(draft.replace(/^\+/, ""));
			if (Number.isFinite(draftNumeric) && draftNumeric === lastCommittedValueRef.current && lastCommittedValueRef.current !== value) return formatForDisplay(lastCommittedValueRef.current);
			return formatForDisplay(value);
		})(),
		editing,
		handleDisplayKeyDown,
		inputProps,
		inputRef,
		interactingRef,
		interactionEpoch,
		invalid,
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
	return {
		...mirrorInputTypography(source),
		lineHeight: 1
	};
}
function CalligraphNumber({ contentRef, layoutKey, settings = DEFAULT_CALLIGRAPH_SETTINGS, style, trend = 0, value }) {
	const shouldReduceMotion = useReducedMotion();
	const { body, sign } = splitSignedDisplayValue(value);
	const animation = settings.animation === "default" ? void 0 : settings.animation;
	if (shouldReduceMotion) return /* @__PURE__ */ jsx("span", {
		ref: contentRef,
		"data-slot": "scrub-number-calligraph-content",
		style,
		children: value
	});
	return /* @__PURE__ */ jsxs("span", {
		ref: contentRef,
		className: "inline-flex items-center justify-start",
		"data-slot": "scrub-number-calligraph-content",
		style,
		children: [sign ? /* @__PURE__ */ jsx("span", {
			"aria-hidden": "true",
			className: "inline-block",
			style,
			children: sign
		}) : null, /* @__PURE__ */ jsx(Calligraph, {
			animation,
			autoSize: settings.autoSize,
			className: "scrub-number-calligraph inline-flex items-center justify-start leading-none",
			stagger: settings.stagger,
			style,
			trend,
			variant: settings.variant,
			children: body
		}, layoutKey)]
	});
}
function getFieldClasses(inputClassName, extra) {
	return cn(scrubFieldVariants(), SCRUB_NUMBER_FIELD_CLASS, SCRUB_NUMBER_SPINNER_HIDE_CLASS, extra, inputClassName);
}
function ScrubNumberInput({ calligraph = DEFAULT_CALLIGRAPH_SETTINGS, className, disabled, grouped = false, inputClassName, inputSettings = DEFAULT_INPUT_SETTINGS, logo = DEFAULT_LOGO_SETTINGS, max, min, scrub, scrubSettings = DEFAULT_SCRUB_SETTINGS,...props }) {
	const scrubBounds = {
		min,
		max
	};
	const fieldClass = getFieldClasses(inputClassName);
	const ariaLabel = props["aria-label"];
	const mirrorRef = useRef(null);
	const calligraphClipRef = useRef(null);
	const calligraphContentRef = useRef(null);
	const [mirroredTypography, setMirroredTypography] = useState({});
	const prevTypographyRef = useRef("");
	const logoScrollEnabled = scrub.logoScrollEnabled;
	const usesInputGroup = logoScrollEnabled;
	const usesGroupedControl = grouped || logoScrollEnabled;
	const isDisplayTruncated = useDisplayOverflowTruncated(calligraphClipRef, [
		scrub.displayValue,
		mirroredTypography,
		scrub.editing,
		scrub.interactionEpoch
	], mirrorRef);
	const displaySpinbuttonProps = {
		...scrub.spinbuttonProps,
		...isDisplayTruncated ? { "aria-valuetext": scrub.displayValue } : {}
	};
	useLayoutEffect(() => {
		const syncMirroredTypography = () => {
			if (scrub.interactingRef.current) return;
			const source$1 = scrub.editing ? scrub.inputRef.current : mirrorRef.current;
			if (!source$1) return;
			const nextTypography = mirrorCalligraphTypography(source$1);
			const nextKey = JSON.stringify(nextTypography);
			const typographyChanged = nextKey !== prevTypographyRef.current;
			prevTypographyRef.current = nextKey;
			if (!typographyChanged) return;
			setMirroredTypography(nextTypography);
		};
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
		scrub.inputRef,
		scrub.interactingRef,
		scrub.interactionEpoch
	]);
	const groupControlClass = "relative z-[1] flex min-w-0 w-full flex-1 items-center justify-start overflow-hidden rounded-none border-0 bg-transparent text-foreground shadow-none dark:bg-transparent";
	const calligraphLayoutKey = usesGroupedControl ? "group" : "field";
	const scrubSurface = scrub.editing ? /* @__PURE__ */ jsx(Input, {
		...props,
		...scrub.inputProps,
		className: cn(fieldClass, usesGroupedControl ? "w-full rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent" : "relative z-[1] scrub-bound-field", "text-start"),
		disabled,
		"data-slot": usesGroupedControl ? "input-group-control" : void 0
	}) : /* @__PURE__ */ jsx("div", {
		ref: scrub.displaySurfaceRef,
		...logoScrollEnabled ? {} : scrub.scrubSurfaceHandlers,
		...displaySpinbuttonProps,
		"aria-label": typeof ariaLabel === "string" ? ariaLabel : void 0,
		"aria-invalid": scrub.invalid || void 0,
		className: cn(fieldClass, usesGroupedControl ? groupControlClass : cn("relative z-[1] flex items-center justify-start text-foreground scrub-bound-field"), !logoScrollEnabled && scrub.canScrub && getScrubCursorClass(scrubSettings, scrub.atBound, scrubBounds), !logoScrollEnabled && scrub.canScrub && "select-none", logoScrollEnabled && "cursor-text", disabled && "cursor-not-allowed opacity-50", scrub.invalid && "is-bound-error"),
		"data-slot": usesGroupedControl ? "input-group-control" : "scrub-number-scrubbable",
		tabIndex: disabled ? -1 : 0,
		title: isDisplayTruncated ? scrub.displayValue : void 0,
		onClick: logoScrollEnabled && !disabled ? () => {
			scrub.activateEdit();
		} : void 0,
		onBlur: scrub.onDisplayBlur,
		onFocus: scrub.onDisplayFocus,
		onKeyDown: scrub.handleDisplayKeyDown,
		children: /* @__PURE__ */ jsx(motion.div, {
			...grouped ? {} : { layoutRoot: true },
			ref: calligraphClipRef,
			className: cn("pointer-events-none relative flex w-full min-w-0 items-center justify-start overflow-hidden text-foreground"),
			"data-slot": "scrub-number-calligraph-value",
			style: mirroredTypography,
			children: /* @__PURE__ */ jsx(CalligraphNumber, {
				contentRef: calligraphContentRef,
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
		"data-logo-scroll": logoScrollEnabled ? "" : void 0,
		children: [fieldContent, logoScrollEnabled ? /* @__PURE__ */ jsx(InputGroupAddon, {
			align: "inline-end",
			...scrub.logoScrubHandlers,
			className: cn("shrink-0 select-none pr-1.5", scrub.canScrub && getScrubCursorClass(scrubSettings, scrub.atBound, scrubBounds)),
			"data-slot": "scrub-number-logo-scroll",
			onClick: (event) => {
				event.preventDefault();
			},
			children: /* @__PURE__ */ jsx(ScrubLogoIcon, {
				className: "pointer-events-none size-3.5 shrink-0 text-muted-foreground",
				name: logo.icon
			})
		}) : null]
	});
	return /* @__PURE__ */ jsx("div", {
		ref: scrub.surfaceRef,
		className: cn("relative shrink-0", className),
		children: /* @__PURE__ */ jsx(ScrubBoundFeedback, {
			boundFeedback: scrub.boundFeedback,
			className: usesInputGroup || grouped ? "w-full min-w-0" : void 0,
			mode: scrubSettings.boundFeedback,
			onFeedbackComplete: scrub.clearBoundFeedback,
			children: usesInputGroup ? inputGroup : fieldContent
		})
	});
}
function ScrubNumberField({ allowWheelScrub = false, boundFeedback = "none", calligraph = DEFAULT_CALLIGRAPH_SETTINGS, className, defaultResetValue, defaultValue, direction = "horizontal", disabled, format, formatValue: formatValueProp, grouped = false, inputSettings = DEFAULT_INPUT_SETTINGS, label, labelClassName, largeStep = 10, logo = DEFAULT_LOGO_SETTINGS, max, min, onValueChange, onValueCommitted, pixelSensitivity = 2, smallStep = .1, step = 1, value: valueProp, inputClassName,...props }) {
	const { min: normalizedMin, max: normalizedMax } = normalizeNumberFieldBounds(min, max);
	const [value, setValue] = useControllableState({
		prop: valueProp,
		defaultProp: defaultValue ?? 0,
		onChange: onValueChange,
		caller: "ScrubNumberField"
	});
	const resetValue = defaultResetValue ?? defaultValue;
	const scrubSettings = flatSettingsToScrubSettings({
		allowWheelScrub,
		boundFeedback,
		direction,
		largeStep,
		pixelSensitivity,
		smallStep,
		step
	});
	const scrub = useNumberScrub({
		disabled,
		format: DEFAULT_FORMAT_SETTINGS,
		formatValue: formatValueProp ?? (format ? (nextValue) => new Intl.NumberFormat(void 0, format).format(nextValue) : void 0),
		logo,
		max: normalizedMax,
		min: normalizedMin,
		onChange: setValue,
		onValueCommit: onValueCommitted,
		defaultResetValue: resetValue,
		scrub: scrubSettings,
		selectOnEdit: inputSettings.selectOnEdit,
		shiftStep: largeStep,
		step,
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
			max: normalizedMax,
			min: normalizedMin,
			scrub,
			scrubSettings
		})
	});
	if (!label) return field;
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-3",
		children: [/* @__PURE__ */ jsx("span", {
			className: cn("w-16 text-sm font-medium text-muted-foreground", labelClassName),
			children: label
		}), field]
	});
}

//#endregion
export { BOUND_FEEDBACK_MODES, DEFAULT_CALLIGRAPH_SETTINGS, DEFAULT_INPUT_SETTINGS, DEFAULT_LOGO_SETTINGS, DEFAULT_SCRUB_FIELD_SETTINGS, LOGO_ICON_OPTIONS, ScrubLogoIcon, ScrubNumberField, clampNumber, getScrubCursorClass, normalizeScrubFieldSettings };