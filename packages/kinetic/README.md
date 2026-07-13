# kinetic

Figma-style scrub number field for React apps using [shadcn/ui](https://ui.shadcn.com) (base-nova).

## Install

### Recommended — shadcn registry

Add to `components.json` (until `@kinetic` is in the shadcn registry directory):

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

Requires `input` and `input-group` from shadcn in your project.

The registry item also installs:

- `components/ui/scrub-number-input.tsx` and `.css`
- `lib/scrub-number-math.ts`, `lib/scrub-number-overflow.ts`, `lib/springs.ts`
- `hooks/use-controllable-state.tsx`

## Keyboard shortcuts

| Action | Shortcut |
|--------|----------|
| Nudge value | Arrow keys |
| Large step | Shift + arrows (default coarse modifier) |
| Fine step | Alt + arrows on Windows/Linux, Cmd + arrows on Mac (default) |
| Jump to min/max | Home / End |
| Edit value | Click field or Enter / Space on focus |
| Cancel edit | Escape |
| Reset to default | Double-click, or fine-modifier + click when `defaultResetValue` is set |

### npm (programmatic import)

```bash
pnpm add kinetic
```

Import the CSS once in your app:

```ts
import "kinetic/scrub-number-input.css"
```

```tsx
import { ScrubNumberField } from "kinetic"

<ScrubNumberField
  label="X"
  value={x}
  onValueChange={setX}
/>
```

## Peer dependencies

| Package | Required |
|---------|----------|
| `react`, `react-dom` | Yes |
| `calligraph`, `motion`, `lucide-react` | Yes |
| shadcn `input`, `input-group` at `@/components/ui/*` | Yes (npm path) |

The npm build keeps `@/components/ui/input` and `@/components/ui/input-group` as external imports. Your app must use the standard shadcn `@/*` path aliases.

## Usage

```tsx
import { ScrubNumberField } from "kinetic"

<ScrubNumberField
  aria-label="Rotation"
  label="Rotation"
  value={rotation}
  onValueChange={setRotation}
  min={-180}
  max={180}
  step={1}
  scrub={{ direction: "horizontal", sensitivity: 1, wheelEnabled: true }}
/>
```

See the [demo](https://kinetic.itsjay.in/demo) and [source](https://github.com/jay15git/kinetic) for full settings and presets.

## License

MIT
