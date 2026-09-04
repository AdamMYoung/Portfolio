# CLAUDE.md

Monorepo: Turborepo + Yarn 4 workspaces. Node 24 (`.nvmrc`). Lint/format via
Biome 2 (`biome.json`) — **not** ESLint/Prettier (the `packages/eslint-config-custom`
package exists only for the legacy `apps/photography`).

## Layout

- `apps/development` — the CRT-desktop portfolio. Next 16 App Router, React 19,
  Tailwind v4, MDX (`@next/mdx`, Turbopack — plugins referenced by name in
  `next.config.mjs`, not imported).
- `apps/photography` — legacy Next 14 Pages Router app. Do not migrate it as a
  side effect; it has its own toolchain.
- `packages/design-tokens` (`@portfolio/design-tokens`) — CSS custom properties +
  Tailwind `@theme` bridge + JS palette. The one place to change the look.
- `packages/crt` (`@portfolio/crt`) — CSS-only CRT + synthwave stage.
- `packages/ui` (`@portfolio/ui`) — retro window manager / desktop kit.
- `packages/games` (`@portfolio/games`) — PixiJS easter eggs, one lazy module each.

## Conventions

- Packages ship **source** (`main`/`exports` point at `src/*.ts[x]`); the app
  transpiles them via `transpilePackages`. No build step in packages.
- Package CSS is exposed as one `./styles.css` export and `@import`ed from the
  app's `globals.css` (App Router disallows component-level global CSS). Class
  namespaces: `crt-*`, `sw-*` (crt), `rd-*` (ui), `pg-*` (games).
- Keep the initial JS bundle lean: content stays in Server Components; anything
  pulling PixiJS must be behind `dynamic(() => import(...), { ssr: false })`.
- Every animation must be gated on `:root[data-motion="off"]` **and**
  `@media (prefers-reduced-motion: reduce)`.
- TS is the native compiler (`typescript@7`), bundler module resolution,
  `noUncheckedIndexedAccess` on — index access needs guarding.

## Commands

`yarn dev` · `yarn build` · `yarn typecheck` · `yarn lint` ·
`yarn workspace @portfolio/games test`
