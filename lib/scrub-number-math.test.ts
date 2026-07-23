import { afterEach, describe, expect, it } from "vitest"

import {
  boundOverflow,
  clampNumber,
  countDraftDecimalPlaces,
  formatDisplayValue,
  formatMinimalDisplayValue,
  getAtBound,
  getBoundEdge,
  getCoarseModifierLabel,
  getDecimalPlaces,
  getFineModifierLabel,
  getScrubPointerDelta,
  hasExceededScrubThreshold,
  isCoarseModifierPressed,
  isFineModifierPressed,
  isMacPlatform,
  isModifierKeyPressed,
  quantizeNumber,
  resolveActiveStep,
  resolveCoarseModifierKey,
  resolveFineModifierKey,
  resolveFineStep,
  resolveQuantizeStep,
  resolveScrubStepModifiers,
  applyStepDelta,
  consumeWheelDelta,
  normalizeCoarseModifier,
  normalizeFineModifier,
  normalizeFiniteNumber,
  normalizeNumberFieldBounds,
  normalizePositiveFiniteStep,
  normalizeWheelDelta,
  pickAlternateModifier,
  preserveDisplayDraft,
  resolveDisplayDecimalPlaces,
  resolveExclusiveModifiers,
  sanitizeNumericDraft,
  stepFromDecimalPlaces,
  getValueDecimalPlaces,
} from "@/lib/scrub-number-math"
import {
  DEFAULT_SCRUB_FIELD_SETTINGS,
  getScrubCursorClass,
  normalizeScrubFieldSettings,
} from "@/components/ui/scrub-number-input"

describe("clampNumber", () => {
  it("returns value when no bounds", () => {
    expect(clampNumber(5)).toBe(5)
  })

  it("clamps to min and max", () => {
    expect(clampNumber(-5, 0, 10)).toBe(0)
    expect(clampNumber(15, 0, 10)).toBe(10)
    expect(clampNumber(5, 0, 10)).toBe(5)
  })

  it("ignores non-finite bounds", () => {
    expect(clampNumber(5, Number.NaN, 10)).toBe(5)
    expect(clampNumber(5, 0, Number.POSITIVE_INFINITY)).toBe(5)
  })
})

describe("normalizeNumberFieldBounds", () => {
  it("swaps inverted bounds", () => {
    expect(normalizeNumberFieldBounds(100, 0)).toEqual({ min: 0, max: 100 })
  })

  it("drops non-finite bounds", () => {
    expect(normalizeNumberFieldBounds(Number.NaN, 10)).toEqual({
      min: undefined,
      max: 10,
    })
  })
})

describe("normalizePositiveFiniteStep", () => {
  it("falls back for invalid steps", () => {
    expect(normalizePositiveFiniteStep(0)).toBe(1)
    expect(normalizePositiveFiniteStep(Number.NaN, 2)).toBe(2)
  })
})

describe("getBoundEdge", () => {
  it("detects max edge when already at max", () => {
    expect(getBoundEdge(10, 11, 0, 10)).toBe("max")
  })

  it("detects min edge when already at min", () => {
    expect(getBoundEdge(0, -1, 0, 10)).toBe("min")
  })

  it("returns null when not at a bound", () => {
    expect(getBoundEdge(5, 6, 0, 10)).toBeNull()
  })
})

describe("getAtBound", () => {
  it("returns min or max when value is at bound", () => {
    expect(getAtBound(0, 0, 10)).toBe("min")
    expect(getAtBound(10, 0, 10)).toBe("max")
    expect(getAtBound(5, 0, 10)).toBeNull()
  })
})

describe("quantizeNumber", () => {
  it("snaps to integer steps", () => {
    expect(quantizeNumber(5.4, 1)).toBe(5)
    expect(quantizeNumber(5.6, 1)).toBe(6)
  })

  it("snaps to fractional steps", () => {
    expect(quantizeNumber(1.23, 0.1)).toBe(1.2)
    expect(quantizeNumber(1.26, 0.1)).toBe(1.3)
  })

  it("returns value when step is invalid", () => {
    expect(quantizeNumber(3.3, 0)).toBe(3.3)
  })
})

describe("getDecimalPlaces", () => {
  it("counts fractional digits from step", () => {
    expect(getDecimalPlaces(1)).toBe(0)
    expect(getDecimalPlaces(0.01)).toBe(2)
    expect(getDecimalPlaces(0.125)).toBe(3)
  })
})

