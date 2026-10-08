# Photography portfolio

[photography.adammyoung.com](https://photography.adammyoung.com): my
photography, shown as a 3D gallery you can walk around or as a plain grid.

## What's on it

| Route | What it is |
| --- | --- |
| `/` | Splash page that offers the two ways in |
| `/gallery` | Walk-through 3D gallery (React Three Fiber) |
| `/list` | Every photo in one image grid, with a full-screen viewer |
| `/sitemap.xml` | Sitemap, including image entries |
| `/api/hearts` | Shared per-photo ❤️ tally |
| `/api/og`, `/api/icon` | Generated social card and icons |

## How it's built

- **Photos come from Cloudflare R2.** At build time, `getStaticProps` calls
  `getImages()`, which lists the bucket over the S3 API, reads each file's EXIF
  (`exifreader`) and picks out its dominant colour (`sharp`). To publish a new
  photo, upload it to the bucket and redeploy. Its placard is written from its
  own EXIF.
- **The gallery is generated.** `src/utils/gallery/buildRooms.ts` lays the
  photos out into rooms off a corridor. The layout is a pure function of the
  photos and a seed, so the client can reshuffle the building on demand. To run
  its self-check: `npx tsx src/utils/gallery/buildRooms.selfcheck.ts`.
- **Gallery scene** (`src/components/gallery/`): keyboard, drag and joystick
  movement, placards, a minimap, wandering visitors, lighting and
  post-processing, and day/evening and quality toggles. UI state lives in a
  Zustand store. Per-frame values are plain mutable objects, kept out of React.
  The canvas is client-only via `dynamic(..., { ssr: false })`.
- **Hearts** go through `pages/api/hearts.ts`, the only code that talks to
  Upstash Redis. If Redis isn't configured, the route reports "not persisted"
  and the client keeps a local count instead.
- **Analytics are consent-gated.** PostHog only starts capturing once the
  cookie banner allows it. Vercel Analytics is cookieless.

## Running it

```bash
yarn dev     # http://localhost:3001
yarn build   # needs the R2 variables below: pages are built from the bucket
```

## Environment variables

Copy `.env.example` to `.env.local`. Only the `NEXT_PUBLIC_*` values reach the
browser. Everything else is read on the server or at build time. Server-side
variables also need listing under `build.env` in the root `turbo.json`.

| Variable | Required | Notes |
| --- | --- | --- |
| `CLOUDFLARE_ID` | Yes | Cloudflare account ID, used to build the R2 endpoint |
| `S3_ACCESS_KEY` / `S3_SECRET_ACCESS_KEY` | Yes | R2 API token, read-only is enough |
| `S3_BUCKET_NAME` | Yes | Bucket the photos are listed from |
| `S3_BUCKET_HOSTNAME` | Yes | Public hostname the photos are served from. It must match `images.remotePatterns` in `next.config.js` |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | No | Shared heart tally. `KV_REST_API_URL` / `KV_REST_API_TOKEN` (Vercel Marketplace names) also work |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` / `NEXT_PUBLIC_POSTHOG_HOST` | No | PostHog analytics. The token is a public key |
