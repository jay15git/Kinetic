import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  DEFAULT_SCRUB_SETTINGS,
  ScrubNumberInput,
  useNumberScrub,
  type UseNumberScrubOptions,
} from "@/components/ui/scrub-number-input"
import "./scrub-number-input.css"

function ScrubHarness({
  options,
}: {
  options: UseNumberScrubOptions & { disabled?: boolean }
}) {
  const scrub = useNumberScrub(options)

  return (
    <div ref={scrub.surfaceRef} data-testid="surface">
      <div
        ref={scrub.displaySurfaceRef}
        data-testid="display"
        tabIndex={options.disabled ? -1 : 0}
        {...scrub.scrubSurfaceHandlers}
        {...scrub.spinbuttonProps}
        onBlur={scrub.onDisplayBlur}
        onFocus={scrub.onDisplayFocus}
        onKeyDown={scrub.handleDisplayKeyDown}
      >
        {scrub.displayValue}
      </div>
      {scrub.editing ? (
        <input data-testid="edit-input" {...scrub.inputProps} />
      ) : null}
      <span data-testid="editing">{String(scrub.editing)}</span>
      <span data-testid="invalid">{String(scrub.invalid)}</span>
      <span data-testid="bound-feedback">
        {scrub.boundFeedback ? scrub.boundFeedback.edge : "none"}
      </span>
    </div>
  )
}

function ControlledScrubHarness(
  props: Omit<UseNumberScrubOptions, "value" | "onChange"> & {
    initialValue?: number
  },
) {
  const [value, setValue] = useState(props.initialValue ?? 10)

  return (
    <div>
      <button type="button" data-testid="set-parent" onClick={() => setValue(99)}>
        set parent
      </button>
      <ScrubHarness
        options={{
          ...props,
          value,
          onChange: setValue,
        }}
      />
    </div>
  )
}

function pointerSequence(
  target: Element,
  events: Array<{
    type: "pointerdown" | "pointermove" | "pointerup"
    clientX?: number
    clientY?: number
    movementX?: number
    movementY?: number
  }>,
) {
  for (const event of events) {
    const init = {
      bubbles: true,
      clientX: event.clientX ?? 0,
      clientY: event.clientY ?? 0,
      movementX: event.movementX ?? 0,
      movementY: event.movementY ?? 0,
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      buttons: event.type === "pointerup" ? 0 : 1,
    }

    if (event.type === "pointerdown") {
      fireEvent.pointerDown(target, init)
      continue
    }

    if (event.type === "pointermove") {
      fireEvent.pointerMove(target, init)
      continue
    }

    fireEvent.pointerUp(target, init)
  }
}

