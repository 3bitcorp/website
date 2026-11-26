# 3BitCorp Website

Company website for [3BitCorp](https://3bitcorp.com) — built with HTMX, Tailwind CSS (CDN), and Netlify Functions. No build step required.

## Stack

| Layer | Technology |
|---|---|
| HTML/CSS | Tailwind CSS via CDN |
| Interactivity | HTMX + vanilla JS |
| CAPTCHA | Cloudflare Turnstile |
| Hosting | Netlify (static + Functions) |
| Forms | Netlify Forms → email notification |
| CI | GitHub Actions |

## Local preview

```bash
# No install needed — open directly in browser
open index.html

# Or serve locally (optional)
python3 -m http.server 4321
# → http://localhost:4321
```

## Deployment — Netlify

Every push to `main` automatically deploys to Netlify.

### First-time setup

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
2. Connect to GitHub → select `3bitcorp/website`
3. Build settings (auto-detected from `netlify.toml`):
   - **Publish directory:** `.`
   - **Build command:** *(blank)*
4. Click **Deploy site**

### Environment variables (required)

In Netlify → **Site configuration → Environment variables**:

| Variable | Description |
|---|---|
| `TURNSTILE_SECRET` | Cloudflare Turnstile secret key |

After adding variables → **Deploys → Trigger deploy → Deploy site**

### Form notifications

After first deploy → **Forms → contact → Form notifications → Email notification** → `3bitcorp@gmail.com`

## Project structure

```
website/
├── index.html                  # Full site (single page)
├── netlify.toml                # Netlify build + redirect config
├── assets/
│   ├── 3bitcorp-logo.png       # Company logo
│   ├── css/custom.css          # Custom styles (beyond Tailwind)
│   └── js/main.js              # Interactivity, form handling
├── netlify/
│   └── functions/
│       └── contact.js          # Contact form handler + Turnstile verify
└── .github/
    └── workflows/
        └── ci.yml              # CI pipeline (runs on every push)
```

## CI pipeline

GitHub Actions runs on every push and PR:

| Job | What it checks |
|---|---|
| `validate-html` | HTML5 validity |
| `check-assets` | All local file references resolve |
| `check-links` | CDN URLs are reachable |
| `lint-js` | ESLint over `assets/js/main.js` |
| `ci-passed` | Gate — green only if all pass |

## Contact form flow

```
User fills form
  → Cloudflare Turnstile verifies (client-side widget)
  → JS fetches POST /api/contact with token
  → Netlify Function verifies token with Cloudflare API (server-side)
  → If valid → submission stored in Netlify Forms
  → Email notification sent to 3bitcorp@gmail.com
  → Page shows success message
```
