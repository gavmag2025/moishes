# Deploying for free (GitHub Pages)

Repo: `gavmag2025/moishes` -> https://gavmag2025.github.io/moishes/

## Steps

1. Push the code to the `main` branch of `gavmag2025/moishes` (public repo, so Pages and Actions are free).
2. In GitHub: **Settings > Pages > Build and deployment > Source: GitHub Actions**. (Do not pick "Deploy from a branch".)
3. Push to `main` (or open **Actions > Deploy to GitHub Pages > Run workflow**). The workflow
   (`.github/workflows/pages.yml`) runs the node unit tests if any exist, then publishes the site.
   Tests, docs, `.git`, `.github` and `node_modules` are excluded from the published artifact.
4. When the run is green, open https://gavmag2025.github.io/moishes/ (first deploy can take a minute or two).
5. If the deploy job fails with an environment/permission error, check Settings > Environments > `github-pages`
   allows the `main` branch, and Settings > Actions > General > Workflow permissions is not blocking Pages.

Everything uses relative paths, so it works under the `/moishes/` sub-path. `.nojekyll` is included so files are served as-is.

## Custom domain (optional)

1. Buy a domain (e.g. a `.co.za` from a registrar) and point DNS at GitHub Pages: a `CNAME` record for `www`
   to `gavmag2025.github.io`, plus the four GitHub `A` records for the apex (see GitHub docs "Managing a custom domain").
2. Settings > Pages > Custom domain, enter it, tick **Enforce HTTPS** (free certificate).
3. Add a `CNAME` file containing the domain to the site root so deploys keep it.
4. Update the host in `sitemap.xml`, `robots.txt` and the canonical/OG tags in the HTML pages.

## Costs

| Item | Now | Optional later |
|---|---|---|
| GitHub Pages hosting + HTTPS | R0 | - |
| GitHub Actions (public repo) | R0 | - |
| Order channel (WhatsApp link) | R0 | WhatsApp Business API is paid; the normal app/Business app is free |
| Custom domain | R0 (not needed) | about R100-R200 per year for `.co.za` (check registrar prices) |
| Card/EFT payments | R0 (not enabled) | PayFast, Ozow, Yoco charge a percentage/fixed fee per transaction; no monthly fee on basic plans (confirm current rates with each provider) |
| Real order storage | R0 (browser only) | Formspree or Supabase free tiers (limits apply; check current limits) |
| Email/notification | R0 | free tiers of transactional email services |
| Monthly platform fee | R0 | none required |

Prices are indicative and change; verify with each provider before quoting a customer.
