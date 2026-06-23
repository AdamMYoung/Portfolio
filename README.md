# Portfolio

Personal portfolio monorepo built with Turborepo and Yarn workspaces. Contains two Next.js apps deployed independently via Vercel.

![GitHub last commit](https://img.shields.io/github/last-commit/AdamMYoung/Portfolio)

## Apps

| App | Description |
| --- | ----------- |
| `apps/development` | Development portfolio — projects, writing, and work history |
| `apps/photography` | Photography portfolio — photo gallery backed by AWS S3 |

## Getting Started

```bash
# Install dependencies
yarn install

# Start all dev servers
yarn dev

# Build all apps
yarn build

# Lint
yarn lint
```

## Tech Stack

Both apps share:
- **Framework:** Next.js, TypeScript
- **Styling:** Tailwind CSS, `tailwind-merge`
- **Content:** MDX (`@mdx-js/loader`, `@mdx-js/react`)
- **Analytics:** Vercel Analytics
- **Deployment:** Vercel

`apps/photography` additionally uses:
- **Storage:** AWS S3 (`@aws-sdk/client-s3`)
- **EXIF data:** `exifreader`
- **Date formatting:** `dayjs`
- **Icons:** `react-icons`
- **UI:** `@headlessui/react`, Popper.js

## Links

- **Repo:** [github.com/AdamMYoung/Portfolio](https://github.com/AdamMYoung/Portfolio)