describe("useNumberScrub", () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  beforeEach(() => {
    HTMLElement.prototype.setPointerCapture = vi.fn()
    HTMLElement.prototype.releasePointerCapture = vi.fn()
  })

  it("enters edit mode on click without crossing scrub threshold", async () => {
    const onChange = vi.fn()
    const onValueCommit = vi.fn()

    render(
      <ScrubHarness
        options={{
          value: 10,
          onChange,
          onValueCommit,
        }}
      />,
    )

    const display = screen.getByTestId("display")

    await act(async () => {
      pointerSequence(display, [
        { type: "pointerdown", clientX: 10, clientY: 10 },
        { type: "pointerup", clientX: 11, clientY: 10 },
      ])
    })

    expect(screen.getByTestId("editing")).toHaveTextContent("true")
    expect(screen.getByTestId("edit-input")).toBeInTheDocument()
    expect(onValueCommit).not.toHaveBeenCalled()
  })

  it("scrubs without entering edit and commits once on pointer up", async () => {
    const onChange = vi.fn()
    const onValueCommit = vi.fn()

    render(
      <ScrubHarness
        options={{
          value: 10,
          onChange,
          onValueCommit,
          scrub: { ...DEFAULT_SCRUB_SETTINGS, threshold: 3 },
        }}
      />,
    )

    const display = screen.getByTestId("display")

    await act(async () => {
      pointerSequence(display, [
        { type: "pointerdown", clientX: 0, clientY: 0 },
        { type: "pointermove", clientX: 20, clientY: 0 },
        { type: "pointermove", clientX: 40, clientY: 0 },
        { type: "pointerup", clientX: 40, clientY: 0 },
      ])
    })

    expect(screen.getByTestId("editing")).toHaveTextContent("false")
    expect(onChange).toHaveBeenCalled()
    expect(onValueCommit).toHaveBeenCalledTimes(1)
  })

  it("nudges with arrow keys from display mode", async () => {
    const onChange = vi.fn()

    render(
      <ScrubHarness
        options={{
          value: 10,
          onChange,
          min: 0,
          max: 20,
        }}
      />,
    )

    const display = screen.getByTestId("display")
    display.focus()

    await userEvent.keyboard("{ArrowUp}")

    expect(onChange).toHaveBeenCalledWith(11)
    expect(display).toHaveTextContent("11")
  })

  it("does not nudge on left/right arrows from display mode", async () => {
    const onChange = vi.fn()

    render(
      <ScrubHarness
        options={{
          value: 10,
          onChange,
          min: 0,
          max: 20,
        }}
      />,
    )

    const display = screen.getByTestId("display")
    display.focus()

    await userEvent.keyboard("{ArrowLeft}")
    await userEvent.keyboard("{ArrowRight}")

    expect(onChange).not.toHaveBeenCalled()
    expect(display).toHaveTextContent("10")
  })

  it("nudges with arrow keys after clicking into edit mode", async () => {
    const onChange = vi.fn()

    render(
      <ScrubHarness
        options={{
          value: 10,
          onChange,
          min: 0,
          max: 20,
        }}
      />,
    )

    const display = screen.getByTestId("display")

    await act(async () => {
      pointerSequence(display, [
        { type: "pointerdown", clientX: 10, clientY: 10 },
        { type: "pointerup", clientX: 11, clientY: 10 },
      ])
    })

    const editInput = screen.getByTestId("edit-input")
    editInput.focus()

    await userEvent.keyboard("{ArrowUp}")

    expect(screen.getByTestId("editing")).toHaveTextContent("false")
    expect(onChange).toHaveBeenCalledWith(11)
    expect(display).toHaveTextContent("11")
  })

  it("keeps edit mode on left/right arrows so the caret can move", async () => {
    const onChange = vi.fn()

    render(
      <ScrubHarness
        options={{
          value: 10,
          onChange,
          min: 0,
          max: 20,
        }}
      />,
    )

    const display = screen.getByTestId("display")

    await act(async () => {
      pointerSequence(display, [
        { type: "pointerdown", clientX: 10, clientY: 10 },
        { type: "pointerup", clientX: 11, clientY: 10 },
      ])
    })

    const editInput = screen.getByTestId("edit-input")
    editInput.focus()

    await userEvent.keyboard("{ArrowLeft}")
    await userEvent.keyboard("{ArrowRight}")

    expect(screen.getByTestId("editing")).toHaveTextContent("true")
    expect(onChange).not.toHaveBeenCalled()
  })

  it("preserves trailing zeros when fine nudging to an integer", async () => {
    const onChange = vi.fn()

    render(
      <ScrubHarness
        options={{
          value: 48.9,
          onChange,
        }}
      />,
    )

    const display = screen.getByTestId("display")
    expect(display).toHaveTextContent("48.9")
    display.focus()

    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}")

    expect(onChange).toHaveBeenCalledWith(49)
    expect(display).toHaveTextContent("49.0")
  })

  it("fine nudges from an integer to a fractional value", async () => {
    const onChange = vi.fn()

    render(
      <ScrubHarness
        options={{
          value: 49,
          onChange,
        }}
      />,
    )

    const display = screen.getByTestId("display")
    display.focus()

    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}")

    expect(onChange).toHaveBeenCalledWith(49.1)
    expect(display).toHaveTextContent("49.1")
  })

  it("keeps integer display for normal nudges from an integer", async () => {
    const onChange = vi.fn()

    render(
      <ScrubHarness
        options={{
          value: 49,
          onChange,
        }}
      />,
    )

    const display = screen.getByTestId("display")
    display.focus()

    await userEvent.keyboard("{ArrowUp}")

    expect(onChange).toHaveBeenCalledWith(50)
    expect(display).toHaveTextContent("50")
  })

  it("keeps trailing zeros after keyup and controlled re-render", async () => {
    function KeyboardHarness() {
      const [value, setValue] = useState(48.9)

      return (
        <ScrubHarness
          options={{
            value,
            onChange: setValue,
          }}
        />
      )
    }

    render(<KeyboardHarness />)

    const display = screen.getByTestId("display")
    display.focus()

    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}")
    await act(async () => {
      await new Promise((resolve) => {
        requestAnimationFrame(resolve)
      })
    })

    expect(display).toHaveTextContent("49.0")
  })

  it("enters edit mode with Enter from display mode", async () => {
    render(
      <ScrubHarness
        options={{
          value: 10,
          onChange: vi.fn(),
        }}
      />,
    )

    const display = screen.getByTestId("display")
    display.focus()
    await userEvent.keyboard("{Enter}")

    expect(screen.getByTestId("editing")).toHaveTextContent("true")
    expect(screen.getByTestId("edit-input")).toBeInTheDocument()
  })

  it("reverts draft on Escape in edit mode", async () => {
    render(
      <ScrubHarness
        options={{
          value: 10,
          onChange: vi.fn(),
        }}
      />,
    )

    const display = screen.getByTestId("display")
    display.focus()
    await userEvent.keyboard("{Enter}")

    const input = screen.getByTestId("edit-input")
    fireEvent.change(input, { target: { value: "42" } })
    act(() => {
      fireEvent.keyDown(input, { key: "Escape" })
    })

    expect(screen.getByTestId("editing")).toHaveTextContent("false")
    expect(display).toHaveTextContent("10")
  })

  it("marks invalid input on blur and reverts", async () => {
    vi.useFakeTimers()

    render(
      <ScrubHarness
        options={{
          value: 10,
          onChange: vi.fn(),
        }}
      />,
    )

    const display = screen.getByTestId("display")
    display.focus()
    fireEvent.keyDown(display, { key: "Enter" })

    const input = screen.getByTestId("edit-input")
    fireEvent.change(input, { target: { value: "abc" } })
    fireEvent.blur(input)

    expect(screen.getByTestId("invalid")).toHaveTextContent("true")
    expect(display).toHaveTextContent("10")

    act(() => {
      vi.advanceTimersByTime(600)
    })

    expect(screen.getByTestId("invalid")).toHaveTextContent("false")
  })

  it("rejects empty draft on blur instead of committing zero", async () => {
    const onChange = vi.fn()

    render(
      <ScrubHarness
        options={{
          value: 10,
          onChange,
        }}
      />,
    )

    const display = screen.getByTestId("display")
    display.focus()
    await userEvent.keyboard("{Enter}")

    const input = screen.getByTestId("edit-input")
    await userEvent.clear(input)
    fireEvent.blur(input)

    expect(onChange).not.toHaveBeenCalledWith(0)
    expect(display).toHaveTextContent("10")
    expect(screen.getByTestId("invalid")).toHaveTextContent("true")
  })

  it("triggers bound feedback when nudging past max", async () => {
    render(
      <ScrubHarness
        options={{
          value: 10,
          onChange: vi.fn(),
          min: 0,
          max: 10,
          scrub: {
            ...DEFAULT_SCRUB_SETTINGS,
            boundFeedback: "shake",
          },
        }}
      />,
    )

    const display = screen.getByTestId("display")
    display.focus()
    await userEvent.keyboard("{ArrowUp}")

    expect(screen.getByTestId("bound-feedback")).toHaveTextContent("max")
  })

  it("syncs controlled value when not interacting", async () => {
    render(<ControlledScrubHarness initialValue={10} min={0} max={100} />)

    expect(screen.getByTestId("display")).toHaveTextContent("10")

    await userEvent.click(screen.getByTestId("set-parent"))

    expect(screen.getByTestId("display")).toHaveTextContent("99")
  })

  it("disables scrubbing when disabled", async () => {
    const onChange = vi.fn()

    render(
      <ScrubHarness
        options={{
          value: 10,
          onChange,
          disabled: true,
        }}
      />,
    )

    expect(screen.getByTestId("display")).toHaveAttribute("tabindex", "-1")

    const display = screen.getByTestId("display")
    await act(async () => {
      pointerSequence(display, [
        { type: "pointerdown", clientX: 0, clientY: 0 },
        { type: "pointermove", clientX: 40, clientY: 0 },
        { type: "pointerup", clientX: 40, clientY: 0 },
      ])
    })

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId("editing")).toHaveTextContent("false")
  })

  it("resets to defaultResetValue on double click", async () => {
    const onChange = vi.fn()
    const onValueCommit = vi.fn()

    render(
      <ScrubHarness
        options={{
          value: 25,
          onChange,
          onValueCommit,
          defaultResetValue: 0,
        }}
      />,
    )

    const display = screen.getByTestId("display")

    await act(async () => {
      pointerSequence(display, [
        { type: "pointerdown", clientX: 5, clientY: 5 },
        { type: "pointerup", clientX: 5, clientY: 5 },
        { type: "pointerdown", clientX: 5, clientY: 5 },
        { type: "pointerup", clientX: 5, clientY: 5 },
      ])
    })

    expect(onChange).toHaveBeenCalledWith(0)
    expect(onValueCommit).toHaveBeenCalledWith(0)
  })

  it("nudges with wheel when enabled and sensitivity is reached", async () => {
    const onChange = vi.fn()

    render(
      <ScrubHarness
        options={{
          value: 10,
          onChange,
          scrub: {
            ...DEFAULT_SCRUB_SETTINGS,
            wheelEnabled: true,
            wheelSensitivity: 20,
          },
        }}
      />,
    )

    const surface = screen.getByTestId("surface")

    await act(async () => {
      fireEvent.wheel(surface, { deltaY: 25, deltaMode: 0 })
    })

    expect(onChange).toHaveBeenCalledWith(9)
  })

  it("nudges with PageUp and jumps to bounds with Home and End", async () => {
    const onChange = vi.fn()

    render(
      <ScrubHarness
        options={{
          value: 10,
          onChange,
          min: 0,
          max: 20,
          shiftStep: 5,
        }}
      />,
    )

    const display = screen.getByTestId("display")
    display.focus()

    await userEvent.keyboard("{PageUp}")
    expect(onChange).toHaveBeenCalledWith(15)

    await userEvent.keyboard("{Home}")
    expect(onChange).toHaveBeenCalledWith(0)

    await userEvent.keyboard("{End}")
    expect(onChange).toHaveBeenCalledWith(20)
  })

  it("keeps display formatting separate from the editable draft", async () => {
    render(
      <ScrubHarness
        options={{
          value: 12.5,
          onChange: vi.fn(),
          formatValue: (nextValue) => `$${nextValue.toFixed(2)}`,
        }}
      />,
    )

    const display = screen.getByTestId("display")
    expect(display).toHaveTextContent("$12.50")

    display.focus()
    await userEvent.keyboard("{Enter}")

    const editInput = screen.getByTestId("edit-input") as HTMLInputElement
    expect(editInput.value).toBe("12.5")
  })

  it("rejects invalid pasted drafts while editing", async () => {
    render(
      <ScrubHarness
        options={{
          value: 12,
          onChange: vi.fn(),
        }}
      />,
    )

    const display = screen.getByTestId("display")
    display.focus()
    await userEvent.keyboard("{Enter}")

    const editInput = screen.getByTestId("edit-input")
    fireEvent.change(editInput, { target: { value: "1e5" } })

    expect(editInput).toHaveValue("12")
  })

  it("marks alphabetic drafts invalid on blur", async () => {
    vi.useFakeTimers()

    render(
      <ScrubHarness
        options={{
          value: 10,
          onChange: vi.fn(),
        }}
      />,
    )

    const display = screen.getByTestId("display")
    display.focus()
    fireEvent.keyDown(display, { key: "Enter" })

    const input = screen.getByTestId("edit-input")
    fireEvent.change(input, { target: { value: "abc" } })
    fireEvent.blur(input)

    expect(screen.getByTestId("invalid")).toHaveTextContent("true")
    expect(display).toHaveTextContent("10")

    act(() => {
      vi.advanceTimersByTime(600)
    })

    expect(screen.getByTestId("invalid")).toHaveTextContent("false")
  })

  it("preserves caret at click position when overflowing and selectOnEdit is false", async () => {
    const caretRangeFromPoint = vi.fn(() => {
      const input = document.querySelector(
        '[data-testid="edit-input"]',
      ) as HTMLInputElement | null

      if (!input) {
        return null
      }

      return {
        startContainer: input,
        startOffset: 0,
        endContainer: input,
        endOffset: 0,
      }
    })

    Object.defineProperty(document, "caretRangeFromPoint", {
      configurable: true,
      value: caretRangeFromPoint,
    })

    render(
      <ScrubHarness
        options={{
          value: 9_999_999,
          onChange: vi.fn(),
          selectOnEdit: false,
        }}
      />,
    )

    const display = screen.getByTestId("display")

    await act(async () => {
      pointerSequence(display, [
        { type: "pointerdown", clientX: 5, clientY: 5 },
        { type: "pointerup", clientX: 5, clientY: 5 },
      ])
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve)
        })
      })
    })

    const editInput = screen.getByTestId("edit-input") as HTMLInputElement

    Object.defineProperty(editInput, "scrollWidth", {
      configurable: true,
      value: 200,
    })
    Object.defineProperty(editInput, "clientWidth", {
      configurable: true,
      value: 76,
    })

    editInput.setSelectionRange(0, 0)

    fireEvent.change(editInput, {
      target: { value: `1${editInput.value}`, selectionStart: 1, selectionEnd: 1 },
    })

    expect(editInput.selectionStart).toBe(1)
    expect(editInput.selectionStart).not.toBe(editInput.value.length)
  })

  it("exposes spinbutton semantics on the display surface", () => {
    render(
      <ScrubHarness
        options={{
          value: 12,
          onChange: vi.fn(),
          min: 0,
          max: 100,
          format: { alwaysShowSign: false },
        }}
      />,
    )

    const display = screen.getByTestId("display")
    expect(display).toHaveAttribute("role", "spinbutton")
    expect(display).toHaveAttribute("aria-valuenow", "12")
    expect(display).toHaveAttribute("aria-valuemin", "0")
    expect(display).toHaveAttribute("aria-valuemax", "100")
    expect(display).not.toHaveAttribute("aria-valuetext")
  })
})

