# Distribution strategy

Kinetic ships through the **shadcn namespace registry** — the same model as [@ncdai](https://chanhdai.com/components) and core shadcn components. Users copy source into their project via the shadcn CLI.

**Site:** [kinetic.itsjay.in](https://kinetic.itsjay.in)  
**Registry JSON:** `https://kinetic.itsjay.in/r/{name}.json`

## Install (after deploy)

```bash
pnpm dlx shadcn@latest add @kinetic/scrub-number-field
```

Or direct URL:

```bash
pnpm dlx shadcn@latest add https://kinetic.itsjay.in/r/scrub-number-field.json
```

**Prerequisites on the consumer project:**

- shadcn **base-nova** style
- `input` and `input-group` (`pnpm dlx shadcn@latest add input input-group`)
- `@/lib/utils` with `cn()` (standard shadcn setup)

**npm dependencies** installed automatically by the CLI: `calligraph`, `motion`, `lucide-react`.

Until `@kinetic` is listed in the [shadcn registry directory](https://ui.shadcn.com/docs/registry/registry-index), add to consumer `components.json`:

```json
{
  "registries": {
    "@kinetic": "https://kinetic.itsjay.in/r/{name}.json"
  }
}
```

After directory approval, the CLI auto-configures `@kinetic` (same as `@ncdai`).

## Local registry development

Build registry artifacts:

```bash
pnpm registry:build
pnpm registry:validate
```

Output: `public/r/scrub-number-field.json` and `public/r/registry.json`.

**Test install against local dev server:**

```json
{
  "registries": {
    "@kinetic": "http://localhost:3000/r/{name}.json"
  }
}
```

Then in a separate Next.js app:

```bash
pnpm dlx shadcn@latest add @kinetic/scrub-number-field
```

## Lab

The demo app at `/demo` is a settings playground. Tweak options, then copy generated props JSX from the **Props** section. Install instructions live at `/`.

Set the registry URL shown on the landing page via:

```bash
NEXT_PUBLIC_KINETIC_REGISTRY_URL=https://kinetic.itsjay.in
```

## Deploy checklist

1. Push to [github.com/jay15git/kinetic](https://github.com/jay15git/kinetic)
2. Deploy Next.js app to Vercel (or similar)
3. Add custom domain `kinetic.itsjay.in` (CNAME to your host)
4. Verify:
   - `https://kinetic.itsjay.in/r/registry.json`
   - `https://kinetic.itsjay.in/r/scrub-number-field.json`
5. Submit `@kinetic` — see [docs/registry-directory-submission.md](./registry-directory-submission.md)

## Deferred (not v1)

| Item | Status |
|------|--------|
| shadcn community registry directory | After deploy + live JSON |
| npm package (`packages/kinetic`) | Future — registry is primary |

## Why registry?

- Component is built on shadcn `Input` / `InputGroup` and ships multiple lib/hook files
- Users own and customize the source in their repo
- Matches how design-tool-style components are distributed in the shadcn ecosystem
