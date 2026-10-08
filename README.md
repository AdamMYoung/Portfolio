# Portfolio

Monorepo for my two portfolio sites (Turborepo + Yarn 4 workspaces). Each app
deploys independently on Vercel.

| App | Site | Stack |
| --- | ---- | ----- |
| [`apps/development`](apps/development/README.md) | [development.adammyoung.com](https://development.adammyoung.com) | Next 16 (App Router), React 19, Tailwind v4, MDX |
| [`apps/photography`](apps/photography/README.md) | [photography.adammyoung.com](https://photography.adammyoung.com) | Next 16 (Pages Router), React 19, React Three Fiber, Tailwind v4 |

- **Development** is an interactive synthwave CRT monitor with a retro desktop
  inside it: About, Careers, Projects and Contact open as windows, plus a few
  easter-egg games.
- **Photography** is a walk-through 3D gallery of my photographs, with a plain
  grid view as an alternative. The photos come from Cloudflare R2.

## Packages

These are only used by the development site. They ship TypeScript source
(no build step) and are transpiled by the app.

| Package | What it is |
| --- | --- |
| `@portfolio/design-tokens` | Single source of truth for the look: `tokens.css` (CSS custom properties), a Tailwind v4 `@theme` bridge, and a JS palette mirror for canvas code. |
| `@portfolio/crt` | The CRT + synthwave stage, pure CSS: `<CrtStage>`, `<CrtScreen>`, `<SynthwaveBackground>`, motion and gyro toggles, and parallax/tilt hooks. |
| `@portfolio/ui` | Retro window manager rendered inside the screen: `<WindowManagerProvider>` / `useWindows`, draggable `<Window>`, `<DesktopIcon>`, `<Taskbar>`, `<Clock>`, `<Button>`. |
| `@portfolio/games` | Easter eggs, one lazy module each: `snake`, `space-invaders` (PixiJS v8), `matrix` (canvas), `hacker` (DOM). |
| `tsconfig` | Shared TS configs (`library.json` and `next.json` for development and the packages, `base.json` / `nextjs.json` for photography). |

## Getting started

Requires Node 24 (`.nvmrc`).

```bash
corepack enable        # Yarn 4 via the packageManager field
yarn install
yarn dev               # both apps: development on :3000, photography on :3001
yarn build             # turbo build
yarn typecheck         # tsc --noEmit across every workspace
yarn lint              # Biome (lint + format check)
yarn workspace @portfolio/games test   # snake-logic assertions
```

Each app reads its own environment variables. Copy that app's `.env.example`
to `.env.local` and fill it in. See the app READMEs for what each variable does.
Never commit real values. `.env` and `.env*.local` are gitignored.