function OverflowFieldHarness({
  value = 9_999_999,
  className = "w-[4.75rem]",
}: {
  value?: number
  className?: string
}) {
  const scrub = useNumberScrub({
    value,
    onChange: vi.fn(),
  })

  return (
    <ScrubNumberInput
      aria-label="Overflow test"
      className={className}
      scrub={scrub}
    />
  )
}

describe("ScrubNumberInput overflow", () => {
  let resizeCallback: ResizeObserverCallback | undefined

  beforeEach(() => {
    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback
      }

      observe() {
        resizeCallback?.([], this as unknown as ResizeObserver)
      }

      disconnect() {}
    }

    vi.stubGlobal("ResizeObserver", MockResizeObserver)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    resizeCallback = undefined
  })

  function mockCalligraphOverflow(overflow: boolean) {
    const container = document.querySelector(
      '[data-slot="scrub-number-calligraph-value"]',
    ) as HTMLElement | null
    const mirror = document.querySelector(
      'input[aria-hidden="true"][readonly]',
    ) as HTMLElement | null

    expect(container).not.toBeNull()
    expect(mirror).not.toBeNull()

    Object.defineProperty(container!, "clientWidth", {
      configurable: true,
      value: 76,
    })
    Object.defineProperty(mirror!, "scrollWidth", {
      configurable: true,
      value: overflow ? 200 : 40,
    })
    Object.defineProperty(mirror!, "clientWidth", {
      configurable: true,
      value: overflow ? 76 : 80,
    })

    act(() => {
      resizeCallback?.([], {} as ResizeObserver)
    })
  }

  it("exposes title and aria-valuetext with the full value when truncated", () => {
    render(<OverflowFieldHarness />)
    mockCalligraphOverflow(true)

    const display = screen.getByRole("spinbutton", { name: "Overflow test" })

    expect(display).toHaveAttribute("title", "9999999")
    expect(display).toHaveAttribute("aria-valuetext", "9999999")
  })

  it("does not expose title when content fits", () => {
    render(<OverflowFieldHarness value={48} />)
    mockCalligraphOverflow(false)

    const display = screen.getByRole("spinbutton", { name: "Overflow test" })

    expect(display).not.toHaveAttribute("title")
  })

  it("click-to-edit opens the full untruncated value", async () => {
    render(<OverflowFieldHarness />)
    mockCalligraphOverflow(true)

    const display = screen.getByRole("spinbutton", { name: "Overflow test" })

    await act(async () => {
      pointerSequence(display, [
        { type: "pointerdown", clientX: 5, clientY: 5 },
        { type: "pointerup", clientX: 5, clientY: 5 },
      ])
    })

    const input = screen.getByRole("spinbutton", {
      name: "Overflow test",
    }) as HTMLInputElement
    expect(input.value).toBe("9999999")
  })
})
