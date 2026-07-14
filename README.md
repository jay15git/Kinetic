# Kinetic

A shadcn-style **scrub number input** for React: drag to change values, click to type, animated digit transitions.

## Features

- Horizontal and vertical scrub with step, fine step, and coarse step controls
- Click-to-edit with select-all or caret-at-click placement
- Keyboard: Up/Down arrows, Shift (large step), fine modifier (Alt by default), Page Up/Down, Home/End
- Optional wheel scroll and logo-handle scrub surface
- Bound feedback: shake or border pulse
- Calligraph animated digits (slots or number variant)
- Overflow: left-aligned values; long values clip on the right, full value on hover/edit

## Installation

Use the **Command** tab for registry install, or **Manual** for copy-paste setup. The live demo at `/demo` mirrors the same structure.

### Command

Add the registry to `components.json`:

```json
{
  "registries": {
    "@kinetic": "https://kinetic.itsjay.in/r/{name}.json"
  }
}
```

Then install:

```bash
pnpm dlx shadcn@latest add @kinetic/scrub-number-field
```

**Prerequisites:** shadcn base-nova with `input` and `input-group`.

### Manual

1. **Install dependencies**

```bash
pnpm add calligraph motion lucide-react
```

2. **Add shadcn components**

```bash
pnpm dlx shadcn@latest add input input-group
```

3. **Copy source files** into your project:

- `components/ui/scrub-number-input.tsx`
- `components/ui/scrub-number-input.css`
- `lib/scrub-number-math.ts`
- `lib/scrub-number-overflow.ts`
- `hooks/use-controllable-state.tsx`

4. **Update import paths** to match your `@/` aliases.

## Quick start

```tsx
import { useState } from "react"
import { ScrubNumberField } from "@/components/ui/scrub-number-input"

export function PositionField() {
  const [x, setX] = useState(0)

  return (
    <ScrubNumberField
      label="X"
      aria-label="X position"
      value={x}
      onValueChange={setX}
      onValueCommit={(value) => console.log("committed", value)}
      min={-500}
      max={500}
      step={1}
    />
  )
}
```

### Uncontrolled

```tsx
<ScrubNumberField
  aria-label="Opacity"
  defaultValue={100}
  onValueChange={setOpacity}
  min={0}
  max={100}
/>
```

### Custom formatting

```tsx
<ScrubNumberField
  aria-label="Price"
  value={price}
  onValueChange={setPrice}
  formatValue={(n) => n.toFixed(2)}
/>
```

Keep numeric formatting in `format` / `formatValue`.

### Display overflow

Fields stay a fixed width so digit animation does not shift layout. When a value is too long:

- **Display mode**: left-aligned; overflow clips on the right.
- **Hover**: native `title` tooltip shows the full formatted value when truncated.
- **Edit mode**: click always opens the full precision string — never a clipped preview.

### Headless hook

```tsx
import {
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

return <ScrubNumberInput aria-label="Amount" scrub={scrub} />
```

## Main props (`ScrubNumberField`)

| Prop | Type | Description |
|------|------|-------------|
| `value` | `number` | Controlled value |
| `defaultValue` | `number` | Initial value when uncontrolled |
| `onValueChange` | `(n: number) => void` | Fires on every change (scrub, keys, wheel) |
| `onValueCommit` | `(n: number) => void` | Fires on blur/Enter after edit, or when scrub ends |
| `defaultResetValue` | `number` | Target for double-click / fine-modifier+click reset |
| `min` / `max` | `number` | Clamp bounds |
| `step` | `number` | Quantization increment (default `1`) |
| `shiftStep` | `number` | Large step for Shift / Page Up/Down |
| `format` | `FormatSettings` | Sign prefix (`alwaysShowSign`) |
| `formatValue` | `(n: number) => string` | Custom display formatter |
| `scrub` | `ScrubSettings` | Direction, sensitivity, fine/coarse step, wheel, feedback |
| `calligraph` | `CalligraphSettings` | Digit animation variant |
| `inputSettings` | `InputSettings` | Select-on-edit |
| `logo` | `LogoSettings` | Handle icon scrub mode |
| `grouped` | `boolean` | Borderless control for use inside `InputGroup` |
| `label` | `string` | Optional side label |
| `disabled` | `boolean` | Disable interaction |

## Scroll settings

| Setting | Default | Description |
|---------|---------|-------------|
| `step` | `1` | Normal increment (drag, wheel, Up/Down arrows) |
| `scrub.fineStep` | `step / 10` | Fine increment (modifier + drag / wheel / Up/Down arrows) |
| `scrub.fineModifier` | `"alt"` | Key for fine step: `"shift"`, `"alt"`, or `"meta"` |
| `scrub.shiftStep` | `10` | Coarse increment (modifier + drag / wheel / Up/Down arrows) |
| `scrub.coarseModifier` | `"shift"` | Key for coarse step: `"shift"`, `"alt"`, or `"meta"` |
| `scrub.sensitivity` | `1` | Pixels per step unit while dragging |
| `scrub.threshold` | `3` | Pointer movement (px) before scrub starts |
| `scrub.wheelEnabled` | `false` | Enable wheel scroll |
| `scrub.wheelSensitivity` | `20` | Accumulated wheel delta (px) per step when wheel is enabled |

## Gestures

| Action | Result |
|--------|--------|
| Drag field | Scrub by step |
| Fine modifier + drag / Up/Down arrows / wheel | Fine step |
| Coarse modifier + drag / Up/Down arrows / Page Up-Down / wheel | Coarse step |
| Wheel | Stepped scroll using the same step ladder (with fine/coarse modifiers) |
| Click field | Enter edit mode |
| Home / End | Jump to min / max |
| Double-click / fine-modifier+click | Reset to `defaultResetValue` |
| Enter | Commit edit |
| Escape | Revert edit |

## Publishing

Kinetic distributes via the **shadcn namespace registry** at [kinetic.itsjay.in](https://kinetic.itsjay.in). See [docs/DISTRIBUTION.md](docs/DISTRIBUTION.md).

### Install

See [Installation](#installation) above. The demo at `/demo` copies generated props from the **Props** section after you tweak settings.

### Demo

Run `pnpm dev` and open `/demo`. Adjust settings in the panel, then copy the generated props snippet from the **Props** section.

### Build registry locally

```bash
pnpm registry:build
pnpm registry:validate
```

Outputs `public/r/scrub-number-field.json`. Test against `http://localhost:3000/r/{name}.json` before deploy.

### Future: npm

A programmatic npm package may be added later. Registry is the recommended path for v1.

## Development

```bash
pnpm install
pnpm dev              # home at http://localhost:3000, demo at /demo
pnpm test             # unit tests for math/format helpers
pnpm lint
pnpm build            # registry:build + next build
pnpm registry:build
pnpm registry:validate
```

## License

MIT
