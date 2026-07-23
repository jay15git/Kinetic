# Distribution strategy

Kinetic ships through the **shadcn namespace registry**, same model as [@ncdai](https://chanhdai.com/components) and core shadcn components. Users copy source into their project via the shadcn CLI.

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

1. Push to [github.com/jay15git/Kinetic](https://github.com/jay15git/Kinetic). Pushes to `main` auto-deploy via GitHub Actions
2. Vercel project: `kinetic`. Production at [kinetic.itsjay.in](https://kinetic.itsjay.in)
3. Optional native Git hookup: [docs/VERCEL_GIT_SETUP.md](./VERCEL_GIT_SETUP.md)
4. Custom domain `kinetic.itsjay.in`. Add DNS record at your registrar:
   - **Recommended:** `A kinetic.itsjay.in → 76.76.21.21`
   - Or CNAME `kinetic` → `cname.vercel-dns.com` (see Vercel domain settings)
4. Verify after DNS propagates:
   - `https://kinetic.itsjay.in/r/registry.json`
   - `https://kinetic.itsjay.in/r/scrub-number-field.json`
5. Submit `@kinetic`. Filed at [shadcn-ui/ui#11153](https://github.com/shadcn-ui/ui/issues/11153); see also [docs/registry-directory-submission.md](./registry-directory-submission.md)

## Deferred (not v1)

| Item | Status |
|------|--------|
| shadcn community registry directory | After deploy + live JSON |
| npm package (`packages/kinetic`) | Future. Registry is primary |

## Why registry?

- Component is built on shadcn `Input` / `InputGroup` and ships multiple lib/hook files
- Users own and customize the source in their repo
- Matches how design-tool-style components are distributed in the shadcn ecosystem
