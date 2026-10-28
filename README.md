# SwiftCart

Static marketing site for **swiftcart1.com**, hosted on Cloudflare Workers (static assets).

## Structure
- `public/` – the site (HTML, CSS, JS, favicon). Edit these files to change the site.
- `wrangler.jsonc` – Cloudflare config, including the custom domains.
- `.github/workflows/deploy.yml` – deploys automatically on every push to `main`.

## Preview locally
```bash
npx wrangler dev
```
Then open http://localhost:8787.

## Deploy
Push to `main`. GitHub Actions runs `wrangler deploy` using the
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets.
