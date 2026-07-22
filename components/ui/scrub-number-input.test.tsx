import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState, type ComponentProps } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ScrubNumberField } from "@/components/ui/scrub-number-input"
import "./scrub-number-input.css"

function ControlledField({
  initialValue,
  ...props
}: Omit<ComponentProps<typeof ScrubNumberField>, "value" | "onValueChange"> & {
  initialValue?: number
}) {
  const [value, setValue] = useState(initialValue ?? 10)

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
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      measureText: (text: string) => ({ width: text.length * 8 }),
    } as CanvasRenderingContext2D)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it("enters edit mode on pointer tap without crossing scrub threshold", async () => {
    render(
      <ControlledField aria-label="Value" initialValue={10} />,
    )

    const display = screen.getByRole("spinbutton", { name: "Value" })

    await act(async () => {
      pointerSequence(display, [
        { type: "pointerdown", clientX: 10, clientY: 10 },
        { type: "pointerup", clientX: 10, clientY: 10 },
      ])
    })

    const input = screen.getByRole("textbox", { name: "Value" })

    await waitFor(() => {
      expect(input).toHaveAttribute("data-editing", "")
      expect(document.activeElement).toBe(input)
    })
  })

  it("applies inputClassName to the mirror source while idle", () => {
    render(
      <ControlledField
        aria-label="Value"
        initialValue={10}
        inputClassName="landing-demo-input"
      />,
    )

    const input = document.querySelector<HTMLInputElement>(
      'input[aria-label="Value"]',
    ) as HTMLInputElement

    expect(input).toHaveClass("landing-demo-input")
    expect(input).toHaveClass("opacity-0")
  })

  it("keeps Calligraph mounted while exposing one accessible surface", async () => {
    const user = userEvent.setup()
    render(<ControlledField aria-label="Value" initialValue={10} />)

    const display = screen.getByRole("spinbutton", { name: "Value" })
    const overlay = document.querySelector(
      '[data-slot="scrub-number-display-overlay"]',
    )
    const input = document.querySelector<HTMLInputElement>(
      'input[aria-label="Value"]',
    ) as HTMLInputElement

    expect(overlay).toBeInTheDocument()
    expect(input).toHaveClass("opacity-0")
    expect(screen.queryByRole("textbox", { name: "Value" })).not.toBeInTheDocument()

    await user.click(display)

    await waitFor(() => {
      expect(overlay).toBeInTheDocument()
      expect(input).not.toHaveClass("opacity-0")
      expect(screen.queryByRole("spinbutton", { name: "Value" })).not.toBeInTheDocument()
    })
  })

  it("shows a caret-ready input at pointer position when select all is disabled", async () => {
    const user = userEvent.setup()
    render(
      <ControlledField
        aria-label="Value"
        initialValue={10}
        inputSettings={{ selectOnEdit: false }}
      />,
    )

    const display = screen.getByRole("spinbutton", { name: "Value" })
    await user.click(display)

    const input = screen.getByRole("textbox", { name: "Value" }) as HTMLInputElement

    await waitFor(() => {
      expect(input).toHaveAttribute("data-editing", "")
      expect(input).toHaveClass("caret-current")
      expect(document.activeElement).toBe(input)
      expect(input.selectionStart).toBe(input.selectionEnd)
    })
  })

  it("selects all only when entering edit from keyboard with selectOnEdit enabled", async () => {
    const user = userEvent.setup()

    render(
      <ControlledField
        aria-label="Value"
        initialValue={10}
        inputSettings={{ selectOnEdit: true }}
      />,
    )

    const display = screen.getByRole("spinbutton", { name: "Value" })
    display.focus()
    await user.keyboard("{Enter}")

    const input = screen.getByRole("textbox", { name: "Value" }) as HTMLInputElement

    await waitFor(() => {
      expect(input.selectionStart).toBe(0)
      expect(input.selectionEnd).toBe(input.value.length)
    })
  })

  it("selects all on pointer click when selectOnEdit is enabled", async () => {
    const user = userEvent.setup()

    render(
      <ControlledField
        aria-label="Value"
        initialValue={10}
        inputSettings={{ selectOnEdit: true }}
      />,
    )

    const display = screen.getByRole("spinbutton", { name: "Value" })
    await user.click(display)

    const input = screen.getByRole("textbox", { name: "Value" }) as HTMLInputElement

    await waitFor(() => {
      expect(input.selectionStart).toBe(0)
      expect(input.selectionEnd).toBe(input.value.length)
    })
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
    const input = document.querySelector<HTMLInputElement>(
      'input[aria-label="Value"]',
    ) as HTMLInputElement
    expect(input).not.toHaveAttribute("data-editing")
    expect(onValueCommitted).toHaveBeenCalled()
  })

  it("nudges with arrow keys without swapping visible number surfaces", async () => {
    const user = userEvent.setup()

    render(<ControlledField aria-label="Value" initialValue={10} />)

    await user.click(screen.getByRole("spinbutton", { name: "Value" }))
    const input = screen.getByRole("textbox", { name: "Value" })
    const overlay = document.querySelector(
      '[data-slot="scrub-number-display-overlay"]',
    )
    await user.keyboard("{ArrowUp}")

    await waitFor(() => {
      expect(overlay).toHaveClass("opacity-0")
      expect(document.activeElement).toBe(input)
      expect(input).toHaveValue("11")
      expect(input).toHaveAttribute("data-editing", "")
    })
  })

  it("preserves native left and right caret movement in edit mode", async () => {
    const user = userEvent.setup()

    render(
      <ControlledField
        aria-label="Value"
        initialValue={123}
        inputSettings={{ selectOnEdit: false }}
      />,
    )

    await user.click(screen.getByRole("spinbutton", { name: "Value" }))
    const input = screen.getByRole("textbox", { name: "Value" }) as HTMLInputElement
    input.setSelectionRange(1, 1)

    await user.keyboard("{ArrowRight}")
    expect(input.selectionStart).toBe(2)

    await user.keyboard("{ArrowLeft}")
    expect(input.selectionStart).toBe(1)
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

    await user.dblClick(display)

    await waitFor(() => {
      expect(
        screen.getByRole("spinbutton", { name: "Value" }),
      ).toHaveAttribute("aria-valuenow", "0")
    })
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