describe("formatDisplayValue", () => {
  const baseFormat = {
    alwaysShowSign: false,
  }

  it("shows minimal integers by default", () => {
    expect(formatDisplayValue(48, baseFormat, null)).toBe("48")
    expect(formatDisplayValue(12.5, baseFormat, null)).toBe("12.5")
  })

  it("keeps user-chosen decimal places", () => {
    expect(formatDisplayValue(12.5, baseFormat, 2)).toBe("12.50")
  })

  it("prefixes positive values when alwaysShowSign", () => {
    expect(formatDisplayValue(5, { alwaysShowSign: true }, null)).toBe("+5")
  })
})

describe("resolveActiveStep", () => {
  const base = {
    step: 1,
    shiftStep: 10,
    fineStep: 0.1,
  }

  it("returns base step by default", () => {
    expect(resolveActiveStep(base)).toBe(1)
  })

  it("returns coarse and fine steps with modifiers", () => {
    expect(resolveActiveStep({ ...base, coarse: true })).toBe(10)
    expect(resolveActiveStep({ ...base, fine: true })).toBe(0.1)
  })

  it("prefers coarse over fine when both are active", () => {
    expect(resolveActiveStep({ ...base, coarse: true, fine: true })).toBe(10)
  })
})

describe("normalizeWheelDelta", () => {
  it("scales line and page delta modes", () => {
    expect(normalizeWheelDelta(2, 0)).toBe(2)
    expect(normalizeWheelDelta(2, 1)).toBe(32)
    expect(normalizeWheelDelta(1, 2)).toBe(100)
  })
})

describe("consumeWheelDelta", () => {
  it("accumulates delta until sensitivity is reached", () => {
    expect(consumeWheelDelta(0, 10, 20)).toEqual({
      accumulated: 10,
      steps: 0,
      direction: 0,
    })
    expect(consumeWheelDelta(10, 10, 20)).toEqual({
      accumulated: 0,
      steps: 1,
      direction: -1,
    })
  })

  it("emits multiple steps and keeps remainder", () => {
    expect(consumeWheelDelta(0, 55, 20)).toEqual({
      accumulated: 15,
      steps: 2,
      direction: -1,
    })
  })

  it("treats negative delta as upward scroll", () => {
    expect(consumeWheelDelta(0, -40, 20)).toEqual({
      accumulated: 0,
      steps: 2,
      direction: 1,
    })
  })
})

describe("getScrubPointerDelta", () => {
  it("uses horizontal delta by default", () => {
    expect(getScrubPointerDelta({ clientX: 20, clientY: 0 }, 10, 0, "horizontal")).toBe(
      10,
    )
  })

  it("uses vertical delta when direction is vertical", () => {
    expect(getScrubPointerDelta({ clientX: 0, clientY: 5 }, 0, 20, "vertical")).toBe(
      15,
    )
  })
})

describe("hasExceededScrubThreshold", () => {
  it("requires more than 3px movement by default", () => {
    expect(
      hasExceededScrubThreshold({ clientX: 12, clientY: 0 }, 10, 0, "horizontal"),
    ).toBe(false)
    expect(
      hasExceededScrubThreshold({ clientX: 14, clientY: 0 }, 10, 0, "horizontal"),
    ).toBe(true)
  })

  it("respects custom threshold", () => {
    expect(
      hasExceededScrubThreshold(
        { clientX: 12, clientY: 0 },
        10,
        0,
        "horizontal",
        1,
      ),
    ).toBe(true)
  })
})

describe("resolveFineStep", () => {
  it("defaults to one tenth of step", () => {
    expect(resolveFineStep(10)).toBe(1)
    expect(resolveFineStep(1)).toBe(0.1)
  })

  it("uses explicit fineStep when provided", () => {
    expect(resolveFineStep(10, 0.5)).toBe(0.5)
  })
})

describe("sanitizeNumericDraft", () => {
  it("keeps valid numeric drafts", () => {
    expect(sanitizeNumericDraft("")).toBe("")
    expect(sanitizeNumericDraft("-12.5")).toBe("-12.5")
    expect(sanitizeNumericDraft("+3.14")).toBe("+3.14")
    expect(sanitizeNumericDraft(".")).toBe(".")
    expect(sanitizeNumericDraft("-")).toBe("-")
  })

  it("strips non-numeric characters", () => {
    expect(sanitizeNumericDraft("12abc", "12")).toBe("12")
    expect(sanitizeNumericDraft("a-1b2c", "")).toBe("12")
    expect(sanitizeNumericDraft("--12", "1")).toBe("1")
  })

  it("rejects corrupting drafts instead of rewriting them", () => {
    expect(sanitizeNumericDraft("1e5", "12")).toBe("12")
    expect(sanitizeNumericDraft("1.2.3", "1.2")).toBe("1.2")
  })
})

