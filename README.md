# Timber Formula

Carve a 1:12 wooden Formula car, tune it, and race the clock on 20 tabletop circuits.
Runs as a single Cloudflare Worker with a D1 (SQLite) leaderboard.

## Run locally

Needs Node 22.12+ (`nvm use` picks it up from `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:8787 with a local database; rebuilds on save
npm run check      # build + physics + API smoke checks (same as CI)
```

The local database lives in `.wrangler/` and is created from `drizzle/*.sql` on start.
`Timber Formula.html` is a build output that also works offline from `file://`.

## How deploys work

| Event | What happens |
|---|---|
| Pull request opened or pushed | `npm run check`, then deploys to the **preview** Worker (its own database) and comments the link on the PR |
| Merge / push to `main` | `npm run check`, applies new migrations to the production database, deploys |

Physics changes alter lap times and therefore invalidate the leaderboard. `npm run check`
fails when stock lap times change; run `node scripts/check.mjs --update` when the change is intended.

## One-time setup

1. Sign in: `npx wrangler login`
2. Create both databases and paste each printed `database_id` into `wrangler.toml`:
   ```bash
   npx wrangler d1 create timber-formula
   npx wrangler d1 create timber-formula-preview
   ```
3. In Cloudflare → *Manage account* → *Account API tokens*, create a token from the
   **Edit Cloudflare Workers** template and add **D1: Edit** to its permissions.
4. Create the GitHub repository, push, then add two repository secrets
   (*Settings → Secrets and variables → Actions*):
   - `CLOUDFLARE_API_TOKEN`: the token from step 3
   - `CLOUDFLARE_ACCOUNT_ID`: shown by `npx wrangler whoami`
5. Protect `main` (*Settings → Branches*) and require the **Pull request** check, so
   phone merges only go through once checks pass.
