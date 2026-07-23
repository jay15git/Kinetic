# Kinetic

Drag-to-scrub **Scrub Number Input** for React: click to type, animated digit transitions. Owned scrub/edit engine with Calligraph display.

Full API reference: [kinetic.itsjay.in](https://kinetic.itsjay.in/?tab=api) (Features tab).

## Features

- Horizontal and vertical scrub with pointer-lock gesture
- Click-to-edit with select-all on focus
- Keyboard: Up/Down arrows, Alt (`smallStep`), Shift (`largeStep`), Home/End
- Optional wheel scroll and logo-handle scrub surface
- Bound feedback: shake or border pulse
- Calligraph animated digits (slots or number variant)
- Overflow: left-aligned values; long values clip on the right, full value on hover/edit

## Installation

Use the **Command** tab for registry install, **Manual** for copy-paste setup. API reference lives on the **Features** tab. The live demo at `/demo` mirrors the playground structure.

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
      onValueCommitted={(value) => console.log("committed", value)}
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
  format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
/>
```

Use `format` (`Intl.NumberFormatOptions`) for display formatting via `formatValue`.

### Display overflow

Fields stay a fixed width so digit animation does not shift layout. When a value is too long:

- **Display mode**: left-aligned; overflow clips on the right.
- **Hover**: native `title` tooltip shows the full formatted value when truncated.
- **Edit mode**: click opens the full value string, not the clipped display.

## Main props (`ScrubNumberField`)

| Prop | Type | Description |
|------|------|-------------|
| `value` | `number` | Controlled value |
| `defaultValue` | `number` | Initial value when uncontrolled |
| `onValueChange` | `(n: number) => void` | Fires on every change |
| `onValueCommitted` | `(n: number) => void` | Fires on blur after edit, or when scrub ends |
| `defaultResetValue` | `number` | Target for double-click reset |
| `min` / `max` | `number` | Clamp bounds |
| `step` | `number` | Normal increment (default `1`) |
| `smallStep` | `number` | Fine increment while Alt held (default `0.1`) |
| `largeStep` | `number` | Coarse increment while Shift held (default `10`) |
| `allowWheelScrub` | `boolean` | Wheel nudge while focused |
| `direction` | `"horizontal" \| "vertical"` | Scrub axis |
| `pixelSensitivity` | `number` | Pixels per step while scrubbing (default `2`) |
| `format` | `Intl.NumberFormatOptions` | Display formatting |
| `boundFeedback` | `"none" \| "shake" \| "borderPulse"` | Feedback at min/max |
| `calligraph` | `CalligraphSettings` | Digit animation variant |
| `inputSettings` | `InputSettings` | Select-on-edit |
| `logo` | `LogoSettings` | Handle icon scrub mode |
| `grouped` | `boolean` | Borderless control for use inside `InputGroup` |
| `label` | `string` | Optional side label |
| `disabled` | `boolean` | Disable interaction |

## Gestures

| Action | Result |
|--------|--------|
| Drag field / handle | Scrub by `step` |
| Alt + drag / arrows / wheel | `smallStep` |
| Shift + drag / arrows / wheel | `largeStep` |
| Wheel (`allowWheelScrub`) | Step while focused |
| Click field | Enter edit mode |
| Home / End | Jump to min / max |
| Double-click | Reset to `defaultResetValue` |
| Enter | Commit edit |
| Escape | Revert edit |

Modifier keys: Alt = fine step (`smallStep`), Shift = coarse step (`largeStep`).

## Publishing

Kinetic distributes via the **shadcn namespace registry** at [kinetic.itsjay.in](https://kinetic.itsjay.in). See [docs/DISTRIBUTION.md](docs/DISTRIBUTION.md).

### Install

See [Installation](#installation) above. The demo at `/demo` copies generated props from the **Usage** section after you tweak settings.

### Demo

Run `pnpm dev` and open `/demo`. Adjust settings in the panel, then copy the generated props snippet from the **Usage** section.

### Build registry locally

```bash
pnpm registry:build
pnpm registry:validate
```

Outputs `public/r/scrub-number-field.json`. Test against `http://localhost:3000/r/{name}.json` before deploy.

## Development

```bash
pnpm install
pnpm dev              # home at http://localhost:3000, demo at /demo
pnpm test
pnpm lint
pnpm build            # registry:build + next build
pnpm registry:build
pnpm registry:validate
```

## License

MIT