describe("fine modifier", () => {
  const originalNavigator = globalThis.navigator

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      configurable: true,
    })
  })

  function mockNavigator(platform: string, userAgent = "") {
    Object.defineProperty(globalThis, "navigator", {
      value: { platform, userAgent },
      configurable: true,
    })
  }

  it("detects Mac platforms", () => {
    mockNavigator("MacIntel", "Mozilla/5.0 (Macintosh; Intel Mac OS X)")
    expect(isMacPlatform()).toBe(true)

    mockNavigator("Win32")
    expect(isMacPlatform()).toBe(false)
  })

  it("resolves explicit fine modifiers", () => {
    expect(resolveFineModifierKey("shift")).toBe("shift")
    expect(resolveFineModifierKey("alt")).toBe("alt")
    expect(resolveFineModifierKey("meta")).toBe("meta")
  })

  it("normalizes legacy auto fine modifier by platform", () => {
    mockNavigator("MacIntel")
    expect(normalizeFineModifier("auto")).toBe("meta")

    mockNavigator("Win32")
    expect(normalizeFineModifier("auto")).toBe("alt")
  })

  it("detects pressed fine modifier keys", () => {
    expect(
      isFineModifierPressed(
        { shiftKey: true, altKey: false, metaKey: false },
        "shift",
      ),
    ).toBe(true)
    expect(
      isFineModifierPressed(
        { shiftKey: false, altKey: true, metaKey: false },
        "alt",
      ),
    ).toBe(true)
    expect(
      isFineModifierPressed(
        { shiftKey: false, altKey: false, metaKey: true },
        "meta",
      ),
    ).toBe(true)
  })

  it("uses getModifierState as a fallback during pointer drags", () => {
    expect(
      isModifierKeyPressed(
        {
          shiftKey: false,
          altKey: false,
          metaKey: false,
          getModifierState: (key) => key === "Meta",
        },
        "meta",
      ),
    ).toBe(true)
  })

  it("returns modifier labels", () => {
    expect(getFineModifierLabel("shift")).toBe("Shift")
    expect(getFineModifierLabel("alt")).toBe("Alt")
    expect(getFineModifierLabel("meta")).toBe("Cmd")
  })
})

describe("resolveExclusiveModifiers", () => {
  it("keeps distinct modifiers unchanged", () => {
    expect(resolveExclusiveModifiers("alt", "shift")).toEqual({
      fine: "alt",
      coarse: "shift",
    })
  })

  it("reassigns coarse when both modifiers match", () => {
    expect(resolveExclusiveModifiers("alt", "alt")).toEqual({
      fine: "alt",
      coarse: "shift",
    })
  })

  it("picks an alternate modifier that differs from the excluded key", () => {
    expect(pickAlternateModifier("alt", "alt")).toBe("shift")
    expect(pickAlternateModifier("shift", "shift")).toBe("alt")
  })
})

describe("coarse modifier", () => {
  it("resolves explicit coarse keys", () => {
    expect(resolveCoarseModifierKey("shift")).toBe("shift")
    expect(resolveCoarseModifierKey("alt")).toBe("alt")
    expect(resolveCoarseModifierKey("meta")).toBe("meta")
  })

  it("normalizes legacy auto coarse modifier to shift", () => {
    expect(normalizeCoarseModifier("auto")).toBe("shift")
  })

  it("detects configured coarse keys", () => {
    expect(
      isCoarseModifierPressed(
        { shiftKey: true, altKey: false, metaKey: false },
        "shift",
      ),
    ).toBe(true)
    expect(
      isCoarseModifierPressed(
        { shiftKey: false, altKey: true, metaKey: false },
        "alt",
      ),
    ).toBe(true)
    expect(getCoarseModifierLabel("meta")).toBe("Cmd")
  })

  it("resolves scrub modifiers with coarse taking priority", () => {
    expect(
      resolveScrubStepModifiers(
        { shiftKey: true, altKey: true, metaKey: false },
        { fineModifier: "alt", coarseModifier: "shift" },
      ),
    ).toEqual({ coarse: true, fine: true })
  })
})

describe("countDraftDecimalPlaces", () => {
  it("reads decimal places from the typed draft", () => {
    expect(countDraftDecimalPlaces("12.0000")).toBe(4)
    expect(countDraftDecimalPlaces("48")).toBe(0)
    expect(countDraftDecimalPlaces("+3.50")).toBe(2)
  })
})

