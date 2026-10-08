# Development portfolio

[development.adammyoung.com](https://development.adammyoung.com): my
software engineering portfolio, presented as a synthwave CRT monitor with a
retro desktop inside it.

## What's on it

| Route | Panel |
| --- | --- |
| `/` | About |
| `/careers` | Careers |
| `/projects` | Projects (TrailWise, the photography site, Blurdle) |
| `/contact` | Contact |
| `/snake`, `/invaders`, `/matrix`, `/hacker` | Easter eggs |

Every panel has its own statically generated URL and opens as a window on the
desktop. Opening a window updates the URL and title shallowly, without a
navigation. The route list lives in `app/routes.ts`. `app/site.ts` holds the
site-wide metadata, which the layout, sitemap, robots, manifest, OG image and
JSON-LD all read.

## How it's built

- **Content is MDX in `content/`**, compiled at build time and rendered as
  Server Components, so the prose ships no client JS. `app/desktop.tsx` is the
  one large client boundary, and a `<noscript>` fallback renders the same
  content as plain flow.
- **The scene is pure CSS.** The tube, curvature, scanlines, TV static (SVG
  `feTurbulence`), grid floor and sun come from `@portfolio/crt`, styled
  entirely from `@portfolio/design-tokens`. To retune the look, edit
  `packages/design-tokens/src/tokens.css`.
- **Games are lazy.** Each easter egg is a separate
  `dynamic(() => import(...), { ssr: false })` chunk, so PixiJS never reaches
  the initial bundle.
- **Motion is opt-out.** A blocking `<head>` script sets `data-motion` before
  first paint, using the saved preference or the OS `prefers-reduced-motion`
  setting. Every animation is gated on both the attribute and the media query,
  and the on-screen toggle flips it live.
- **Accessibility.** There's a skip link into the screen and visible focus
  rings. Windows are labelled dialogs, and modals trap focus. The canvas games
  report their state through `aria-live`, and there's an on-screen d-pad for
  touch.
- **Analytics are consent-gated.** PostHog starts opted out with in-memory
  persistence, and the cookie banner turns it on. Requests are proxied through
  `/ingest` (see `next.config.mjs`). Vercel Analytics is cookieless.

## Running it

```bash
yarn dev        # http://localhost:3000
yarn build
yarn analyze    # build with the bundle analyzer
```

## Environment variables

Copy `.env.example` to `.env.local`. Both variables are optional locally.
Without them, analytics are simply off.

| Variable | Used by | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | Browser + server | PostHog project token. It's a public, browser-exposed key by design. |
| `NEXT_PUBLIC_POSTHOG_HOST` | Browser + `/ingest` rewrite | PostHog ingestion host, e.g. `https://eu.i.posthog.com`. |
