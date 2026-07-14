import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState, type ComponentProps } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ScrubNumberField } from "@/components/ui/scrub-number-input"
import "./scrub-number-input.css"

function ControlledField(
  props: Omit<ComponentProps<typeof ScrubNumberField>, "value" | "onValueChange"> & {
    initialValue?: number
  },
) {
  const [value, setValue] = useState(props.initialValue ?? 10)

  return (
    <div>
      <button type="button" data-testid="set-parent" onClick={() => setValue(99)}>
        set parent
      </button>
      <ScrubNumberField
        {...props}
        value={value}
        onValueChange={setValue}
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

describe("ScrubNumberField", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "requestPointerLock",
      vi.fn().mockResolvedValue(undefined),
    )
    vi.stubGlobal("exitPointerLock", vi.fn())
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it("enters edit mode on click without crossing scrub threshold", async () => {
    const user = userEvent.setup()
    render(
      <ControlledField aria-label="Value" initialValue={10} />,
    )

    const display = screen.getByRole("spinbutton", { name: "Value" })
    await user.click(display)

    expect(screen.getByRole("textbox", { name: "Value" })).toBeInTheDocument()
  })

  it("scrubs without entering edit and commits on pointer up", async () => {
    const onValueCommitted = vi.fn()

    render(
      <ControlledField
        aria-label="Value"
        initialValue={10}
        onValueCommitted={onValueCommitted}
      />,
    )

    const display = screen.getByRole("spinbutton", { name: "Value" })

    await act(async () => {
      pointerSequence(display, [
        { type: "pointerdown", clientX: 10, clientY: 10 },
        { type: "pointermove", clientX: 30, clientY: 10, movementX: 20 },
        { type: "pointerup", clientX: 30, clientY: 10 },
      ])
    })

    expect(screen.getByRole("spinbutton", { name: "Value" })).toBeInTheDocument()
    const input = screen.getByRole("textbox", { name: "Value" })
    expect(input).toHaveClass("opacity-0")
    expect(onValueCommitted).toHaveBeenCalled()
  })

  it("nudges with arrow keys when focused", async () => {
    const user = userEvent.setup()

    render(<ControlledField aria-label="Value" initialValue={10} />)

    const input = screen.getByRole("textbox", { name: "Value" })
    await user.click(input)
    await user.keyboard("{ArrowUp}")

    expect(screen.getByRole("spinbutton", { name: "Value" })).toHaveAttribute(
      "aria-valuenow",
      "11",
    )
  })

  it("resets to defaultResetValue on double click", async () => {
    const user = userEvent.setup()
    const onValueCommitted = vi.fn()

    render(
      <ControlledField
        aria-label="Value"
        defaultResetValue={0}
        initialValue={42}
        onValueCommitted={onValueCommitted}
      />,
    )

    const display = screen.getByRole("spinbutton", { name: "Value" })

    await user.click(display)
    await user.click(display)

    expect(screen.getByRole("spinbutton", { name: "Value" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    )
    expect(onValueCommitted).toHaveBeenCalledWith(0)
  })

  it("syncs controlled value when parent updates", async () => {
    const user = userEvent.setup()

    render(<ControlledField aria-label="Value" initialValue={10} />)

    await user.click(screen.getByTestId("set-parent"))

    expect(screen.getByRole("spinbutton", { name: "Value" })).toHaveAttribute(
      "aria-valuenow",
      "99",
    )
  })

  it("disables interaction when disabled", async () => {
    render(
      <ScrubNumberField
        aria-label="Value"
        defaultValue={10}
        disabled
      />,
    )

    const display = screen.getByRole("spinbutton", { name: "Value" })
    expect(display).toHaveAttribute("tabindex", "-1")
  })

  it("exposes spinbutton semantics on the display surface", () => {
    render(
      <ScrubNumberField
        aria-label="Value"
        defaultValue={12}
        max={100}
        min={0}
      />,
    )

    const display = screen.getByRole("spinbutton", { name: "Value" })
    expect(display).toHaveAttribute("aria-valuenow", "12")
    expect(display).toHaveAttribute("aria-valuemin", "0")
    expect(display).toHaveAttribute("aria-valuemax", "100")
  })
})