describe("formatMinimalDisplayValue", () => {
  it("avoids forced trailing zeros", () => {
    expect(formatMinimalDisplayValue(48)).toBe("48")
    expect(formatMinimalDisplayValue(0.1 + 0.2)).toBe("0.3")
  })

  it("uses plain decimal notation for very large values", () => {
    expect(formatMinimalDisplayValue(1e21)).toBe("1000000000000000000000")
    expect(formatMinimalDisplayValue(2.836e30)).toBe(
      "2836000000000000000000000000000",
    )
    expect(formatMinimalDisplayValue(2.836e30)).not.toMatch(/e/i)
  })
})

describe("getValueDecimalPlaces", () => {
  it("ignores float noise", () => {
    expect(getValueDecimalPlaces(0.1 + 0.2)).toBe(1)
    expect(getValueDecimalPlaces(48)).toBe(0)
  })
})

describe("resolveQuantizeStep", () => {
  it("uses fine step only when value has no finer precision", () => {
    expect(
      resolveQuantizeStep({
        step: 1,
        fineStep: 0.1,
        fine: true,
        currentValue: 12,
      }),
    ).toBe(0.1)
  })

  it("preserves user-entered precision during fine stepping", () => {
    expect(
      resolveQuantizeStep({
        step: 1,
        fineStep: 0.1,
        fine: true,
        currentValue: 34.456,
      }),
    ).toBe(0.001)
  })

  it("preserves existing value decimals for normal and coarse changes", () => {
    expect(
      resolveQuantizeStep({
        step: 1,
        fineStep: 0.1,
        currentValue: 12.5,
      }),
    ).toBe(0.1)
  })

  it("honors explicit user decimal places over the numeric value", () => {
    expect(
      resolveQuantizeStep({
        step: 1,
        fineStep: 0.1,
        fine: true,
        currentValue: 34.5,
        userDecimalPlaces: 3,
      }),
    ).toBe(0.001)
  })

  it("falls back to the base step for integer values", () => {
    expect(
      resolveQuantizeStep({
        step: 1,
        fineStep: 0.1,
        currentValue: 12,
      }),
    ).toBe(1)
  })
})

describe("resolveDisplayDecimalPlaces", () => {
  it("infers decimal places from the prior draft", () => {
    expect(resolveDisplayDecimalPlaces("48.9")).toBe(1)
    expect(resolveDisplayDecimalPlaces("12.50")).toBe(2)
    expect(resolveDisplayDecimalPlaces("1.0000")).toBe(4)
    expect(resolveDisplayDecimalPlaces("48")).toBeNull()
  })

  it("prefers explicit user decimal places over the draft", () => {
    expect(resolveDisplayDecimalPlaces("48.9", 3)).toBe(3)
    expect(resolveDisplayDecimalPlaces("48", 2)).toBe(2)
  })

  it("adopts active step decimals for integer drafts", () => {
    expect(resolveDisplayDecimalPlaces("49", null, 0.1)).toBe(1)
    expect(resolveDisplayDecimalPlaces("49", null, 1)).toBeNull()
  })
})

describe("preserveDisplayDraft", () => {
  it("keeps the visible draft when it matches the numeric value", () => {
    expect(preserveDisplayDraft("1.0000", 1, "1")).toBe("1.0000")
    expect(preserveDisplayDraft("+12.50", 12.5, "12.5")).toBe("+12.50")
  })

  it("falls back when the draft is empty or stale", () => {
    expect(preserveDisplayDraft("", 1, "1.0000")).toBe("1.0000")
    expect(preserveDisplayDraft("9", 1, "1.0000")).toBe("1.0000")
  })
})

describe("applyStepDelta", () => {
  it("preserves decimals when coarse stepping from a fractional value", () => {
    expect(
      applyStepDelta(12.5, 10, { step: 1, fineStep: 0.1 }),
    ).toBe(22.5)
  })

  it("applies fine increments on the fine grid", () => {
    expect(
      applyStepDelta(12, 0.1, { step: 1, fineStep: 0.1, fine: true }),
    ).toBe(12.1)
  })

  it("preserves user-entered precision during fine stepping", () => {
    expect(
      applyStepDelta(34.456, 0.1, {
        step: 1,
        fineStep: 0.1,
        fine: true,
        userDecimalPlaces: 3,
      }),
    ).toBe(34.556)
  })

  it("preserves typed precision without snapping to the fine step grid", () => {
    expect(
      applyStepDelta(34.456, 0.1, {
        step: 1,
        fineStep: 0.1,
        fine: true,
      }),
    ).toBe(34.556)
  })
})

