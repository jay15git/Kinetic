# Vercel + GitHub setup

## Repository

- **GitHub:** https://github.com/jay15git/Kinetic
- **Branch:** `main`
- **Vercel project:** `kinetic` (production domain: `kinetic.itsjay.in`)

## Option A — Native Git integration (recommended)

Vercel must be allowed to access the `Kinetic` repository in the GitHub app:

1. Open https://github.com/settings/installations
2. Click **Configure** on **Vercel**
3. Under **Repository access**, select **All repositories** or add **jay15git/Kinetic**
4. Save

Then connect the project:

```bash
cd /path/to/kinetic
npx vercel link --project kinetic --yes
npx vercel git connect https://github.com/jay15git/Kinetic --yes
```

Or in the [Vercel dashboard](https://vercel.com/jay15gits-projects/kinetic/settings/git): **Connect Git Repository** → `jay15git/Kinetic`.

Every push to `main` will trigger a production deployment.

## Option B — GitHub Actions (already configured)

Workflow: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)

Add a Vercel token to GitHub secrets (one-time):

```bash
# Create token at https://vercel.com/account/settings/tokens
gh secret set VERCEL_TOKEN --repo jay15git/Kinetic
```

Pushes to `main` deploy via Actions if native Git connect is not configured.

## DNS

Point subdomain at your registrar (GoDaddy):

```
A    kinetic    76.76.21.21
```

## Verify

```bash
curl -I https://kinetic.itsjay.in/r/scrub-number-field.json
pnpm dlx shadcn@latest view @kinetic/scrub-number-field
```
