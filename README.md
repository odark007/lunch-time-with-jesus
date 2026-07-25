# Lunch Time With Jesus

A mobile-first PWA that plays daily uploaded YouTube content as audio, with a
3D animated vinyl-record player, a calendar of past days, and a lightweight
admin panel for adding new entries.

## Stack

- Next.js 14 (App Router)
- Three.js (vinyl disc animation)
- YouTube IFrame API (audio playback, video hidden)
- Data stored in `data/entries.json`, committed to GitHub by Netlify Functions
- Hosted on Netlify

## Local development

```bash
npm install
npm run dev
```

Admin save/delete calls hit `/.netlify/functions/*`, which only run under the
Netlify CLI, not plain `next dev`. To test admin functionality locally:

```bash
npm install -g netlify-cli
netlify dev
```

## Environment variables

Copy `.env.example` to `.env` for local Netlify CLI use, or set these in
Netlify's dashboard (Site settings > Environment variables) for production:

- `GITHUB_TOKEN` — a GitHub personal access token with repo write access
- `GITHUB_OWNER` — your GitHub username or org
- `GITHUB_REPO` — this repo's name
- `GITHUB_BRANCH` — usually `main`
- `ADMIN_PASSWORD` — shared password for the admin panel

## Deployment flow

1. Push to GitHub
2. Netlify auto-builds and deploys on push to `main`
3. Admin adds an entry → Netlify Function commits an updated
   `data/entries.json` back to `main` → Netlify auto-redeploys with the new
   entry live within a couple of minutes

## Known constraints (by design, see project notes)

- **Not true audio-only.** The YouTube video track still loads in the
  background; it's visually hidden via CSS so only audio is perceived. A true
  audio-only stream would require a backend media proxy, which conflicts with
  YouTube's Terms of Service.
- **Admin auth is a simple client-side password gate**, not a secure login
  system. The real check happens server-side in the Netlify functions, but
  the admin UI itself is viewable by anyone who reaches `/admin`.
- **Vinyl disc glow is a simulated ambient pulse**, not reactive to actual
  audio frequency data — genuine audio analysis isn't possible on
  cross-origin YouTube iframe audio.

## Before going live

- Replace `public/og-default.png` with real branded artwork (1200x630)
- Replace `public/icons/icon-192.png` and `icon-512.png` with a real app icon
- Replace placeholder entries in `data/entries.json` with real content, or
  clear the array and add entries via `/admin`
- Update `SITE_URL` in `app/layout.js` to your real production domain
