# Portfolio

Personal portfolio monorepo (Turborepo + Yarn 4 workspaces). Two Next.js apps
deploy independently on Vercel.

## Apps

| App | Stack | Description |
| --- | ----- | ----------- |
| `apps/development` | Next 16 (App Router), React 19, Tailwind v4, MDX | The **CRT desktop** portfolio — an interactive synthwave CRT monitor with a retro window manager, MDX content, and two PixiJS easter-egg games. |
| `apps/photography` | Next 14 (Pages Router) | Photo gallery backed by Cloudflare R2. Untouched by the CRT revamp. |

## Packages

| Package | What it is |
| --- | --- |
| `@portfolio/design-tokens` | Single source of truth for the synthwave / CRT system — `tokens.css` (CSS custom properties), a Tailwind v4 `@theme` bridge, and a small JS palette mirror for canvas code. |
| `@portfolio/crt` | The CRT + synthwave stage, **pure CSS** (no WebGL): `<CrtStage>` (pointer-driven 3D pan), `<CrtScreen>` (bezel, curvature, scanlines, TV static, flicker, power-on), `<SynthwaveBackground>` (grid + sun + horizon), `<MotionToggle>` + `useMotionPreference`. |
| `@portfolio/ui` | Retro-desktop kit rendered *inside* the screen: `<WindowManagerProvider>` / `useWindows`, draggable `<Window>` (focus trap, keyboard move), `<DesktopIcon>`, `<Taskbar>`, `<Clock>`, `<Button>`. |
| `@portfolio/games` | Easter eggs on PixiJS v8, one lazy-loaded module each: `@portfolio/games/snake`, `@portfolio/games/space-invaders`. A shared `GameShell` owns the Pixi lifecycle, rAF via Pixi's ticker, keyboard + touch input, and the accessible status shell. |
| `tsconfig` | Shared TS configs (`library.json`, `next.json`, plus the legacy configs the photography app still uses). |

## Getting started

```bash
corepack enable        # Yarn 4 via the packageManager field
yarn install
yarn dev               # all apps (development on :3000)
yarn build             # turbo build
yarn typecheck         # tsc --noEmit across every package
yarn lint              # biome check
yarn workspace @portfolio/games test   # pure snake-logic assertions
```

## Design notes

- **No WebGL for the scene.** The tube, curvature, scanlines, TV static
  (SVG `feTurbulence`), the synthwave floor/ceiling grid and the retro sun are
  all CSS. PixiJS is used *only* for the two games and is never in the initial
  bundle — each game is a `dynamic(() => import(...), { ssr: false })` boundary.
- **Content is server-rendered.** About / Projects / Contact are MDX compiled at
  build time and rendered as React Server Components, so the prose costs zero
  client JS. The interactive shell (`app/desktop.tsx`) is the only large client
  boundary; a `<noscript>` block renders the same content as plain flow.
- **Motion is opt-out at three levels.** A blocking `<head>` script sets
  `data-motion` before first paint from `localStorage` or the OS
  `prefers-reduced-motion` setting; every keyframe is gated behind both that
  attribute and the media query; the top-right `<MotionToggle>` flips it live
  (shared across consumers via a `useSyncExternalStore` module store).
- **Accessibility.** Skip link into the screen, visible focus rings on every
  control, labelled dialog windows with a focus trap for modals, `aria-live`
  status for the (canvas) games, on-screen d-pad for touch, full keyboard paths.

## Retuning the aesthetic

Everything visual keys off `packages/design-tokens/src/tokens.css`. Change the
palette primitives or the `--crt-*` / `--grid-*` / `--pan-*` knobs there and the
whole scene follows.
