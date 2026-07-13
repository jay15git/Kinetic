# shadcn registry directory submission

Submit `@kinetic` after `https://kinetic.itsjay.in/r/scrub-number-field.json` is live.

## Registry details

| Field | Value |
|-------|-------|
| Name | `@kinetic` |
| URL template | `https://kinetic.itsjay.in/r/{name}.json` |
| Homepage | `https://kinetic.itsjay.in` |
| Description | Figma-style scrub number field for shadcn/ui (base-nova) |
| Repository | https://github.com/jay15git/kinetic |

## Requirements (from shadcn)

- Open source and publicly accessible registry JSON
- Valid `registry.json` schema at the registry endpoint
- Flat registry layout: `/r/registry.json` and `/r/{name}.json`
- Built item JSON must NOT include `content` on `files` entries (`pnpm registry:build` handles this)

## How to submit

1. Open an issue on [shadcn-ui/ui](https://github.com/shadcn-ui/ui/issues/new) using the registry directory template, or follow [Registry Directory docs](https://ui.shadcn.com/docs/registry/registry-index).
2. Attach a square SVG logo for `@kinetic`.
3. After merge, users can run `pnpm dlx shadcn@latest add @kinetic/scrub-number-field` without manually editing `components.json`.

Reference: [ncdai directory submission](https://github.com/shadcn-ui/ui/issues/8607).

**Submitted:** [shadcn-ui/ui#11153](https://github.com/shadcn-ui/ui/issues/11153)

## Pre-submit verification

```bash
pnpm registry:build
pnpm registry:validate
curl -sI https://kinetic.itsjay.in/r/scrub-number-field.json | head -1
pnpm dlx shadcn@latest view @kinetic/scrub-number-field
pnpm dlx shadcn@latest add @kinetic/scrub-number-field --dry-run
```
