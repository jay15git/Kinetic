import * as React from "react";
import { createElement, useCallback, useEffect, useRef, useState } from "react";
import * as ReactDOM from "react-dom";
import { flushSync } from "react-dom";
import { jsx, jsxs } from "react/jsx-runtime";
import { Calligraph } from "calligraph";
import { GripHorizontal, GripVertical, Move, MoveHorizontal, MoveVertical, Percent } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { useControllableState } from "@/hooks/use-controllable-state";
import { useDisplayOverflowTruncated } from "@/lib/scrub-number-overflow";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/addEventListener.mjs
/**
* Adds an event listener and returns a cleanup function to remove it.
*/
function addEventListener(target, type, listener, options) {
	target.addEventListener(type, listener, options);
	return () => {
		target.removeEventListener(type, listener, options);
	};
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/error.mjs
let set$1;
if (process.env.NODE_ENV !== "production") set$1 = /* @__PURE__ */ new Set();
function error(...messages) {
	if (process.env.NODE_ENV !== "production") {
		const messageKey = messages.join(" ");
		if (!set$1.has(messageKey)) {
			set$1.add(messageKey);
			console.error(`Base UI: ${messageKey}`);
		}
	}
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/useControlled.mjs
function useControlled({ controlled, default: defaultProp, name, state = "value" }) {
	const { current: isControlled } = React.useRef(controlled !== void 0);
	const [valueState, setValue] = React.useState(defaultProp);
	const value = isControlled ? controlled : valueState;
	if (process.env.NODE_ENV !== "production") {
		React.useEffect(() => {
			if (isControlled !== (controlled !== void 0)) error([
				`A component is changing the ${isControlled ? "" : "un"}controlled ${state} state of ${name} to be ${isControlled ? "un" : ""}controlled.`,
				"Elements should not switch from uncontrolled to controlled (or vice versa).",
				`Decide between using a controlled or uncontrolled ${name} element for the lifetime of the component.`,
				"The nature of the state is determined during the first render. It's considered controlled if the value is not `undefined`.",
				"More info: https://fb.me/react-controlled-components"
			].join("\n"));
		}, [
			state,
			name,
			controlled
		]);
		const { current: defaultValue } = React.useRef(defaultProp);
		React.useEffect(() => {
			if (!isControlled && serializeToDevModeString(defaultValue) !== serializeToDevModeString(defaultProp)) error([`A component is changing the default ${state} state of an uncontrolled ${name} after being initialized. To suppress this warning opt to use a controlled ${name}.`].join("\n"));
		}, [defaultProp]);
	}
	return [value, React.useCallback((newValue) => {
		if (!isControlled) setValue(newValue);
	}, [])];
}
function serializeToDevModeString(input) {
	let nextId = 0;
	const seen = /* @__PURE__ */ new WeakMap();
	try {
		return JSON.stringify(input, function replacer(key, value) {
			if (key === "_owner" && this != null && typeof this === "object" && "$$typeof" in this) return;
			if (typeof value === "bigint") return `__bigint__:${value}`;
			if (value !== null && typeof value === "object") {
				const id = seen.get(value);
				if (id !== void 0) return `__object__:${id}`;
				seen.set(value, nextId);
				nextId += 1;
			}
			return value;
		}) ?? `__top__:${typeof input}`;
	} catch {
		return "__unserializable__";
	}
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/safeReact.mjs
/**
* A clone of the React namespace for reading APIs that may be missing in older
* supported React versions. Bundlers can rewrite direct `React.someNewApi`
* reads into named imports, which breaks React 17. Reading from this cloned
* object keeps those lookups optional.
*
* @see https://github.com/mui/material-ui/issues/41190#issuecomment-2040873379
*/
const SafeReact = { ...React };

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/useRefWithInit.mjs
const UNINITIALIZED = {};
/**
* A React.useRef() that is initialized with a function. Note that it accepts an optional
* initialization argument, so the initialization function doesn't need to be an inline closure.
*
* @usage
*   const ref = useRefWithInit(sortColumns, columns)
*/
function useRefWithInit(init, initArg) {
	const ref = React.useRef(UNINITIALIZED);
	if (ref.current === UNINITIALIZED) ref.current = init(initArg);
	return ref;
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/useStableCallback.mjs
const useInsertionEffect = SafeReact.useInsertionEffect;
const useSafeInsertionEffect = useInsertionEffect && useInsertionEffect !== SafeReact.useLayoutEffect ? useInsertionEffect : (fn) => fn();
/**
* Stabilizes the function passed so it's always the same between renders.
*
* The function becomes non-reactive to any values it captures.
* It can safely be passed as a dependency of `React.useMemo` and `React.useEffect` without re-triggering them if its captured values change.
*
* The function must only be called inside effects and event handlers, never during render (which throws an error).
*
* This hook is a more permissive version of React 19.2's `React.useEffectEvent` in that it can be passed through contexts and called in event handler props, not just effects.
*/
function useStableCallback(callback) {
	const stable = useRefWithInit(createStableCallback).current;
	stable.next = callback;
	useSafeInsertionEffect(stable.effect);
	return stable.trampoline;
}
function createStableCallback() {
	const stable = {
		next: void 0,
		callback: assertNotCalled,
		trampoline: (...args) => stable.callback?.(...args),
		effect: () => {
			stable.callback = stable.next;
		}
	};
	return stable;
}
function assertNotCalled() {
	if (process.env.NODE_ENV !== "production") throw new Error("Base UI: Cannot call an event handler while rendering.");
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/useIsoLayoutEffect.mjs
const noop = () => {};
const useIsoLayoutEffect = typeof document !== "undefined" ? React.useLayoutEffect : noop;

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/useValueAsRef.mjs
/**
* Untracks the provided value by turning it into a ref to remove its reactivity.
*
* Used to access the passed value inside `React.useEffect` without causing the effect to re-run when the value changes.
*/
function useValueAsRef(value) {
	const latest = useRefWithInit(createLatestRef, value).current;
	latest.next = value;
	useIsoLayoutEffect(latest.effect);
	return latest;
}
function createLatestRef(value) {
	const latest = {
		current: value,
		next: value,
		effect: () => {
			latest.current = latest.next;
		}
	};
	return latest;
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/useForcedRerendering.mjs
/**
* Returns a function that forces a rerender.
*/
function useForcedRerendering() {
	const [, setState] = React.useState({});
	return React.useCallback(() => {
		setState({});
	}, []);
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/useMergedRefs.mjs
/**
* Merges refs into a single memoized callback ref or `null`.
* This makes sure multiple refs are updated together and have the same value.
*
* This function accepts up to four refs. If you need to merge more, or have an unspecified number of refs to merge,
* use `useMergedRefsN` instead.
*/
function useMergedRefs(a, b, c, d) {
	const forkRef = useRefWithInit(createForkRef).current;
	if (didChange(forkRef, a, b, c, d)) update(forkRef, [
		a,
		b,
		c,
		d
	]);
	return forkRef.callback;
}
/**
* Merges an array of refs into a single memoized callback ref or `null`.
*
* If you need to merge a fixed number (up to four) of refs, use `useMergedRefs` instead for better performance.
*/
function useMergedRefsN(refs) {
	const forkRef = useRefWithInit(createForkRef).current;
	if (didChangeN(forkRef, refs)) update(forkRef, refs);
	return forkRef.callback;
}
function createForkRef() {
	return {
		callback: null,
		cleanup: null,
		refs: []
	};
}
function didChange(forkRef, a, b, c, d) {
	return forkRef.refs[0] !== a || forkRef.refs[1] !== b || forkRef.refs[2] !== c || forkRef.refs[3] !== d;
}
function didChangeN(forkRef, newRefs) {
	return forkRef.refs.length !== newRefs.length || forkRef.refs.some((ref, index) => ref !== newRefs[index]);
}
function update(forkRef, refs) {
	forkRef.refs = refs;
	if (refs.every((ref) => ref == null)) {
		forkRef.callback = null;
		return;
	}
	forkRef.callback = (instance) => {
		if (forkRef.cleanup) {
			forkRef.cleanup();
			forkRef.cleanup = null;
		}
		if (instance != null) {
			const cleanupCallbacks = Array(refs.length).fill(null);
			for (let i = 0; i < refs.length; i += 1) {
				const ref = refs[i];
				if (ref == null) continue;
				switch (typeof ref) {
					case "function": {
						const refCleanup = ref(instance);
						if (typeof refCleanup === "function") cleanupCallbacks[i] = refCleanup;
						break;
					}
					case "object":
						ref.current = instance;
						break;
					default:
				}
			}
			forkRef.cleanup = () => {
				for (let i = 0; i < refs.length; i += 1) {
					const ref = refs[i];
					if (ref == null) continue;
					switch (typeof ref) {
						case "function": {
							const cleanupCallback = cleanupCallbacks[i];
							if (typeof cleanupCallback === "function") cleanupCallback();
							else ref(null);
							break;
						}
						case "object":
							ref.current = null;
							break;
						default:
					}
				}
			};
		}
	};
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/visuallyHidden.mjs
const visuallyHiddenBase = {
	clipPath: "inset(50%)",
	overflow: "hidden",
	whiteSpace: "nowrap",
	border: 0,
	padding: 0,
	width: 1,
	height: 1,
	margin: -1
};
const visuallyHidden = {
	...visuallyHiddenBase,
	position: "fixed",
	top: 0,
	left: 0
};
const visuallyHiddenInput = {
	...visuallyHiddenBase,
	position: "absolute"
};

//#endregion
//#region ../../node_modules/.pnpm/@floating-ui+utils@0.2.11/node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function hasWindow() {
	return typeof window !== "undefined";
}
function getWindow(node) {
	var _node$ownerDocument;
	return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function isElement(value) {
	if (!hasWindow()) return false;
	return value instanceof Element || value instanceof getWindow(value).Element;
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/owner.mjs
function ownerDocument(node) {
	return node?.ownerDocument || document;
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/platform/shared.mjs
/**
* Reads `navigator.userAgent` / `navigator.platform` (legacy but universally
* supported) into a normalized shape. In development, prefers the modern
* `navigator.userAgentData` API on Chromium to avoid DevTools warnings about
* the deprecated reads; that branch is dead-code-eliminated in production
* builds to keep the bundle small.
*
* Returns empty/zero values when `navigator` is undefined (SSR), so every
* derived flag safely evaluates to `false`.
*/
function readRawData() {
	if (typeof navigator === "undefined") return {
		userAgent: "",
		platform: "",
		maxTouchPoints: 0
	};
	if (process.env.NODE_ENV !== "production") {
		const uaData = navigator.userAgentData;
		if (uaData && Array.isArray(uaData.brands)) return {
			userAgent: uaData.brands.map(({ brand, version }) => `${brand}/${version}`).join(" "),
			platform: uaData.platform ?? navigator.platform ?? "",
			maxTouchPoints: navigator.maxTouchPoints ?? 0
		};
	}
	return {
		userAgent: navigator.userAgent,
		platform: navigator.platform ?? "",
		maxTouchPoints: navigator.maxTouchPoints ?? 0
	};
}
const { userAgent, platform, maxTouchPoints } = readRawData();
const lowerUserAgent = userAgent.toLowerCase();
const lowerPlatform = platform.toLowerCase();

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/platform/os.mjs
/** iPhone, iPad (including iPadOS 13+ reporting as macOS), iPod. */
const ios = /^i(os$|p)/.test(lowerPlatform) || lowerPlatform === "macintel" && maxTouchPoints > 1;
/** Android phones, tablets, and embedded Android browsers. */
const ANDROID_STRING = "android";
const android = lowerPlatform === ANDROID_STRING || lowerUserAgent.includes(ANDROID_STRING);
/** macOS desktop. Excludes iPadOS, which reports as `MacIntel`. */
const mac = !ios && lowerPlatform.startsWith("mac");
/** Windows desktop. */
const windows = lowerPlatform.startsWith("win");
/** Linux desktop (including Chrome OS). */
const linux = !android && /^(linux|chrome os)/.test(lowerPlatform);

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/platform/engine.mjs
/** WebKit: Safari, all iOS browsers, GNOME Web. Excludes Blink. */
const webkit = typeof CSS !== "undefined" && !!CSS.supports?.("-webkit-backdrop-filter:none");
/** Gecko: Firefox. */
const gecko = !webkit && lowerUserAgent.includes("firefox");
/** Blink: Chrome, Edge, Opera, Brave, and other Chromium-based browsers. */
const blink = !webkit && lowerUserAgent.includes("chrom");

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/internals/shadowDom.mjs
function activeElement(doc) {
	let element = doc.activeElement;
	while (element?.shadowRoot?.activeElement != null) element = element.shadowRoot.activeElement;
	return element;
}
function getTarget(event) {
	if ("composedPath" in event) return event.composedPath()[0];
	return event.target;
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/floating-ui-react/utils/event.mjs
function stopEvent(event) {
	event.preventDefault();
	event.stopPropagation();
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/formatErrorMessage.mjs
/**
* Creates a formatErrorMessage function with a custom URL and prefix.
* @param baseUrl - The base URL for the error page (e.g., 'https://base-ui.com/production-error')
* @param prefix - The prefix for the error message (e.g., 'Base UI')
* @returns A function that formats error messages with the given URL and prefix
*/
function createFormatErrorMessage(baseUrl, prefix) {
	return function formatErrorMessage$1(code, ...args) {
		const url = new URL(baseUrl);
		url.searchParams.set("code", code.toString());
		args.forEach((arg) => url.searchParams.append("args[]", arg));
		return `${prefix} error #${code}; visit ${url} for the full message.`;
	};
}
/**
* WARNING: Don't import this directly. It's imported by the code generated by
* `@mui/internal-babel-plugin-minify-errors`. Make sure to always use string literals in `Error`
* constructors to ensure the plugin works as expected. Supported patterns include:
*   throw new Error('My message');
*   throw new Error(`My message: ${foo}`);
*   throw new Error(`My message: ${foo}` + 'another string');
*   ...
*/
const formatErrorMessage = createFormatErrorMessage("https://base-ui.com/production-error", "Base UI");
var formatErrorMessage_default = formatErrorMessage;

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/number-field/root/NumberFieldRootContext.mjs
const NumberFieldRootContext = /* @__PURE__ */ React.createContext(void 0);
if (process.env.NODE_ENV !== "production") NumberFieldRootContext.displayName = "NumberFieldRootContext";
function useNumberFieldRootContext() {
	const context = React.useContext(NumberFieldRootContext);
	if (context === void 0) throw new Error(process.env.NODE_ENV !== "production" ? "Base UI: NumberFieldRootContext is missing. NumberField parts must be placed within <NumberField.Root>." : formatErrorMessage_default(43));
	return context;
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/empty.mjs
function NOOP() {}
const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_OBJECT = Object.freeze({});

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/field/control/FieldControlDataAttributes.mjs
let FieldControlDataAttributes = /* @__PURE__ */ function(FieldControlDataAttributes$1) {
	/**
	* Present when the field is disabled.
	*/
	FieldControlDataAttributes$1["disabled"] = "data-disabled";
	/**
	* Present when the field is in a valid state.
	*/
	FieldControlDataAttributes$1["valid"] = "data-valid";
	/**
	* Present when the field is in an invalid state.
	*/
	FieldControlDataAttributes$1["invalid"] = "data-invalid";
	/**
	* Present when the field has been touched.
	*/
	FieldControlDataAttributes$1["touched"] = "data-touched";
	/**
	* Present when the field's value has changed.
	*/
	FieldControlDataAttributes$1["dirty"] = "data-dirty";
	/**
	* Present when the field is filled.
	*/
	FieldControlDataAttributes$1["filled"] = "data-filled";
	/**
	* Present when the field control is focused.
	*/
	FieldControlDataAttributes$1["focused"] = "data-focused";
	return FieldControlDataAttributes$1;
}({});

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/internals/field-constants/constants.mjs
const DEFAULT_VALIDITY_STATE = {
	badInput: false,
	customError: false,
	patternMismatch: false,
	rangeOverflow: false,
	rangeUnderflow: false,
	stepMismatch: false,
	tooLong: false,
	tooShort: false,
	typeMismatch: false,
	valid: null,
	valueMissing: false
};
const DEFAULT_FIELD_STATE_ATTRIBUTES = {
	valid: null,
	touched: false,
	dirty: false,
	filled: false,
	focused: false
};
const DEFAULT_FIELD_ROOT_STATE = {
	disabled: false,
	...DEFAULT_FIELD_STATE_ATTRIBUTES
};
const fieldValidityMapping = { valid(value) {
	if (value === null) return null;
	if (value) return { [FieldControlDataAttributes.valid]: "" };
	return { [FieldControlDataAttributes.invalid]: "" };
} };

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/internals/field-root-context/FieldRootContext.mjs
const DEFAULT_FIELD_ROOT_CONTEXT = {
	invalid: void 0,
	name: void 0,
	validityData: {
		state: DEFAULT_VALIDITY_STATE,
		errors: [],
		error: "",
		value: "",
		initialValue: null
	},
	setValidityData: NOOP,
	disabled: void 0,
	touched: DEFAULT_FIELD_STATE_ATTRIBUTES.touched,
	setTouched: NOOP,
	dirty: DEFAULT_FIELD_STATE_ATTRIBUTES.dirty,
	setDirty: NOOP,
	filled: DEFAULT_FIELD_STATE_ATTRIBUTES.filled,
	setFilled: NOOP,
	focused: DEFAULT_FIELD_STATE_ATTRIBUTES.focused,
	setFocused: NOOP,
	validate: () => null,
	validationMode: "onSubmit",
	validationDebounceTime: 0,
	shouldValidateOnChange: () => false,
	state: DEFAULT_FIELD_ROOT_STATE,
	markedDirtyRef: { current: false },
	registerFieldControl: NOOP,
	validation: {
		getValidationProps: (_disabled, props = EMPTY_OBJECT) => props,
		inputRef: { current: null },
		registerInput: NOOP,
		commit: async () => {},
		change: NOOP
	}
};
const FieldRootContext = /* @__PURE__ */ React.createContext(DEFAULT_FIELD_ROOT_CONTEXT);
if (process.env.NODE_ENV !== "production") FieldRootContext.displayName = "FieldRootContext";
function useFieldRootContext(optional = true) {
	const context = React.useContext(FieldRootContext);
	if (context.setValidityData === NOOP && !optional) throw new Error(process.env.NODE_ENV !== "production" ? "Base UI: FieldRootContext is missing. Field parts must be placed within <Field.Root>." : formatErrorMessage_default(28));
	return context;
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/internals/form-context/FormContext.mjs
const FormContext = /* @__PURE__ */ React.createContext({
	formRef: { current: { fields: /* @__PURE__ */ new Map() } },
	errors: {},
	clearErrors: NOOP,
	validationMode: "onSubmit",
	submitAttemptedRef: { current: false }
});
if (process.env.NODE_ENV !== "production") FormContext.displayName = "FormContext";
function useFormContext() {
	return React.useContext(FormContext);
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/useId.mjs
let globalId = 0;
function useGlobalId(idOverride, prefix = "mui") {
	const [defaultId, setDefaultId] = React.useState(idOverride);
	const id = idOverride || defaultId;
	React.useEffect(() => {
		if (defaultId == null) {
			globalId += 1;
			setDefaultId(`${prefix}-${globalId}`);
		}
	}, [defaultId, prefix]);
	return id;
}
const maybeReactUseId = SafeReact.useId;
/**
*
* @example <div id={useId()} />
* @param idOverride
* @returns {string}
*/
function useId(idOverride, prefix) {
	if (maybeReactUseId !== void 0) {
		const reactId = maybeReactUseId();
		return idOverride ?? (prefix ? `${prefix}-${reactId}` : reactId);
	}
	return useGlobalId(idOverride, prefix);
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/internals/useBaseUiId.mjs
/**
* Wraps `useId` and prefixes generated `id`s with `base-ui-`
* @param {string | undefined} idOverride overrides the generated id when provided
* @returns {string | undefined}
*/
function useBaseUiId(idOverride) {
	return useId(idOverride, "base-ui");
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/internals/labelable-provider/LabelableContext.mjs
/**
* A context for providing [labelable elements](https://html.spec.whatwg.org/multipage/forms.html#category-label)\
* with an accessible name (label) and description.
*/
const LabelableContext = /* @__PURE__ */ React.createContext({
	controlId: void 0,
	registerControlId: NOOP,
	labelId: void 0,
	setLabelId: NOOP,
	messageIds: [],
	setMessageIds: NOOP,
	getDescriptionProps: (externalProps) => externalProps
});
if (process.env.NODE_ENV !== "production") LabelableContext.displayName = "LabelableContext";
function useLabelableContext() {
	return React.useContext(LabelableContext);
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/internals/labelable-provider/useLabelableId.mjs
function useLabelableId(params = {}) {
	const { id, implicit = false, controlRef } = params;
	const { controlId, registerControlId } = useLabelableContext();
	const defaultId = useBaseUiId(id);
	const controlIdForEffect = implicit ? controlId : void 0;
	const controlSourceRef = useRefWithInit(() => Symbol("labelable-control"));
	const hasRegisteredRef = React.useRef(false);
	const hadExplicitIdRef = React.useRef(id != null);
	const unregisterControlId = useStableCallback(() => {
		if (!hasRegisteredRef.current || registerControlId === NOOP) return;
		hasRegisteredRef.current = false;
		registerControlId(controlSourceRef.current, void 0);
	});
	useIsoLayoutEffect(() => {
		if (registerControlId === NOOP) return;
		let nextId;
		if (implicit) {
			const elem = controlRef?.current;
			if (isElement(elem) && elem.closest("label") != null) nextId = id ?? null;
			else nextId = controlIdForEffect ?? defaultId;
		} else if (id != null) {
			hadExplicitIdRef.current = true;
			nextId = id;
		} else if (hadExplicitIdRef.current) nextId = defaultId;
		else {
			unregisterControlId();
			return;
		}
		if (nextId === void 0) {
			unregisterControlId();
			return;
		}
		hasRegisteredRef.current = true;
		registerControlId(controlSourceRef.current, nextId);
	}, [
		id,
		controlRef,
		controlIdForEffect,
		registerControlId,
		implicit,
		defaultId,
		controlSourceRef,
		unregisterControlId
	]);
	React.useEffect(() => {
		return unregisterControlId;
	}, [unregisterControlId]);
	return controlId ?? defaultId;
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/number-field/utils/stateAttributesMapping.mjs
const stateAttributesMapping = {
	inputValue: () => null,
	value: () => null,
	...fieldValidityMapping
};

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/reactVersion.mjs
const majorVersion = parseInt(React.version, 10);
function isReactVersionAtLeast(reactVersionToCheck) {
	return majorVersion >= reactVersionToCheck;
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/getReactElementRef.mjs
/**
* Extracts the `ref` from a React element, handling different React versions.
*/
function getReactElementRef(element) {
	if (!/* @__PURE__ */ React.isValidElement(element)) return null;
	const reactElement = element;
	const propsWithRef = reactElement.props;
	return (isReactVersionAtLeast(19) ? propsWithRef?.ref : reactElement.ref) ?? null;
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/mergeObjects.mjs
function mergeObjects(a, b) {
	if (a && !b) return a;
	if (!a && b) return b;
	if (a || b) return {
		...a,
		...b
	};
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/warn.mjs
let set;
if (process.env.NODE_ENV !== "production") set = /* @__PURE__ */ new Set();
function warn(...messages) {
	if (process.env.NODE_ENV !== "production") {
		const messageKey = messages.join(" ");
		if (!set.has(messageKey)) {
			set.add(messageKey);
			console.warn(`Base UI: ${messageKey}`);
		}
	}
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/internals/getStateAttributesProps.mjs
function getStateAttributesProps(state, customMapping) {
	const props = {};
	for (const key in state) {
		const value = state[key];
		if (customMapping?.hasOwnProperty(key)) {
			const customProps = customMapping[key](value);
			if (customProps != null) Object.assign(props, customProps);
			continue;
		}
		if (value === true) props[`data-${key.toLowerCase()}`] = "";
		else if (value) props[`data-${key.toLowerCase()}`] = value.toString();
	}
	return props;
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/utils/resolveClassName.mjs
/**
* If the provided className is a string, it will be returned as is.
* Otherwise, the function will call the className function with the state as the first argument.
*
* @param className
* @param state
*/
function resolveClassName(className, state) {
	return typeof className === "function" ? className(state) : className;
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/utils/resolveStyle.mjs
/**
* If the provided style is an object, it will be returned as is.
* Otherwise, the function will call the style function with the state as the first argument.
*
* @param style
* @param state
*/
function resolveStyle(style, state) {
	return typeof style === "function" ? style(state) : style;
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/merge-props/mergeProps.mjs
const EMPTY_PROPS = {};
/**
* Merges multiple sets of React props. It follows the Object.assign pattern where the rightmost object's fields overwrite
* the conflicting ones from others. This doesn't apply to event handlers, `className` and `style` props.
*
* Event handlers are merged and called in right-to-left order (rightmost handler executes first, leftmost last).
* For React synthetic events, the rightmost handler can prevent prior (left-positioned) handlers from executing
* by calling `event.preventBaseUIHandler()`. For non-synthetic events (custom events with primitive/object values),
* all handlers always execute without prevention capability.
*
* The `className` prop is merged by concatenating classes in right-to-left order (rightmost class appears first in the string).
* The `style` prop is merged with rightmost styles overwriting the prior ones.
*
* Props can either be provided as objects or as functions that take the previous props as an argument.
* The function will receive the merged props up to that point (going from left to right):
* so in the case of `(obj1, obj2, fn, obj3)`, `fn` will receive the merged props of `obj1` and `obj2`.
* The function is responsible for chaining event handlers if needed (that is, we don't run the merge logic).
*
* Event handlers returned by the functions are not automatically prevented when `preventBaseUIHandler` is called.
* They must check `event.baseUIHandlerPrevented` themselves and bail out if it's true.
*
* @important **`ref` is not merged.**
* @param a Props object to merge.
* @param b Props object to merge. The function will overwrite conflicting props from `a`.
* @param c Props object to merge. The function will overwrite conflicting props from previous parameters.
* @param d Props object to merge. The function will overwrite conflicting props from previous parameters.
* @param e Props object to merge. The function will overwrite conflicting props from previous parameters.
* @returns The merged props.
* @public
*/
function mergeProps(a, b, c, d, e) {
	if (!c && !d && !e && !a) return createInitialMergedProps(b);
	let merged = createInitialMergedProps(a);
	if (b) merged = mergeInto(merged, b);
	if (c) merged = mergeInto(merged, c);
	if (d) merged = mergeInto(merged, d);
	if (e) merged = mergeInto(merged, e);
	return merged;
}
/**
* Merges an arbitrary number of React props using the same logic as {@link mergeProps}.
* This function accepts an array of props instead of individual arguments.
*
* This has slightly lower performance than {@link mergeProps} due to accepting an array
* instead of a fixed number of arguments. Prefer {@link mergeProps} when merging 5 or
* fewer prop sets for better performance.
*
* @param props Array of props to merge.
* @returns The merged props.
* @see mergeProps
* @public
*/
function mergePropsN(props) {
	if (props.length === 0) return EMPTY_PROPS;
	if (props.length === 1) return createInitialMergedProps(props[0]);
	let merged = createInitialMergedProps(props[0]);
	for (let i = 1; i < props.length; i += 1) merged = mergeInto(merged, props[i]);
	return merged;
}
function createInitialMergedProps(inputProps) {
	if (isPropsGetter(inputProps)) return { ...resolvePropsGetter(inputProps, EMPTY_PROPS) };
	return copyInitialProps(inputProps);
}
function mergeInto(merged, inputProps) {
	if (isPropsGetter(inputProps)) return resolvePropsGetter(inputProps, merged);
	return mutablyMergeInto(merged, inputProps);
}
function copyInitialProps(inputProps) {
	const copiedProps = { ...inputProps };
	for (const propName in copiedProps) {
		const propValue = copiedProps[propName];
		if (isEventHandler(propName, propValue)) copiedProps[propName] = wrapEventHandler(propValue);
	}
	return copiedProps;
}
/**
* Merges two sets of props. In case of conflicts, the external props take precedence.
*/
function mutablyMergeInto(mergedProps, externalProps) {
	if (!externalProps) return mergedProps;
	for (const propName in externalProps) {
		const externalPropValue = externalProps[propName];
		switch (propName) {
			case "style":
				mergedProps[propName] = mergeObjects(mergedProps.style, externalPropValue);
				break;
			case "className":
				mergedProps[propName] = mergeClassNames(mergedProps.className, externalPropValue);
				break;
			default: if (isEventHandler(propName, externalPropValue)) mergedProps[propName] = mergeEventHandlers(mergedProps[propName], externalPropValue);
			else mergedProps[propName] = externalPropValue;
		}
	}
	return mergedProps;
}
function isEventHandler(key, value) {
	const code0 = key.charCodeAt(0);
	const code1 = key.charCodeAt(1);
	const code2 = key.charCodeAt(2);
	return code0 === 111 && code1 === 110 && code2 >= 65 && code2 <= 90 && (typeof value === "function" || typeof value === "undefined");
}
function isPropsGetter(inputProps) {
	return typeof inputProps === "function";
}
function resolvePropsGetter(inputProps, previousProps) {
	if (isPropsGetter(inputProps)) return inputProps(previousProps);
	return inputProps ?? EMPTY_PROPS;
}
function mergeEventHandlers(ourHandler, theirHandler) {
	if (!theirHandler) return ourHandler;
	if (!ourHandler) return wrapEventHandler(theirHandler);
	return (...args) => {
		const event = args[0];
		if (isSyntheticEvent(event)) {
			const baseUIEvent = event;
			makeEventPreventable(baseUIEvent);
			const result$1 = theirHandler(...args);
			if (!baseUIEvent.baseUIHandlerPrevented) ourHandler?.(...args);
			return result$1;
		}
		const result = theirHandler(...args);
		ourHandler?.(...args);
		return result;
	};
}
function wrapEventHandler(handler) {
	if (!handler) return handler;
	return (...args) => {
		const event = args[0];
		if (isSyntheticEvent(event)) makeEventPreventable(event);
		return handler(...args);
	};
}
function makeEventPreventable(event) {
	event.preventBaseUIHandler = () => {
		event.baseUIHandlerPrevented = true;
	};
	return event;
}
function mergeClassNames(ourClassName, theirClassName) {
	if (theirClassName) {
		if (ourClassName) return theirClassName + " " + ourClassName;
		return theirClassName;
	}
	return ourClassName;
}
function isSyntheticEvent(event) {
	return event != null && typeof event === "object" && "nativeEvent" in event;
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/internals/useRenderElement.mjs
/**
* Renders a Base UI element.
*
* @param element The default HTML element to render. Can be overridden by the `render` prop.
* @param componentProps An object containing the `render` and `className` props to be used for element customization. Other props are ignored.
* @param params Additional parameters for rendering the element.
*/
function useRenderElement(element, componentProps, params = {}) {
	const renderProp = componentProps.render;
	const outProps = useRenderElementProps(componentProps, params);
	if (params.enabled === false) return null;
	return evaluateRenderProp(element, renderProp, outProps, params.state ?? EMPTY_OBJECT);
}
/**
* Computes render element final props.
*/
function useRenderElementProps(componentProps, params = {}) {
	const { className: classNameProp, style: styleProp, render: renderProp } = componentProps;
	const { state = EMPTY_OBJECT, ref, props, stateAttributesMapping: stateAttributesMapping$1, enabled = true } = params;
	const className = enabled ? resolveClassName(classNameProp, state) : void 0;
	const style = enabled ? resolveStyle(styleProp, state) : void 0;
	const stateProps = enabled ? getStateAttributesProps(state, stateAttributesMapping$1) : EMPTY_OBJECT;
	const resolvedProps = enabled && props ? resolveRenderFunctionProps(props) : void 0;
	const outProps = enabled ? mergeObjects(stateProps, resolvedProps) ?? {} : EMPTY_OBJECT;
	if (typeof document !== "undefined") if (!enabled) useMergedRefs(null, null);
	else if (Array.isArray(ref)) outProps.ref = useMergedRefsN([
		outProps.ref,
		getReactElementRef(renderProp),
		...ref
	]);
	else outProps.ref = useMergedRefs(outProps.ref, getReactElementRef(renderProp), ref);
	if (!enabled) return EMPTY_OBJECT;
	if (className !== void 0) outProps.className = mergeClassNames(outProps.className, className);
	if (style !== void 0) outProps.style = mergeObjects(outProps.style, style);
	return outProps;
}
function resolveRenderFunctionProps(props) {
	if (Array.isArray(props)) return mergePropsN(props);
	return mergeProps(void 0, props);
}
const REACT_LAZY_TYPE = Symbol.for("react.lazy");
const COMPONENT_IDENTIFIER_PATTERN = /^[A-Z][A-Za-z0-9$]*$/;
const LOWERCASE_CHARACTER_PATTERN = /[a-z]/;
function evaluateRenderProp(element, render, props, state) {
	if (render) {
		if (typeof render === "function") {
			if (process.env.NODE_ENV !== "production") warnIfRenderPropLooksLikeComponent(render);
			return render(props, state);
		}
		const mergedProps = mergeProps(props, render.props);
		mergedProps.ref = props.ref;
		let newElement = render;
		if (newElement?.$$typeof === REACT_LAZY_TYPE) newElement = React.Children.toArray(render)[0];
		if (process.env.NODE_ENV !== "production") {
			if (!/* @__PURE__ */ React.isValidElement(newElement)) throw new Error([
				"Base UI: The `render` prop was provided an invalid React element as `React.isValidElement(render)` is `false`.",
				"A valid React element must be provided to the `render` prop because it is cloned with props to replace the default element.",
				"https://base-ui.com/r/invalid-render-prop"
			].join("\n"));
		}
		return /* @__PURE__ */ React.cloneElement(newElement, mergedProps);
	}
	if (element) {
		if (typeof element === "string") return renderTag(element, props);
	}
	throw new Error(process.env.NODE_ENV !== "production" ? "Base UI: Render element or function are not defined." : formatErrorMessage_default(8));
}
function warnIfRenderPropLooksLikeComponent(renderFn) {
	const functionName = renderFn.name;
	if (functionName.length === 0) return;
	if (!COMPONENT_IDENTIFIER_PATTERN.test(functionName)) return;
	if (!LOWERCASE_CHARACTER_PATTERN.test(functionName)) return;
	warn(`The \`render\` prop received a function named \`${functionName}\` that starts with an uppercase letter.`, "This usually means a React component was passed directly as `render={Component}`.", "Base UI calls `render` as a plain function, which can break the Rules of Hooks during reconciliation.", "If this is an intentional render callback, rename it to start with a lowercase letter.", "Use `render={<Component />}` or `render={(props) => <Component {...props} />}` instead.", "https://base-ui.com/r/invalid-render-prop");
}
function renderTag(Tag, props) {
	if (Tag === "button") return /* @__PURE__ */ createElement("button", {
		type: "button",
		...props,
		key: props.key
	});
	if (Tag === "img") return /* @__PURE__ */ createElement("img", {
		alt: "",
		...props,
		key: props.key
	});
	return /* @__PURE__ */ React.createElement(Tag, props);
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/utils/stringifyLocale.mjs
function stringifyLocale(locale) {
	if (Array.isArray(locale)) return locale.map((value) => stringifyLocale(value)).join(",");
	if (locale == null) return "";
	return String(locale);
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/utils/formatNumber.mjs
const cache = /* @__PURE__ */ new Map();
function getFormatter(locale, options) {
	const optionsString = JSON.stringify({
		locale: stringifyLocale(locale),
		options
	});
	const cachedFormatter = cache.get(optionsString);
	if (cachedFormatter) return cachedFormatter;
	const formatter = new Intl.NumberFormat(locale, options);
	cache.set(optionsString, formatter);
	return formatter;
}
function formatNumber(value, locale, options) {
	if (value == null) return "";
	return getFormatter(locale, options).format(value);
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/number-field/utils/parse.mjs
const HAN_NUMERALS = [
	"零",
	"〇",
	"一",
	"二",
	"三",
	"四",
	"五",
	"六",
	"七",
	"八",
	"九"
];
const HAN_NUMERAL_TO_DIGIT = {
	零: "0",
	〇: "0",
	一: "1",
	二: "2",
	三: "3",
	四: "4",
	五: "5",
	六: "6",
	七: "7",
	八: "8",
	九: "9"
};
const ARABIC_NUMERALS = [
	"٠",
	"١",
	"٢",
	"٣",
	"٤",
	"٥",
	"٦",
	"٧",
	"٨",
	"٩"
];
const PERSIAN_NUMERALS = [
	"۰",
	"۱",
	"۲",
	"۳",
	"۴",
	"۵",
	"۶",
	"۷",
	"۸",
	"۹"
];
const FULLWIDTH_NUMERALS = [
	"０",
	"１",
	"２",
	"３",
	"４",
	"５",
	"６",
	"７",
	"８",
	"９"
];
const PERCENTAGES = [
	"%",
	"٪",
	"％",
	"﹪"
];
const PERMILLE = ["‰", "؉"];
const UNICODE_MINUS_SIGNS = [
	"−",
	"－",
	"‒",
	"–",
	"—",
	"﹣"
];
const UNICODE_PLUS_SIGNS = ["＋", "﹢"];
const FULLWIDTH_DECIMAL = "．";
const FULLWIDTH_GROUP = "，";
const ARABIC_RE = new RegExp(`[${ARABIC_NUMERALS.join("")}]`, "g");
const PERSIAN_RE = new RegExp(`[${PERSIAN_NUMERALS.join("")}]`, "g");
const FULLWIDTH_RE = new RegExp(`[${FULLWIDTH_NUMERALS.join("")}]`, "g");
const HAN_RE = new RegExp(`[${HAN_NUMERALS.join("")}]`, "g");
const PERCENT_RE = /* @__PURE__ */ new RegExp(`[${PERCENTAGES.join("")}]`);
const PERMILLE_RE = /* @__PURE__ */ new RegExp(`[${PERMILLE.join("")}]`);
const PERCENT_GLOBAL_RE = new RegExp(PERCENT_RE.source, "g");
const PERMILLE_GLOBAL_RE = new RegExp(PERMILLE_RE.source, "g");
const ARABIC_DETECT_RE = /* @__PURE__ */ new RegExp(`[${ARABIC_NUMERALS.join("")}]`);
const PERSIAN_DETECT_RE = /* @__PURE__ */ new RegExp(`[${PERSIAN_NUMERALS.join("")}]`);
const HAN_DETECT_RE = /* @__PURE__ */ new RegExp(`[${HAN_NUMERALS.join("")}]`);
const FULLWIDTH_DETECT_RE = /* @__PURE__ */ new RegExp(`[${FULLWIDTH_NUMERALS.join("")}]`);
function isNumeralChar(char) {
	return char >= "0" && char <= "9" || ARABIC_DETECT_RE.test(char) || PERSIAN_DETECT_RE.test(char) || HAN_DETECT_RE.test(char) || FULLWIDTH_DETECT_RE.test(char);
}
const BASE_NON_NUMERIC_SYMBOLS = [
	".",
	",",
	FULLWIDTH_DECIMAL,
	FULLWIDTH_GROUP,
	"٫",
	"٬"
];
const SPACE_SEPARATOR_RE = /\p{Zs}/u;
const PLUS_SIGNS_WITH_ASCII = ["+", ...UNICODE_PLUS_SIGNS];
const MINUS_SIGNS_WITH_ASCII = ["-", ...UNICODE_MINUS_SIGNS];
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const escapeClassChar = (s) => s.replace(/[-\\\]^]/g, (m) => `\\${m}`);
function shiftDecimal(value, exponentDelta) {
	const [coefficient, exponent = "0"] = String(value).split("e");
	return Number(`${coefficient}e${Number(exponent) + exponentDelta}`);
}
const charClassFrom = (chars) => `[${chars.map(escapeClassChar).join("")}]`;
const ANY_MINUS_CLASS = charClassFrom(["-"].concat(UNICODE_MINUS_SIGNS));
const ANY_PLUS_CLASS = charClassFrom(["+"].concat(UNICODE_PLUS_SIGNS));
const ANY_MINUS_RE = new RegExp(ANY_MINUS_CLASS, "gu");
const ANY_PLUS_RE = new RegExp(ANY_PLUS_CLASS, "gu");
const ANY_MINUS_DETECT_RE = new RegExp(ANY_MINUS_CLASS);
const ANY_PLUS_DETECT_RE = new RegExp(ANY_PLUS_CLASS);
function getNumberLocaleDetails(locale, options) {
	const parts = getFormatter(locale, options).formatToParts(11111.1);
	const result = {};
	parts.forEach((part) => {
		result[part.type] = part.value;
	});
	getFormatter(locale).formatToParts(.1).forEach((part) => {
		if (part.type === "decimal") result[part.type] = part.value;
	});
	return result;
}
function parseNumber(formattedNumber, locale, options) {
	if (formattedNumber == null) return null;
	let input = String(formattedNumber).replace(/\p{Cf}/gu, "").trim();
	input = input.replace(ANY_MINUS_RE, "-").replace(ANY_PLUS_RE, "+");
	let isNegative = false;
	const trailing = input.match(/([+-])\s*$/);
	if (trailing) {
		if (trailing[1] === "-") isNegative = true;
		input = input.replace(/([+-])\s*$/, "");
	}
	const leading = input.match(/^\s*([+-])/);
	if (leading) {
		if (leading[1] === "-") isNegative = true;
		input = input.replace(/^\s*[+-]/, "");
	}
	let computedLocale = locale;
	if (computedLocale === void 0) {
		if (ARABIC_DETECT_RE.test(input) || PERSIAN_DETECT_RE.test(input)) computedLocale = "ar";
		else if (HAN_DETECT_RE.test(input)) computedLocale = "zh";
	}
	const { group, decimal, currency, exponentSeparator } = getNumberLocaleDetails(computedLocale, options);
	const unitParts = getFormatter(computedLocale, options).formatToParts(1).filter((p) => p.type === "unit").map((p) => escapeRegExp(p.value));
	const unitRegex = unitParts.length ? new RegExp(unitParts.join("|"), "g") : null;
	let groupRegex = null;
	if (group) {
		const isSpaceGroup = /\p{Zs}/u.test(group);
		const isApostropheGroup = group === "'" || group === "’";
		if (isSpaceGroup) groupRegex = /\p{Zs}/gu;
		else if (isApostropheGroup) groupRegex = /['’]/g;
		else groupRegex = new RegExp(escapeRegExp(group), "g");
	}
	let unformatted = [
		{
			regex: groupRegex,
			replacement: ""
		},
		{
			regex: decimal ? new RegExp(escapeRegExp(decimal), "g") : null,
			replacement: "."
		},
		{
			regex: /．/g,
			replacement: "."
		},
		{
			regex: /，/g,
			replacement: ""
		},
		{
			regex: /٫/g,
			replacement: "."
		},
		{
			regex: /٬/g,
			replacement: ""
		},
		{
			regex: currency ? new RegExp(escapeRegExp(currency), "g") : null,
			replacement: ""
		},
		{
			regex: unitRegex,
			replacement: ""
		},
		{
			regex: PERCENT_GLOBAL_RE,
			replacement: ""
		},
		{
			regex: PERMILLE_GLOBAL_RE,
			replacement: ""
		},
		{
			regex: exponentSeparator ? new RegExp(escapeRegExp(exponentSeparator), "g") : null,
			replacement: "e"
		},
		{
			regex: ARABIC_RE,
			replacement: (ch) => String(ARABIC_NUMERALS.indexOf(ch))
		},
		{
			regex: PERSIAN_RE,
			replacement: (ch) => String(PERSIAN_NUMERALS.indexOf(ch))
		},
		{
			regex: FULLWIDTH_RE,
			replacement: (ch) => String(FULLWIDTH_NUMERALS.indexOf(ch))
		},
		{
			regex: HAN_RE,
			replacement: (ch) => HAN_NUMERAL_TO_DIGIT[ch]
		}
	].reduce((acc, { regex, replacement }) => {
		return regex ? acc.replace(regex, replacement) : acc;
	}, input);
	const lastDot = unformatted.lastIndexOf(".");
	if (lastDot !== -1) unformatted = `${unformatted.slice(0, lastDot).replace(/\./g, "")}.${unformatted.slice(lastDot + 1).replace(/\./g, "")}`;
	if (/^[-+]?Infinity$/i.test(input) || input.includes("∞")) return null;
	const parseTarget = (isNegative ? "-" : "") + unformatted;
	let num = parseFloat(parseTarget);
	const style = options?.style;
	const isUnitPercent = style === "unit" && options?.unit === "percent";
	const hasPercentSymbol = PERCENT_RE.test(formattedNumber) || style === "percent";
	if (PERMILLE_RE.test(formattedNumber)) num = shiftDecimal(num, -3);
	else if (!isUnitPercent && hasPercentSymbol) num = shiftDecimal(num, -2);
	if (!Number.isFinite(num)) return null;
	return num;
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/internals/clamp.mjs
function clamp(val, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
	return Math.max(min, Math.min(val, max));
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/number-field/utils/validate.mjs
const STEP_EPSILON_FACTOR = 1e-10;
const MAX_FLOATING_POINT_CLEANUP_DELTA = 1e-10;
function hasNumberFormatRoundingOptions(format) {
	return format?.maximumFractionDigits != null || format?.minimumFractionDigits != null || format?.maximumSignificantDigits != null || format?.minimumSignificantDigits != null || format?.roundingIncrement != null || format?.roundingMode != null || format?.roundingPriority != null;
}
function removeFloatingPointErrors(value, format) {
	if (!Number.isFinite(value)) return value;
	if (!hasNumberFormatRoundingOptions(format)) {
		const roundedValue$1 = parseFloat(value.toPrecision(15));
		return Math.abs(roundedValue$1 - value) <= Math.min(Number.EPSILON * Math.max(1, Math.abs(value)), MAX_FLOATING_POINT_CLEANUP_DELTA) ? roundedValue$1 : value;
	}
	const formatter = getFormatter("en-US", {
		...format,
		signDisplay: "auto",
		currencySign: "standard",
		notation: format.notation === "compact" ? "standard" : format.notation,
		useGrouping: false
	});
	const roundedText = formatter.format(value);
	const roundedValue = parseNumber(roundedText, "en-US", format);
	if (roundedValue === null) return value;
	return formatter.format(roundedValue) === roundedText ? roundedValue : value;
}
function snapToStep(value, base, step, mode = "directional") {
	const stepSize = Math.abs(step);
	const direction = Math.sign(step);
	const tolerance = stepSize * STEP_EPSILON_FACTOR * direction;
	const rawSteps = value - base + tolerance;
	if (mode === "nearest") return base + Math.round(rawSteps / step) * step;
	return base + (direction > 0 ? Math.floor(rawSteps / stepSize) : Math.ceil(rawSteps / stepSize)) * stepSize;
}
function toValidatedNumber(value, { step, minWithDefault, maxWithDefault, minWithZeroDefault, format, snapOnStep, small, clamp: shouldClamp }) {
	if (value === null) return value;
	let nextValue = value;
	if (step != null && snapOnStep && step !== 0) {
		const base = small || minWithDefault === Number.MIN_SAFE_INTEGER ? minWithZeroDefault : minWithDefault;
		nextValue = snapToStep(nextValue, base, step, small ? "nearest" : "directional");
	}
	if (shouldClamp) nextValue = clamp(nextValue, minWithDefault, maxWithDefault);
	if (step == null && !hasNumberFormatRoundingOptions(format)) return nextValue;
	const roundedValue = removeFloatingPointErrors(nextValue, format);
	return shouldClamp ? clamp(roundedValue, minWithDefault, maxWithDefault) : roundedValue;
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/internals/reason-parts.mjs
const none = "none";
const inputChange = "input-change";
const inputClear = "input-clear";
const inputBlur = "input-blur";
const inputPaste = "input-paste";
const keyboard = "keyboard";
const wheel = "wheel";
const scrub = "scrub";

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/internals/createBaseUIEventDetails.mjs
/**
* Maps a change `reason` string to the corresponding native event type.
*/
/**
* Details of custom change events emitted by Base UI components.
*/
/**
* Details of custom generic events emitted by Base UI components.
*/
/**
* Creates a Base UI event details object with the given reason and utilities
* for preventing Base UI's internal event handling.
*/
function createChangeEventDetails(reason, event, trigger, customProperties) {
	let canceled = false;
	let allowPropagation = false;
	const custom = customProperties ?? EMPTY_OBJECT;
	return {
		reason,
		event: event ?? new Event("base-ui"),
		cancel() {
			canceled = true;
		},
		allowPropagation() {
			allowPropagation = true;
		},
		get isCanceled() {
			return canceled;
		},
		get isPropagationAllowed() {
			return allowPropagation;
		},
		trigger,
		...custom
	};
}
function createGenericEventDetails(reason, event, customProperties) {
	const custom = customProperties ?? EMPTY_OBJECT;
	return {
		reason,
		event: event ?? new Event("base-ui"),
		...custom
	};
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/number-field/root/NumberFieldRoot.mjs
const NumberFieldRoot = /* @__PURE__ */ React.forwardRef(function NumberFieldRoot$1(componentProps, forwardedRef) {
	const { id: idProp, min, max, smallStep = .1, step: stepProp = 1, largeStep = 10, required = false, disabled: disabledProp = false, readOnly = false, form, name: nameProp, defaultValue, value: valueProp, onValueChange: onValueChangeProp, onValueCommitted: onValueCommittedProp, allowWheelScrub = false, snapOnStep = false, allowOutOfRange = false, format, locale, render, className, inputRef: inputRefProp, style,...elementProps } = componentProps;
	const { setDirty, validityData, disabled: fieldDisabled, setFilled, invalid, name: fieldName, state: fieldState, validation } = useFieldRootContext();
	const { clearErrors } = useFormContext();
	const disabled = fieldDisabled || disabledProp;
	const name = fieldName ?? nameProp;
	const step = stepProp === "any" ? 1 : stepProp;
	const [isScrubbing, setIsScrubbing] = React.useState(false);
	const minWithDefault = min ?? Number.MIN_SAFE_INTEGER;
	const maxWithDefault = max ?? Number.MAX_SAFE_INTEGER;
	const minWithZeroDefault = min ?? 0;
	const formatStyle = format?.style;
	const inputRef = React.useRef(null);
	const hiddenInputRef = useMergedRefs(inputRefProp, validation.inputRef);
	const id = useLabelableId({ id: idProp });
	const [valueUnwrapped, setValueUnwrapped] = useControlled({
		controlled: valueProp,
		default: defaultValue,
		name: "NumberField",
		state: "value"
	});
	const value = valueUnwrapped ?? null;
	const valueRef = useValueAsRef(value);
	useIsoLayoutEffect(() => {
		setFilled(value !== null);
	}, [setFilled, value]);
	const forceRender = useForcedRerendering();
	const formatOptionsRef = useValueAsRef(format);
	const hasPendingCommitRef = React.useRef(false);
	const onValueCommitted = useStableCallback((nextValue, eventDetails) => {
		hasPendingCommitRef.current = false;
		onValueCommittedProp?.(nextValue, eventDetails);
	});
	const allowInputSyncRef = React.useRef(true);
	const lastChangedValueRef = React.useRef(null);
	const [inputValue, setInputValue] = React.useState(() => formatNumber(value, locale, format));
	const [inputMode, setInputMode] = React.useState("numeric");
	const getAllowedNonNumericKeys = useStableCallback(() => {
		const { decimal, group, currency, literal } = getNumberLocaleDetails(locale, format);
		const keys = /* @__PURE__ */ new Set();
		BASE_NON_NUMERIC_SYMBOLS.forEach((symbol) => keys.add(symbol));
		if (decimal) keys.add(decimal);
		if (group) {
			keys.add(group);
			if (SPACE_SEPARATOR_RE.test(group)) keys.add(" ");
		}
		const allowPercentSymbols = formatStyle === "percent" || formatStyle === "unit" && format?.unit === "percent";
		const allowPermilleSymbols = formatStyle === "percent" || formatStyle === "unit" && format?.unit === "permille";
		if (allowPercentSymbols) PERCENTAGES.forEach((key) => keys.add(key));
		if (allowPermilleSymbols) PERMILLE.forEach((key) => keys.add(key));
		if (formatStyle === "currency" && currency) keys.add(currency);
		if (literal) {
			Array.from(literal).forEach((char) => keys.add(char));
			if (SPACE_SEPARATOR_RE.test(literal)) keys.add(" ");
		}
		PLUS_SIGNS_WITH_ASCII.forEach((key) => keys.add(key));
		if (minWithDefault < 0 || allowOutOfRange) MINUS_SIGNS_WITH_ASCII.forEach((key) => keys.add(key));
		return keys;
	});
	const getStepAmount = useStableCallback((event) => {
		if (event?.altKey) return smallStep;
		if (event?.shiftKey) return largeStep;
		return step;
	});
	const setValue = useStableCallback((unvalidatedValue, details) => {
		const eventWithOptionalKeyState = details.event;
		const dir = details.direction;
		const isInputReason = details.reason === inputChange || details.reason === inputClear || details.reason === inputBlur || details.reason === inputPaste || details.reason === none;
		const shouldClampValue = !allowOutOfRange || !isInputReason;
		const validatedValue = toValidatedNumber(unvalidatedValue, {
			step: dir ? getStepAmount(eventWithOptionalKeyState) * dir : void 0,
			format: formatOptionsRef.current,
			minWithDefault,
			maxWithDefault,
			minWithZeroDefault,
			snapOnStep,
			small: eventWithOptionalKeyState?.altKey ?? false,
			clamp: shouldClampValue
		});
		const shouldFireChange = validatedValue !== value || isInputReason && (unvalidatedValue !== value || allowInputSyncRef.current === false);
		if (shouldFireChange) {
			onValueChangeProp?.(validatedValue, details);
			if (details.isCanceled) return false;
			setValueUnwrapped(validatedValue);
			setDirty(validatedValue !== validityData.initialValue);
			hasPendingCommitRef.current = true;
		}
		lastChangedValueRef.current = validatedValue;
		if (allowInputSyncRef.current) setInputValue(formatNumber(validatedValue, locale, format));
		forceRender();
		return shouldFireChange;
	});
	const incrementValue = useStableCallback((amount, { direction, currentValue, event, reason }) => {
		const prevValue = currentValue == null ? valueRef.current : currentValue;
		const nativeEvent = event;
		if (typeof prevValue !== "number") return setValue(0, createChangeEventDetails(reason, nativeEvent));
		return setValue(prevValue + amount * direction, createChangeEventDetails(reason, nativeEvent, void 0, { direction }));
	});
	useIsoLayoutEffect(function syncFormattedInputValueOnValueChange() {
		if (!allowInputSyncRef.current) return;
		const nextInputValue = formatNumber(value, locale, format);
		if (nextInputValue !== inputValue) setInputValue(nextInputValue);
	});
	useIsoLayoutEffect(function setDynamicInputModeForIOS() {
		if (!ios) return;
		let computedInputMode = "text";
		if (minWithDefault >= 0) computedInputMode = "decimal";
		setInputMode(computedInputMode);
	}, [minWithDefault]);
	React.useEffect(function registerElementWheelListener() {
		const element$1 = inputRef.current;
		if (disabled || readOnly || !allowWheelScrub || !element$1) return;
		function handleWheel(event) {
			if (event.ctrlKey || activeElement(ownerDocument(inputRef.current)) !== inputRef.current) return;
			event.preventDefault();
			allowInputSyncRef.current = true;
			if (incrementValue(getStepAmount(event), {
				direction: event.deltaY > 0 ? -1 : 1,
				event,
				reason: "wheel"
			})) onValueCommitted(lastChangedValueRef.current ?? valueRef.current, createGenericEventDetails(wheel, event));
		}
		return addEventListener(element$1, "wheel", handleWheel);
	}, [
		allowWheelScrub,
		incrementValue,
		disabled,
		readOnly,
		getStepAmount,
		onValueCommitted,
		lastChangedValueRef,
		valueRef
	]);
	const state = React.useMemo(() => ({
		...fieldState,
		disabled,
		readOnly,
		required,
		value,
		inputValue,
		scrubbing: isScrubbing
	}), [
		fieldState,
		disabled,
		readOnly,
		required,
		value,
		inputValue,
		isScrubbing
	]);
	const contextValue = React.useMemo(() => ({
		inputRef,
		inputValue,
		value,
		minWithDefault,
		maxWithDefault,
		disabled,
		readOnly,
		id,
		setValue,
		incrementValue,
		getStepAmount,
		allowInputSyncRef,
		formatOptionsRef,
		valueRef,
		lastChangedValueRef,
		hasPendingCommitRef,
		name,
		nameProp,
		required,
		invalid,
		inputMode,
		getAllowedNonNumericKeys,
		min,
		max,
		setInputValue,
		locale,
		isScrubbing,
		setIsScrubbing,
		state,
		onValueCommitted
	}), [
		inputRef,
		inputValue,
		value,
		minWithDefault,
		maxWithDefault,
		disabled,
		readOnly,
		id,
		setValue,
		incrementValue,
		getStepAmount,
		formatOptionsRef,
		valueRef,
		name,
		nameProp,
		required,
		invalid,
		inputMode,
		getAllowedNonNumericKeys,
		min,
		max,
		setInputValue,
		locale,
		isScrubbing,
		state,
		onValueCommitted
	]);
	const element = useRenderElement("div", componentProps, {
		ref: forwardedRef,
		state,
		props: elementProps,
		stateAttributesMapping
	});
	return /* @__PURE__ */ jsxs(NumberFieldRootContext.Provider, {
		value: contextValue,
		children: [element, /* @__PURE__ */ jsx("input", {
			...validation.getValidationProps(disabled, {
				onFocus() {
					inputRef.current?.focus();
				},
				onChange(event) {
					if (event.nativeEvent.defaultPrevented || disabled || readOnly) return;
					const nextValue = event.currentTarget.valueAsNumber;
					const parsedValue = Number.isNaN(nextValue) ? null : nextValue;
					setValue(parsedValue, createChangeEventDetails(none, event.nativeEvent));
					clearErrors(name);
					validation.change(lastChangedValueRef.current ?? parsedValue);
				}
			}),
			ref: hiddenInputRef,
			type: "number",
			form,
			name,
			value: value ?? "",
			min,
			max,
			step: stepProp,
			disabled,
			readOnly,
			required,
			"aria-hidden": true,
			tabIndex: -1,
			style: name ? visuallyHiddenInput : visuallyHidden,
			suppressHydrationWarning: true
		})]
	});
});
if (process.env.NODE_ENV !== "production") NumberFieldRoot.displayName = "NumberFieldRoot";

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/useOnMount.mjs
const EMPTY$1 = [];
/**
* A React.useEffect equivalent that runs once, when the component is mounted.
*/
function useOnMount(fn) {
	React.useEffect(fn, EMPTY$1);
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/useTimeout.mjs
const EMPTY = 0;
var Timeout = class Timeout {
	static create() {
		return new Timeout();
	}
	currentId = EMPTY;
	/**
	* Executes `fn` after `delay`, clearing any previously scheduled call.
	*/
	start(delay, fn) {
		this.clear();
		this.currentId = setTimeout(() => {
			this.currentId = EMPTY;
			fn();
		}, delay);
	}
	isStarted() {
		return this.currentId !== EMPTY;
	}
	clear = () => {
		if (this.currentId !== EMPTY) {
			clearTimeout(this.currentId);
			this.currentId = EMPTY;
		}
	};
	disposeEffect = () => {
		return this.clear;
	};
};
/**
* A `setTimeout` with automatic cleanup and guard.
*/
function useTimeout() {
	const timeout = useRefWithInit(Timeout.create).current;
	useOnMount(timeout.disposeEffect);
	return timeout;
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/internals/field-register-control/useRegisterFieldControl.mjs
function useRegisterFieldControl(controlRef, id, value, getFormValueOverride, enabled = true, name) {
	const { registerFieldControl } = useFieldRootContext();
	const sourceRef = React.useRef(null);
	if (!sourceRef.current) sourceRef.current = Symbol();
	useIsoLayoutEffect(() => {
		const source = sourceRef.current;
		if (!source || !enabled) return;
		registerFieldControl(source, {
			controlRef,
			getValue: getFormValueOverride,
			id,
			name,
			value
		});
		return () => {
			registerFieldControl(source, void 0);
		};
	}, [
		controlRef,
		enabled,
		getFormValueOverride,
		id,
		name,
		registerFieldControl,
		value
	]);
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/internals/useValueChanged.mjs
function useValueChanged(value, onChange) {
	const valueRef = React.useRef(value);
	const onChangeCallback = useStableCallback(onChange);
	useIsoLayoutEffect(() => {
		if (valueRef.current === value) return;
		onChangeCallback(valueRef.current);
	}, [value, onChangeCallback]);
	useIsoLayoutEffect(() => {
		valueRef.current = value;
	}, [value]);
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/number-field/input/NumberFieldInput.mjs
const NAVIGATE_KEYS = new Set([
	"Backspace",
	"Delete",
	"ArrowLeft",
	"ArrowRight",
	"Tab",
	"Enter",
	"Escape"
]);
/**
* The native input control in the number field.
* Renders an `<input>` element.
*
* Documentation: [Base UI Number Field](https://base-ui.com/react/components/number-field)
*/
const NumberFieldInput = /* @__PURE__ */ React.forwardRef(function NumberFieldInput$1(componentProps, forwardedRef) {
	const { render, className, style,...elementProps } = componentProps;
	const { allowInputSyncRef, disabled, formatOptionsRef, getAllowedNonNumericKeys, getStepAmount, id, incrementValue, inputMode, inputValue, max, min, name, nameProp, readOnly, required, setValue, state, setInputValue, locale, inputRef, value, onValueCommitted, lastChangedValueRef, hasPendingCommitRef, valueRef } = useNumberFieldRootContext();
	const { clearErrors } = useFormContext();
	const { validationMode, setTouched, setFocused, invalid, shouldValidateOnChange, validation } = useFieldRootContext();
	const { labelId } = useLabelableContext();
	const hasTouchedInputRef = React.useRef(false);
	const blockRevalidationRef = React.useRef(false);
	const pendingCaretRef = React.useRef(null);
	useRegisterFieldControl(inputRef, id, value, void 0, !disabled, nameProp);
	useIsoLayoutEffect(() => {
		if (pendingCaretRef.current != null) {
			const caret = pendingCaretRef.current;
			pendingCaretRef.current = null;
			inputRef.current?.setSelectionRange(caret, caret);
		}
	});
	useValueChanged(value, () => {
		clearErrors(name);
		if (blockRevalidationRef.current && !shouldValidateOnChange()) {
			blockRevalidationRef.current = false;
			return;
		}
		validation.change(value);
	});
	return useRenderElement("input", componentProps, {
		ref: [forwardedRef, inputRef],
		state,
		props: [
			{
				id,
				required,
				disabled,
				readOnly,
				inputMode,
				value: inputValue,
				type: "text",
				autoComplete: "off",
				autoCorrect: "off",
				spellCheck: "false",
				"aria-roledescription": "Number field",
				"aria-invalid": !disabled && invalid ? true : void 0,
				"aria-labelledby": labelId,
				suppressHydrationWarning: true,
				onFocus(event) {
					if (event.defaultPrevented || disabled) return;
					setFocused(true);
					if (hasTouchedInputRef.current) return;
					hasTouchedInputRef.current = true;
					const target = event.currentTarget;
					const length = target.value.length;
					target.setSelectionRange(length, length);
				},
				onBlur(event) {
					if (event.defaultPrevented || disabled) return;
					setTouched(true);
					setFocused(false);
					if (readOnly) return;
					const hadManualInput = !allowInputSyncRef.current;
					const hadPendingProgrammaticChange = hasPendingCommitRef.current;
					allowInputSyncRef.current = true;
					if (inputValue.trim() === "") {
						const clearDetails = createChangeEventDetails(inputClear, event.nativeEvent);
						setValue(null, clearDetails);
						if (clearDetails.isCanceled) return;
						if (validationMode === "onBlur") validation.commit(null);
						if (hadManualInput || hadPendingProgrammaticChange || value !== null) onValueCommitted(null, createGenericEventDetails(inputClear, event.nativeEvent));
						return;
					}
					const formatOptions = formatOptionsRef.current;
					const parsedValue = parseNumber(inputValue, locale, formatOptions);
					if (parsedValue === null) return;
					const hasRoundingOptions = hasNumberFormatRoundingOptions(formatOptions);
					let committed;
					if (!hadManualInput && !hasRoundingOptions) committed = value;
					else if (hasRoundingOptions) committed = removeFloatingPointErrors(parsedValue, formatOptions);
					else committed = parsedValue;
					const nextEventDetails = createGenericEventDetails(inputBlur, event.nativeEvent);
					const shouldUpdateValue = value !== committed;
					const shouldCommit = hadManualInput || shouldUpdateValue || hadPendingProgrammaticChange;
					let committedValue = committed;
					if (shouldUpdateValue) {
						const changeDetails = createChangeEventDetails(inputBlur, event.nativeEvent);
						blockRevalidationRef.current = true;
						setValue(committed, changeDetails);
						if (changeDetails.isCanceled) {
							blockRevalidationRef.current = false;
							return;
						}
						committedValue = lastChangedValueRef.current ?? committed;
						if (committedValue === value) blockRevalidationRef.current = false;
					}
					if (validationMode === "onBlur") validation.commit(committedValue);
					if (shouldCommit) onValueCommitted(committedValue, nextEventDetails);
					const canonicalText = formatNumber(committedValue, locale, formatOptions);
					if (inputValue !== canonicalText) setInputValue(canonicalText);
				},
				onChange(event) {
					if (event.nativeEvent.defaultPrevented) return;
					allowInputSyncRef.current = false;
					const targetValue = event.currentTarget.value;
					if (targetValue.trim() === "") {
						setInputValue(targetValue);
						setValue(null, createChangeEventDetails(inputClear, event.nativeEvent));
						return;
					}
					const allowedNonNumericKeys = getAllowedNonNumericKeys();
					if (!Array.from(targetValue).every((ch) => isNumeralChar(ch) || ANY_MINUS_DETECT_RE.test(ch) || allowedNonNumericKeys.has(ch))) return;
					const parsedValue = parseNumber(targetValue, locale, formatOptionsRef.current);
					setInputValue(targetValue);
					if (parsedValue !== null) setValue(parsedValue, createChangeEventDetails(inputChange, event.nativeEvent));
				},
				onKeyDown(event) {
					if (event.defaultPrevented || readOnly || disabled) return;
					const nativeEvent = event.nativeEvent;
					const hadManualInput = !allowInputSyncRef.current;
					const allowedNonNumericKeys = getAllowedNonNumericKeys();
					let isAllowedNonNumericKey = allowedNonNumericKeys.has(event.key);
					const { decimal, currency, percentSign } = getNumberLocaleDetails(locale, formatOptionsRef.current);
					const selectionStart = event.currentTarget.selectionStart;
					const selectionEnd = event.currentTarget.selectionEnd;
					const isAllSelected = selectionStart === 0 && selectionEnd === inputValue.length;
					const selectionContainsIndex = (index) => selectionStart != null && selectionEnd != null && index >= selectionStart && index < selectionEnd;
					[[ANY_MINUS_DETECT_RE, ANY_MINUS_RE], [ANY_PLUS_DETECT_RE, ANY_PLUS_RE]].forEach(([detectRe, globalRe]) => {
						if (detectRe.test(event.key) && Array.from(allowedNonNumericKeys).some((k) => detectRe.test(k))) {
							const existingIndex = inputValue.search(globalRe);
							const isReplacingExisting = existingIndex !== -1 && selectionContainsIndex(existingIndex);
							isAllowedNonNumericKey = !(ANY_MINUS_DETECT_RE.test(inputValue) || ANY_PLUS_DETECT_RE.test(inputValue)) || isAllSelected || isReplacingExisting;
						}
					});
					[
						decimal,
						currency,
						percentSign
					].forEach((symbol) => {
						if (event.key === symbol) {
							const isSymbolHighlighted = selectionContainsIndex(inputValue.indexOf(symbol));
							isAllowedNonNumericKey = !inputValue.includes(symbol) || isAllSelected || isSymbolHighlighted;
						}
					});
					const isNavigateKey = NAVIGATE_KEYS.has(event.key);
					const isStepKey = event.key === "ArrowUp" || event.key === "ArrowDown";
					if (event.which === 229 || event.altKey && !isStepKey || event.ctrlKey || event.metaKey || isAllowedNonNumericKey || isNumeralChar(event.key) || isNavigateKey) return;
					const willSetHome = event.key === "Home" && min != null;
					const willSetEnd = event.key === "End" && max != null;
					if (event.key.length > 1 && !isStepKey && !willSetHome && !willSetEnd) return;
					const currentValue = hadManualInput ? parseNumber(inputValue, locale, formatOptionsRef.current) : null;
					const amount = getStepAmount(event);
					stopEvent(event);
					const commitDetails = createGenericEventDetails(keyboard, nativeEvent);
					let changed = false;
					if (event.key === "ArrowUp" || event.key === "ArrowDown") {
						allowInputSyncRef.current = true;
						if (!hadManualInput) lastChangedValueRef.current = valueRef.current;
						changed = incrementValue(amount, {
							direction: event.key === "ArrowUp" ? 1 : -1,
							currentValue,
							event: nativeEvent,
							reason: keyboard
						});
					} else if (willSetHome) {
						allowInputSyncRef.current = true;
						changed = setValue(min, createChangeEventDetails(keyboard, nativeEvent));
					} else if (willSetEnd) {
						allowInputSyncRef.current = true;
						changed = setValue(max, createChangeEventDetails(keyboard, nativeEvent));
					}
					if (changed) onValueCommitted(lastChangedValueRef.current ?? valueRef.current, commitDetails);
				},
				onPaste(event) {
					if (event.defaultPrevented || readOnly || disabled) return;
					let pastedData = "";
					try {
						pastedData = event.clipboardData?.getData("text/plain") ?? "";
					} catch {
						if (process.env.NODE_ENV !== "production") warn("<NumberField.Input> could not read clipboard text during paste handling.", SafeReact.captureOwnerStack?.() || "");
						return;
					}
					event.preventDefault();
					const input = event.currentTarget;
					const selectionStart = input.selectionStart ?? inputValue.length;
					const selectionEnd = input.selectionEnd ?? inputValue.length;
					const nextText = inputValue.slice(0, selectionStart) + pastedData + inputValue.slice(selectionEnd);
					const parsedValue = parseNumber(nextText, locale, formatOptionsRef.current);
					if (parsedValue !== null) {
						allowInputSyncRef.current = false;
						pendingCaretRef.current = selectionStart + pastedData.length;
						setValue(parsedValue, createChangeEventDetails(inputPaste, event.nativeEvent));
						setInputValue(nextText);
					}
				}
			},
			elementProps,
			(props) => validation.getValidationProps(disabled, props)
		],
		stateAttributesMapping
	});
});
if (process.env.NODE_ENV !== "production") NumberFieldInput.displayName = "NumberFieldInput";

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.3.1_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/utils/mergeCleanups.mjs
/**
* Combines multiple cleanup functions into a single cleanup function.
*/
function mergeCleanups(...cleanups) {
	return () => {
		for (let i = 0; i < cleanups.length; i += 1) {
			const cleanup = cleanups[i];
			if (cleanup) cleanup();
		}
	};
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/number-field/scrub-area/NumberFieldScrubAreaContext.mjs
const NumberFieldScrubAreaContext = /* @__PURE__ */ React.createContext(void 0);
if (process.env.NODE_ENV !== "production") NumberFieldScrubAreaContext.displayName = "NumberFieldScrubAreaContext";
function useNumberFieldScrubAreaContext() {
	const context = React.useContext(NumberFieldScrubAreaContext);
	if (context === void 0) throw new Error(process.env.NODE_ENV !== "production" ? "Base UI: NumberFieldScrubAreaContext is missing. NumberFieldScrubArea parts must be placed within <NumberField.ScrubArea>." : formatErrorMessage_default(44));
	return context;
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/number-field/utils/getViewportRect.mjs
function getViewportRect(teleportDistance, scrubAreaEl) {
	const win = getWindow(scrubAreaEl);
	if (teleportDistance != null) {
		const rect = scrubAreaEl.getBoundingClientRect();
		return {
			left: rect.left - teleportDistance / 2,
			top: rect.top - teleportDistance / 2,
			right: rect.right + teleportDistance / 2,
			bottom: rect.bottom + teleportDistance / 2
		};
	}
	const vV = win.visualViewport;
	if (vV) return {
		left: vV.offsetLeft,
		top: vV.offsetTop,
		right: vV.offsetLeft + vV.width,
		bottom: vV.offsetTop + vV.height
	};
	return {
		left: 0,
		top: 0,
		right: win.document.documentElement.clientWidth,
		bottom: win.document.documentElement.clientHeight
	};
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/number-field/utils/subscribeToVisualViewportResize.mjs
function subscribeToVisualViewportResize(element, visualScaleRef) {
	const vV = getWindow(element).visualViewport;
	if (!vV) return () => {};
	function handleVisualResize() {
		if (vV) visualScaleRef.current = vV.scale;
	}
	handleVisualResize();
	return addEventListener(vV, "resize", handleVisualResize);
}

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/number-field/scrub-area/NumberFieldScrubArea.mjs
const SCRUB_AREA_STYLE = {
	touchAction: "none",
	WebkitUserSelect: "none",
	userSelect: "none"
};
/**
* An interactive area where the user can click and drag to change the field value.
* Renders a `<span>` element.
*
* Documentation: [Base UI Number Field](https://base-ui.com/react/components/number-field)
*/
const NumberFieldScrubArea = /* @__PURE__ */ React.forwardRef(function NumberFieldScrubArea$1(componentProps, forwardedRef) {
	const { render, className, direction = "horizontal", pixelSensitivity = 2, teleportDistance, style,...elementProps } = componentProps;
	const { state, setIsScrubbing: setRootScrubbing, disabled, readOnly, inputRef, incrementValue, allowInputSyncRef, getStepAmount, onValueCommitted, lastChangedValueRef, valueRef } = useNumberFieldRootContext();
	const scrubAreaRef = React.useRef(null);
	const isScrubbingRef = React.useRef(false);
	const didMoveRef = React.useRef(false);
	const pointerDownTargetRef = React.useRef(null);
	const scrubAreaCursorRef = React.useRef(null);
	const virtualCursorCoords = React.useRef({
		x: 0,
		y: 0
	});
	const visualScaleRef = React.useRef(1);
	const exitPointerLockTimeout = useTimeout();
	const [isTouchInput, setIsTouchInput] = React.useState(false);
	const [isPointerLockDenied, setIsPointerLockDenied] = React.useState(false);
	const [isScrubbing, setIsScrubbing] = React.useState(false);
	React.useEffect(() => {
		if (!isScrubbing || !scrubAreaCursorRef.current) return;
		return subscribeToVisualViewportResize(scrubAreaCursorRef.current, visualScaleRef);
	}, [isScrubbing]);
	function updateCursorTransform(x, y) {
		if (scrubAreaCursorRef.current) scrubAreaCursorRef.current.style.transform = `translate3d(${x}px,${y}px,0) scale(${1 / visualScaleRef.current})`;
	}
	const onScrub = useStableCallback(({ movementX, movementY }) => {
		const virtualCursor = scrubAreaCursorRef.current;
		const scrubAreaEl = scrubAreaRef.current;
		if (!virtualCursor || !scrubAreaEl) return;
		const rect = getViewportRect(teleportDistance, scrubAreaEl);
		const coords = virtualCursorCoords.current;
		const newCoords = {
			x: Math.round(coords.x + movementX),
			y: Math.round(coords.y + movementY)
		};
		const cursorWidth = virtualCursor.offsetWidth;
		const cursorHeight = virtualCursor.offsetHeight;
		if (newCoords.x + cursorWidth / 2 < rect.left) newCoords.x = rect.right - cursorWidth / 2;
		else if (newCoords.x + cursorWidth / 2 > rect.right) newCoords.x = rect.left - cursorWidth / 2;
		if (newCoords.y + cursorHeight / 2 < rect.top) newCoords.y = rect.bottom - cursorHeight / 2;
		else if (newCoords.y + cursorHeight / 2 > rect.bottom) newCoords.y = rect.top - cursorHeight / 2;
		virtualCursorCoords.current = newCoords;
		updateCursorTransform(newCoords.x, newCoords.y);
	});
	const onScrubbingChange = useStableCallback((scrubbingValue, { clientX, clientY }) => {
		ReactDOM.flushSync(() => {
			setIsScrubbing(scrubbingValue);
			setRootScrubbing(scrubbingValue);
		});
		const virtualCursor = scrubAreaCursorRef.current;
		if (!virtualCursor || !scrubbingValue) return;
		const initialCoords = {
			x: clientX - virtualCursor.offsetWidth / 2,
			y: clientY - virtualCursor.offsetHeight / 2
		};
		virtualCursorCoords.current = initialCoords;
		updateCursorTransform(initialCoords.x, initialCoords.y);
	});
	React.useEffect(function registerGlobalScrubbingEventListeners() {
		if (!inputRef.current || disabled || readOnly || !isScrubbing) return;
		let cumulativeDelta = 0;
		function handleScrubPointerUp(event) {
			function handler() {
				try {
					ownerDocument(scrubAreaRef.current).exitPointerLock();
				} catch {} finally {
					isScrubbingRef.current = false;
					onScrubbingChange(false, event);
					onValueCommitted(lastChangedValueRef.current ?? valueRef.current, createGenericEventDetails(scrub, event));
					const pointerDownTarget = pointerDownTargetRef.current;
					const input = inputRef.current;
					if (!didMoveRef.current && pointerDownTarget != null && input) pointerDownTarget.dispatchEvent(new (getWindow(input)).MouseEvent("click", {
						bubbles: true,
						cancelable: true
					}));
					didMoveRef.current = false;
					pointerDownTargetRef.current = null;
				}
			}
			if (gecko) exitPointerLockTimeout.start(20, handler);
			else handler();
		}
		function handleScrubPointerMove(event) {
			if (!isScrubbingRef.current) return;
			event.preventDefault();
			onScrub(event);
			const { movementX, movementY } = event;
			cumulativeDelta += direction === "vertical" ? movementY : movementX;
			if (Math.abs(cumulativeDelta) >= pixelSensitivity) {
				cumulativeDelta = 0;
				didMoveRef.current = true;
				const rawAmount = (direction === "vertical" ? -movementY : movementX) * getStepAmount(event);
				if (rawAmount !== 0) {
					allowInputSyncRef.current = true;
					incrementValue(Math.abs(rawAmount), {
						direction: rawAmount >= 0 ? 1 : -1,
						event,
						reason: scrub
					});
				}
			}
		}
		const win = getWindow(inputRef.current);
		const unsubscribe = mergeCleanups(addEventListener(win, "pointerup", handleScrubPointerUp, true), addEventListener(win, "pointermove", handleScrubPointerMove, true));
		return () => {
			exitPointerLockTimeout.clear();
			unsubscribe();
		};
	}, [
		disabled,
		readOnly,
		allowInputSyncRef,
		incrementValue,
		isScrubbing,
		getStepAmount,
		inputRef,
		onScrubbingChange,
		onScrub,
		direction,
		pixelSensitivity,
		lastChangedValueRef,
		onValueCommitted,
		valueRef,
		exitPointerLockTimeout
	]);
	React.useEffect(() => () => {
		if (isScrubbingRef.current) {
			isScrubbingRef.current = false;
			setRootScrubbing(false);
			try {
				ownerDocument(scrubAreaRef.current).exitPointerLock();
			} catch {}
		}
	}, [setRootScrubbing]);
	React.useEffect(function registerScrubberTouchPreventListener() {
		const element$1 = scrubAreaRef.current;
		if (!element$1 || disabled || readOnly) return;
		function handleTouchStart(event) {
			if (event.touches.length === 1) event.preventDefault();
		}
		return addEventListener(element$1, "touchstart", handleTouchStart);
	}, [disabled, readOnly]);
	const element = useRenderElement("span", componentProps, {
		ref: [forwardedRef, scrubAreaRef],
		state,
		props: [{
			role: "presentation",
			style: SCRUB_AREA_STYLE,
			async onPointerDown(event) {
				const isMainButton = !event.button || event.button === 0;
				if (event.defaultPrevented || readOnly || !isMainButton || disabled) return;
				const isTouch = event.pointerType === "touch";
				setIsTouchInput(isTouch);
				if (event.pointerType === "mouse") {
					event.preventDefault();
					inputRef.current?.focus();
				}
				isScrubbingRef.current = true;
				didMoveRef.current = false;
				pointerDownTargetRef.current = getTarget(event.nativeEvent);
				onScrubbingChange(true, event.nativeEvent);
				if (!isTouch && !webkit) try {
					await ownerDocument(scrubAreaRef.current).body.requestPointerLock();
					setIsPointerLockDenied(false);
				} catch (error$1) {
					setIsPointerLockDenied(true);
				} finally {
					if (isScrubbingRef.current) onScrubbingChange(true, event.nativeEvent);
				}
			}
		}, elementProps],
		stateAttributesMapping
	});
	const contextValue = React.useMemo(() => ({
		isScrubbing,
		isTouchInput,
		isPointerLockDenied,
		scrubAreaCursorRef
	}), [
		isScrubbing,
		isTouchInput,
		isPointerLockDenied
	]);
	return /* @__PURE__ */ jsx(NumberFieldScrubAreaContext.Provider, {
		value: contextValue,
		children: element
	});
});
if (process.env.NODE_ENV !== "production") NumberFieldScrubArea.displayName = "NumberFieldScrubArea";

//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.6.0_@types+react@19.2.17_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/number-field/scrub-area-cursor/NumberFieldScrubAreaCursor.mjs
const CURSOR_STYLE = {
	position: "fixed",
	top: 0,
	left: 0,
	pointerEvents: "none"
};
/**
* A custom element to display instead of the native cursor while using the scrub area.
* Renders a `<span>` element.
*
* This component uses the [Pointer Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API), which may prompt the browser to display a related notification. It is disabled
* in Safari to avoid a layout shift that this notification causes there.
*
* Documentation: [Base UI Number Field](https://base-ui.com/react/components/number-field)
*/
const NumberFieldScrubAreaCursor = /* @__PURE__ */ React.forwardRef(function NumberFieldScrubAreaCursor$1(componentProps, forwardedRef) {
	const { render, className, style,...elementProps } = componentProps;
	const { state } = useNumberFieldRootContext();
	const { isScrubbing, isTouchInput, isPointerLockDenied, scrubAreaCursorRef } = useNumberFieldScrubAreaContext();
	const [domElement, setDomElement] = React.useState(null);
	const element = useRenderElement("span", componentProps, {
		enabled: isScrubbing && !webkit && !isTouchInput && !isPointerLockDenied,
		ref: [
			forwardedRef,
			scrubAreaCursorRef,
			setDomElement
		],
		state,
		props: [{
			role: "presentation",
			style: CURSOR_STYLE
		}, elementProps],
		stateAttributesMapping
	});
	return element && /* @__PURE__ */ ReactDOM.createPortal(element, ownerDocument(domElement).body);
});
if (process.env.NODE_ENV !== "production") NumberFieldScrubAreaCursor.displayName = "NumberFieldScrubAreaCursor";

//#endregion
//#region ../../components/ui/scrub-number-input.tsx
const SCRUB_NUMBER_FIELD_CLASS = "tabular-nums";
const SCRUB_NUMBER_SPINNER_HIDE_CLASS = "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
const scrubFieldVariants = cva("w-full min-w-0 rounded-[12px] border border-input bg-[var(--input-fill)] py-1 text-start text-base text-foreground transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-7 px-2 text-[0.8rem]");
function clampNumber(value, min, max) {
	let bounded = value;
	if (min != null && Number.isFinite(min)) bounded = Math.max(min, bounded);
	if (max != null && Number.isFinite(max)) bounded = Math.min(max, bounded);
	return bounded;
}
const DEFAULT_INPUT_SETTINGS = { selectOnEdit: true };
const BOUND_FEEDBACK_MODES = [
	"none",
	"shake",
	"borderPulse"
];
const DEFAULT_CALLIGRAPH_SETTINGS = {
	variant: "slots",
	animation: "snappy",
	stagger: .02,
	autoSize: false
};
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
function getScrubCursorClass(direction, atBound = null, bounds) {
	if (bounds?.min != null && bounds?.max != null && bounds.min === bounds.max) return "cursor-not-allowed";
	if (direction === "vertical") {
		if (atBound === "min") return "cursor-n-resize";
		if (atBound === "max") return "cursor-s-resize";
		return "cursor-ns-resize";
	}
	if (atBound === "min") return "cursor-e-resize";
	if (atBound === "max") return "cursor-w-resize";
	return "cursor-ew-resize";
}
function getAtBound(value, min, max) {
	if (max != null && value >= max) return "max";
	if (min != null && value <= min) return "min";
	return null;
}
function formatFieldValue(value, format) {
	if (value == null || !Number.isFinite(value)) return "";
	return new Intl.NumberFormat(void 0, format).format(value);
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
function getInputPaddingInline(input) {
	const style = getComputedStyle(input);
	return parseFloat(style.paddingLeft) + parseFloat(style.borderLeftWidth || "0");
}
function placeInputCaretAtPoint(input, clientX, clientY) {
	input.focus({ preventScroll: true });
	const text = input.value;
	if (!text.length) {
		input.setSelectionRange(0, 0);
		return;
	}
	try {
		const doc = input.ownerDocument;
		if (typeof doc.caretRangeFromPoint === "function") {
			const range = doc.caretRangeFromPoint(clientX, clientY);
			if (range?.startContainer === input) {
				const offset$1 = Math.max(0, Math.min(text.length, range.startOffset));
				input.setSelectionRange(offset$1, offset$1);
				return;
			}
		}
		if (typeof doc.caretPositionFromPoint === "function") {
			const position = doc.caretPositionFromPoint(clientX, clientY);
			if (position?.offsetNode === input) {
				const offset$1 = Math.max(0, Math.min(text.length, position.offset));
				input.setSelectionRange(offset$1, offset$1);
				return;
			}
		}
	} catch {}
	const rect = input.getBoundingClientRect();
	const style = getComputedStyle(input);
	const context = input.ownerDocument.createElement("canvas").getContext("2d");
	if (!context) {
		input.setSelectionRange(text.length, text.length);
		return;
	}
	context.font = `${style.fontStyle} ${style.fontVariant} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
	const relativeX = Math.max(0, clientX - rect.left - getInputPaddingInline(input));
	let offset = text.length;
	for (let index = 0; index <= text.length; index++) if (context.measureText(text.slice(0, index)).width >= relativeX) {
		offset = index;
		break;
	}
	try {
		input.setSelectionRange(offset, offset);
	} catch {
		input.setSelectionRange(text.length, text.length);
	}
}
function focusInputForEdit(input, pointerPoint) {
	input.focus({ preventScroll: true });
	try {
		if (pointerPoint) {
			placeInputCaretAtPoint(input, pointerPoint.clientX, pointerPoint.clientY);
			return;
		}
		const length = input.value.length;
		input.setSelectionRange(length, length);
	} catch {}
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
function ScrubFieldBody({ calligraph, direction, pixelSensitivity, boundFeedback, disabled, displayValue, editing, grouped = false, inputClassName, inputSettings, logo, min, max, nudgeTrend, numericValue, onBoundFeedback, onEditingChange, onDoubleClickReset, resetOnDoubleClick, scrubbing, inputProps, inputRef }) {
	const fieldChromeClass = getFieldClasses();
	const fieldClass = getFieldClasses(inputClassName);
	const calligraphClipRef = useRef(null);
	const calligraphContentRef = useRef(null);
	const boundLatchedRef = useRef({
		min: false,
		max: false
	});
	const scrubGestureRef = useRef({
		active: false,
		moved: false,
		delta: 0,
		clientX: 0,
		clientY: 0
	});
	const [scrubHolding, setScrubHolding] = useState(false);
	const pendingSelectAllRef = useRef(false);
	const logoScrollEnabled = logo.enabled;
	const usesInputGroup = logoScrollEnabled;
	const usesGroupedControl = grouped || logoScrollEnabled;
	const atBound = getAtBound(numericValue, min, max);
	const scrubBounds = {
		min,
		max
	};
	const showNativeInput = editing && !scrubHolding;
	const showDisplaySurface = !showNativeInput;
	const displayContentClass = cn("h-full w-full px-2 py-1 text-start text-[0.8rem] leading-none tabular-nums", inputClassName);
	const isDisplayTruncated = useDisplayOverflowTruncated(calligraphClipRef, [
		displayValue,
		inputClassName,
		showNativeInput,
		nudgeTrend
	], calligraphContentRef);
	useEffect(() => {
		if (min != null && numericValue > min) boundLatchedRef.current.min = false;
		if (max != null && numericValue < max) boundLatchedRef.current.max = false;
	}, [
		max,
		min,
		numericValue
	]);
	useEffect(() => {
		if (!scrubbing || boundFeedback === "none") return;
		const handlePointerMove = () => {
			if (max != null && numericValue >= max && !boundLatchedRef.current.max) {
				boundLatchedRef.current.max = true;
				onBoundFeedback("max", "scrub");
			}
			if (min != null && numericValue <= min && !boundLatchedRef.current.min) {
				boundLatchedRef.current.min = true;
				onBoundFeedback("min", "scrub");
			}
		};
		window.addEventListener("pointermove", handlePointerMove);
		return () => {
			window.removeEventListener("pointermove", handlePointerMove);
		};
	}, [
		boundFeedback,
		numericValue,
		max,
		min,
		onBoundFeedback,
		scrubbing
	]);
	const enterEditMode = useCallback((pointerPoint) => {
		if (disabled) return;
		setScrubHolding(false);
		scrubGestureRef.current = {
			active: false,
			moved: false,
			delta: 0,
			clientX: 0,
			clientY: 0
		};
		pendingSelectAllRef.current = inputSettings.selectOnEdit;
		flushSync(() => {
			onEditingChange(true);
		});
		requestAnimationFrame(() => {
			const input = inputRef.current;
			if (!input) return;
			if (inputSettings.selectOnEdit) {
				input.focus({ preventScroll: true });
				requestAnimationFrame(() => {
					try {
						input.select();
					} catch {}
				});
				return;
			}
			focusInputForEdit(input, pointerPoint);
		});
	}, [
		disabled,
		inputSettings.selectOnEdit,
		onEditingChange,
		inputRef
	]);
	const scheduleEditMode = useCallback((pointerPoint) => enterEditMode(pointerPoint), [enterEditMode]);
	const handleScrubGestureDown = useCallback((event) => {
		scrubGestureRef.current = {
			active: true,
			moved: false,
			delta: 0,
			clientX: event.clientX,
			clientY: event.clientY
		};
		setScrubHolding(true);
	}, []);
	const finishScrubGesture = useCallback(() => {
		const gesture = scrubGestureRef.current;
		if (!gesture.active) return;
		const pointerPoint = {
			clientX: gesture.clientX,
			clientY: gesture.clientY
		};
		scrubGestureRef.current = {
			active: false,
			moved: false,
			delta: 0,
			clientX: 0,
			clientY: 0
		};
		setScrubHolding(false);
		if (disabled) return;
		if (gesture.moved) {
			onEditingChange(false);
			inputRef.current?.blur();
			return;
		}
		scheduleEditMode(pointerPoint);
	}, [
		disabled,
		inputRef,
		onEditingChange,
		scheduleEditMode
	]);
	const handleDisplayClick = useCallback(() => {
		if (logoScrollEnabled) {
			scheduleEditMode();
			return;
		}
		finishScrubGesture();
	}, [
		finishScrubGesture,
		logoScrollEnabled,
		scheduleEditMode
	]);
	const handleDisplayDoubleClick = useCallback((event) => {
		if (disabled || !resetOnDoubleClick) return;
		event.preventDefault();
		scrubGestureRef.current = {
			active: false,
			moved: false,
			delta: 0,
			clientX: 0,
			clientY: 0
		};
		setScrubHolding(false);
		onEditingChange(false);
		inputRef.current?.blur();
		onDoubleClickReset();
	}, [
		disabled,
		inputRef,
		onDoubleClickReset,
		onEditingChange,
		resetOnDoubleClick
	]);
	const handleDisplayKeyDown = useCallback((event) => {
		if (disabled) return;
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			scheduleEditMode();
		}
	}, [disabled, scheduleEditMode]);
	useEffect(() => {
		if (logoScrollEnabled) return;
		const handleWindowPointerMove = (event) => {
			const gesture = scrubGestureRef.current;
			if (!gesture.active || gesture.moved) return;
			const axisDelta = direction === "vertical" ? event.movementY : event.movementX;
			gesture.delta += axisDelta;
			if (Math.abs(gesture.delta) >= pixelSensitivity) gesture.moved = true;
		};
		const handleWindowPointerUp = () => {
			queueMicrotask(() => {
				finishScrubGesture();
			});
		};
		window.addEventListener("pointermove", handleWindowPointerMove, true);
		window.addEventListener("pointerup", handleWindowPointerUp, true);
		return () => {
			window.removeEventListener("pointermove", handleWindowPointerMove, true);
			window.removeEventListener("pointerup", handleWindowPointerUp, true);
		};
	}, [
		direction,
		finishScrubGesture,
		logoScrollEnabled,
		pixelSensitivity
	]);
	const calligraphLayoutKey = usesGroupedControl ? "group" : "field";
	const fieldShellClass = cn(usesGroupedControl ? "relative flex min-w-0 flex-1 overflow-hidden" : cn(fieldChromeClass, "scrub-bound-field relative isolate shrink-0 w-full px-0 py-0 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50"));
	const nativeInputClass = cn(fieldClass, usesGroupedControl ? "w-full rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent" : "scrub-bound-field border-0 bg-transparent shadow-none focus-visible:ring-0", "absolute inset-0 z-[1] text-start leading-none", showNativeInput ? "cursor-text caret-current text-foreground" : "pointer-events-none opacity-0");
	const calligraphOverlay = /* @__PURE__ */ jsx("div", {
		className: cn(cn("absolute inset-0 z-[2] flex min-w-0 items-center justify-start overflow-hidden text-foreground", !logoScrollEnabled && getScrubCursorClass(direction, atBound, scrubBounds), !logoScrollEnabled && "select-none", logoScrollEnabled && "cursor-text", disabled && "cursor-not-allowed opacity-50"), showDisplaySurface ? "opacity-100" : "pointer-events-none opacity-0"),
		"data-slot": "scrub-number-display-overlay",
		children: /* @__PURE__ */ jsx(motion.div, {
			...grouped ? {} : { layoutRoot: true },
			ref: calligraphClipRef,
			className: cn("pointer-events-none relative flex min-w-0 items-center justify-start overflow-hidden", displayContentClass),
			"data-slot": "scrub-number-calligraph-value",
			style: {
				height: "100%",
				minHeight: 0
			},
			children: /* @__PURE__ */ jsx(CalligraphNumber, {
				contentRef: calligraphContentRef,
				layoutKey: calligraphLayoutKey,
				settings: calligraph,
				trend: nudgeTrend,
				value: displayValue
			})
		})
	});
	const displayLayer = /* @__PURE__ */ jsx("div", {
		"aria-label": typeof inputProps?.["aria-label"] === "string" ? inputProps["aria-label"] : void 0,
		"aria-valuemax": max,
		"aria-valuemin": min,
		"aria-valuenow": numericValue,
		"aria-valuetext": isDisplayTruncated ? displayValue : void 0,
		"aria-hidden": !showDisplaySurface,
		className: cn("relative z-[3] flex min-w-0 flex-1 items-stretch", !showDisplaySurface && "pointer-events-none"),
		"data-slot": usesGroupedControl ? "input-group-control" : "scrub-number-scrubbable",
		role: "spinbutton",
		tabIndex: disabled || !showDisplaySurface ? -1 : 0,
		title: isDisplayTruncated ? displayValue : void 0,
		onFocus: () => {
			if (!disabled && !editing && !scrubHolding) scheduleEditMode();
		},
		onClick: logoScrollEnabled ? handleDisplayClick : void 0,
		onDoubleClick: handleDisplayDoubleClick,
		onKeyDown: handleDisplayKeyDown
	});
	const scrubWrappedDisplay = logoScrollEnabled ? displayLayer : /* @__PURE__ */ jsxs(NumberFieldScrubArea, {
		className: cn("absolute inset-0 z-[2] flex min-w-0 items-stretch", getScrubCursorClass(direction, atBound, scrubBounds), "select-none", !showDisplaySurface && "pointer-events-none"),
		direction,
		pixelSensitivity,
		children: [/* @__PURE__ */ jsx(NumberFieldScrubAreaCursor, {}), /* @__PURE__ */ jsx("div", {
			className: "relative flex min-w-0 flex-1",
			onClick: handleDisplayClick,
			onDoubleClick: handleDisplayDoubleClick,
			onKeyDown: handleDisplayKeyDown,
			onPointerDown: handleScrubGestureDown,
			children: displayLayer
		})]
	});
	const fieldContent = /* @__PURE__ */ jsxs("div", {
		className: fieldShellClass,
		children: [
			/* @__PURE__ */ jsx(NumberFieldInput, {
				...inputProps,
				"aria-hidden": !showNativeInput,
				className: nativeInputClass,
				"data-editing": showNativeInput ? "" : void 0,
				disabled,
				"data-slot": usesGroupedControl ? "input-group-control" : void 0,
				tabIndex: showNativeInput ? void 0 : -1,
				onBlur: () => {
					scrubGestureRef.current = {
						active: false,
						moved: false,
						delta: 0,
						clientX: 0,
						clientY: 0
					};
					setScrubHolding(false);
					onEditingChange(false);
				},
				onFocus: (event) => {
					if (disabled) return;
					if (scrubGestureRef.current.active || scrubHolding) return;
					onEditingChange(true);
					if (!pendingSelectAllRef.current) return;
					pendingSelectAllRef.current = false;
					const input = event.currentTarget;
					queueMicrotask(() => {
						try {
							input.select();
						} catch {}
					});
				},
				onDoubleClick: resetOnDoubleClick ? (event) => {
					event.preventDefault();
					scrubGestureRef.current = {
						active: false,
						moved: false,
						delta: 0,
						clientX: 0,
						clientY: 0
					};
					setScrubHolding(false);
					onEditingChange(false);
					event.currentTarget.blur();
					onDoubleClickReset();
				} : void 0,
				style: {
					caretColor: showNativeInput ? "currentColor" : "transparent",
					height: "100%",
					minHeight: 0
				}
			}),
			calligraphOverlay,
			scrubWrappedDisplay
		]
	});
	const inputGroup = /* @__PURE__ */ jsxs(InputGroup, {
		className: cn("h-7 scrub-bound-field w-full"),
		"data-logo-scroll": logoScrollEnabled ? "" : void 0,
		children: [fieldContent, logoScrollEnabled ? /* @__PURE__ */ jsx(InputGroupAddon, {
			align: "inline-end",
			className: cn("shrink-0 select-none pr-1.5", getScrubCursorClass(direction, atBound, scrubBounds)),
			"data-slot": "scrub-number-logo-scroll",
			children: /* @__PURE__ */ jsxs(NumberFieldScrubArea, {
				className: "flex size-7 items-center justify-center",
				direction,
				pixelSensitivity,
				children: [/* @__PURE__ */ jsx(NumberFieldScrubAreaCursor, {}), /* @__PURE__ */ jsx(ScrubLogoIcon, {
					className: "pointer-events-none size-3.5 shrink-0 text-muted-foreground",
					name: logo.icon
				})]
			})
		}) : null]
	});
	return usesInputGroup ? inputGroup : fieldContent;
}
function ScrubNumberField({ allowWheelScrub = false, boundFeedback = "none", calligraph = DEFAULT_CALLIGRAPH_SETTINGS, className, defaultResetValue, defaultValue, direction = "horizontal", disabled, format, grouped = false, inputSettings = DEFAULT_INPUT_SETTINGS, label, labelClassName, largeStep = 10, logo = DEFAULT_LOGO_SETTINGS, max, min, onValueChange, onValueCommitted, pixelSensitivity = 2, smallStep = .1, step = 1, value: valueProp, inputClassName,...props }) {
	const [value, setValue] = useControllableState({
		prop: valueProp,
		defaultProp: defaultValue ?? 0,
		onChange: onValueChange,
		caller: "ScrubNumberField"
	});
	const [editing, setEditing] = useState(false);
	const [scrubbing, setScrubbing] = useState(false);
	const [boundFeedbackState, setBoundFeedbackState] = useState(null);
	const [nudgeTrend, setNudgeTrend] = useState(0);
	const boundFeedbackTickRef = useRef(0);
	const prevValueRef = useRef(value);
	const scrubbingRef = useRef(false);
	const inputRef = useRef(null);
	const displayValue = formatFieldValue(value, format);
	const triggerBoundFeedback = useCallback((edge, source) => {
		if (boundFeedback === "none") return;
		boundFeedbackTickRef.current += 1;
		setBoundFeedbackState({
			edge,
			overflow: 1,
			source,
			tick: boundFeedbackTickRef.current
		});
	}, [boundFeedback]);
	const handleValueChange = useCallback((next, eventDetails) => {
		const num = next ?? 0;
		const reason = eventDetails.reason;
		const prev = prevValueRef.current;
		if (boundFeedback !== "none" && (reason === "scrub" || reason === "wheel" || reason === "keyboard")) {
			if (reason === "scrub") {
				setScrubbing(true);
				scrubbingRef.current = true;
			}
			const source = reason === "wheel" ? "wheel" : reason === "scrub" ? "scrub" : "key";
			if (max != null && num >= max && prev < max) triggerBoundFeedback("max", source);
			if (min != null && num <= min && prev > min) triggerBoundFeedback("min", source);
		}
		if (num !== prev) setNudgeTrend(num > prev ? 1 : -1);
		prevValueRef.current = num;
		setValue(num);
	}, [
		boundFeedback,
		max,
		min,
		setValue,
		triggerBoundFeedback
	]);
	const handleValueCommitted = useCallback((next, eventDetails) => {
		onValueCommitted?.(next ?? 0);
		if (eventDetails.reason === "scrub") {
			setScrubbing(false);
			if (!editing && scrubbingRef.current) inputRef.current?.blur();
			scrubbingRef.current = false;
		}
	}, [editing, onValueCommitted]);
	const resetOnDoubleClick = defaultResetValue != null;
	const handleDoubleClickReset = useCallback(() => {
		const resetValue = defaultResetValue ?? defaultValue;
		if (resetValue == null) return;
		const bounded = clampNumber(resetValue, min, max);
		prevValueRef.current = bounded;
		setValue(bounded);
		onValueCommitted?.(bounded);
	}, [
		defaultResetValue,
		defaultValue,
		max,
		min,
		onValueCommitted,
		setValue
	]);
	const field = /* @__PURE__ */ jsx(NumberFieldRoot, {
		allowWheelScrub,
		className: cn("relative shrink-0", className),
		disabled,
		format,
		inputRef,
		largeStep,
		max,
		min,
		onValueChange: handleValueChange,
		onValueCommitted: handleValueCommitted,
		smallStep,
		step,
		value,
		children: /* @__PURE__ */ jsx(ScrubBoundFeedback, {
			boundFeedback: boundFeedbackState,
			className: logo.enabled || grouped ? "w-full min-w-0" : void 0,
			mode: boundFeedback,
			onFeedbackComplete: () => {
				setBoundFeedbackState(null);
			},
			children: /* @__PURE__ */ jsx(ScrubFieldBody, {
				boundFeedback,
				calligraph,
				direction,
				disabled,
				displayValue,
				editing,
				grouped,
				inputClassName,
				inputProps: props,
				inputRef,
				inputSettings,
				logo,
				max,
				min,
				nudgeTrend,
				numericValue: value,
				onBoundFeedback: triggerBoundFeedback,
				onEditingChange: setEditing,
				onDoubleClickReset: handleDoubleClickReset,
				resetOnDoubleClick,
				pixelSensitivity,
				scrubbing
			})
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