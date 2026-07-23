# Release QA Checklist

Use this checklist before publishing `@kinetic/scrub-number-field` to the shadcn registry.

Automated coverage exists for `ScrubNumberField` component flows. This document covers manual browser and assistive-tech verification.

## Accessibility

- [ ] **VoiceOver (macOS)**: display surface announces as spinbutton with current value
- [ ] **VoiceOver**: `aria-valuemin` / `aria-valuemax` read when bounds are set
- [ ] **VoiceOver**: `aria-valuetext` reads the full value when display is truncated
- [ ] **Keyboard only**: Tab to field, Up/Down arrows nudge, Left/Right move caret while editing, Enter edits, Escape cancels edit
- [ ] **Focus visible**: ring appears on standalone field and inside `InputGroup` / logo mode
- [ ] **Invalid state**: bad typed value sets `aria-invalid` and reverts on blur
- [ ] **Reduced motion**: with `prefers-reduced-motion: reduce`, digits render without Calligraph animation and bound shake/pulse are suppressed

## Cross-browser pointer matrix

Mark each cell pass/fail during manual QA.

| Scenario | Chrome | Safari | Firefox |
|----------|:------:|:------:|:-------:|
| Horizontal scrub | | | |
| Vertical scrub | | | |
| Click-to-edit (under scrub threshold) | | | |
| Trackpad wheel nudge (`wheelEnabled`) | | | |
| Fine modifier during drag (Alt on Win/Linux, Cmd on Mac) | | | |
| Coarse modifier during drag (Shift default) | | | |
| Touch / iOS pointer | | | |
| Caret placement on click (`selectOnEdit: false`) | | | |
| Double-click reset (`defaultResetValue`) | | | |
| Logo handle scrub (`logo.enabled`) | | | |
## Numeric edge cases

- [ ] Large values (`9999999`): trailing digits visible, leading digits masked from the left
- [ ] Large values: browser tooltip (`title`) shows full formatted value on hover when truncated
- [ ] Large values: click-to-edit reveals full value (select-all or caret), not the clipped display
- [ ] Small decimals (`0.001`, `step=0.1`)
- [ ] Signed ranges (`min=-180`, `max=180`)
- [ ] `alwaysShowSign: true` shows `+` on positives
- [ ] `min === max` shows `cursor-not-allowed` and does not change value
- [ ] Empty field blur reverts instead of committing `0`
- [ ] Custom `formatValue` still commits underlying number correctly

## shadcn integration

- [ ] `pnpm test:registry-smoke` passes locally
- [ ] `pnpm registry:validate` passes
- [ ] `https://kinetic.itsjay.in/r/scrub-number-field.json` returns 200 after deploy
- [ ] `pnpm dlx shadcn@latest view @kinetic/scrub-number-field` resolves against production
- [ ] Installed field matches demo typography in light and dark mode
- [ ] `input` + `input-group` registry dependencies resolve on a clean base-nova project
- [ ] `scrub-number-input.css` is imported by the installed component

## Automated commands

```bash
pnpm test
pnpm registry:validate
pnpm registry:build
pnpm build
pnpm test:registry-smoke
```