describe("quantizeNumber with active step", () => {
  it("preserves fine increments when quantizing to fine step", () => {
    expect(quantizeNumber(1.3, 0.1)).toBe(1.3)
    expect(quantizeNumber(1.34, 0.1)).toBe(1.3)
  })
})

describe("boundOverflow", () => {
  it("measures overflow past max and min", () => {
    expect(boundOverflow(15, "max", 0, 10)).toBe(5)
    expect(boundOverflow(-3, "min", 0, 10)).toBe(3)
  })

  it("returns zero when attempted value is inside bounds", () => {
    expect(boundOverflow(10, "max", 0, 10)).toBe(0)
    expect(boundOverflow(0, "min", 0, 10)).toBe(0)
  })

  it("falls back when bounds are missing", () => {
    expect(boundOverflow(99, "max")).toBe(1)
    expect(boundOverflow(-1, "min")).toBe(1)
  })
})

describe("normalizeScrubFieldSettings", () => {
  it("swaps min and max when inverted", () => {
    const normalized = normalizeScrubFieldSettings({
      ...DEFAULT_SCRUB_FIELD_SETTINGS,
      min: 100,
      max: 0,
    })

    expect(normalized.min).toBe(0)
    expect(normalized.max).toBe(100)
  })

  it("clamps invalid pixel sensitivity", () => {
    const normalized = normalizeScrubFieldSettings({
      ...DEFAULT_SCRUB_FIELD_SETTINGS,
      pixelSensitivity: -5,
    })

    expect(normalized.pixelSensitivity).toBe(2)
  })

  it("rejects smallStep that is not finer than step", () => {
    const normalized = normalizeScrubFieldSettings({
      ...DEFAULT_SCRUB_FIELD_SETTINGS,
      step: 1,
      smallStep: 5,
    })

    expect(normalized.smallStep).toBe(0.1)
  })

  it("preserves bound feedback modes", () => {
    const normalized = normalizeScrubFieldSettings({
      ...DEFAULT_SCRUB_FIELD_SETTINGS,
      boundFeedback: "shake",
    })

    expect(normalized.boundFeedback).toBe("shake")
  })
})

describe("getScrubCursorClass", () => {
  it("returns directional resize cursors", () => {
    expect(getScrubCursorClass({ direction: "horizontal" })).toBe(
      "cursor-ew-resize",
    )
    expect(getScrubCursorClass({ direction: "vertical" })).toBe(
      "cursor-ns-resize",
    )
  })

  it("returns edge-aware cursors at bounds", () => {
    expect(
      getScrubCursorClass({ direction: "horizontal" }, "min", { min: 0, max: 10 }),
    ).toBe("cursor-e-resize")
    expect(
      getScrubCursorClass({ direction: "horizontal" }, "max", { min: 0, max: 10 }),
    ).toBe("cursor-w-resize")
    expect(
      getScrubCursorClass({ direction: "vertical" }, "min", { min: 0, max: 10 }),
    ).toBe("cursor-n-resize")
    expect(
      getScrubCursorClass({ direction: "vertical" }, "max", { min: 0, max: 10 }),
    ).toBe("cursor-s-resize")
  })

  it("returns not-allowed when min equals max", () => {
    expect(
      getScrubCursorClass({ direction: "horizontal" }, null, { min: 5, max: 5 }),
    ).toBe("cursor-not-allowed")
  })
})

describe("sanitizeNumericDraft edge cases", () => {
  it("preserves intermediate sign and dot drafts", () => {
    expect(sanitizeNumericDraft("-")).toBe("-")
    expect(sanitizeNumericDraft(".")).toBe(".")
    expect(sanitizeNumericDraft("+")).toBe("+")
  })

  it("strips scientific notation letters", () => {
    expect(sanitizeNumericDraft("1e5", "1")).toBe("1")
    expect(sanitizeNumericDraft("-2.5e-3", "-2.5")).toBe("-2.5")
  })
})

describe("empty draft commit semantics", () => {
  it("documents that Number('') parses as zero", () => {
    expect(Number("")).toBe(0)
    expect(Number.isFinite(Number(""))).toBe(true)
  })
})

describe("stepFromDecimalPlaces", () => {
  it("returns powers of ten for positive decimal counts", () => {
    expect(stepFromDecimalPlaces(0)).toBe(1)
    expect(stepFromDecimalPlaces(2)).toBe(0.01)
    expect(stepFromDecimalPlaces(3)).toBe(0.001)
  })
})
