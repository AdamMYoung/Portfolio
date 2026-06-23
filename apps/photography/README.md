# Portfolio — Photography

Photography portfolio site. Displays photo galleries sourced from AWS S3, with EXIF metadata. Part of the [Portfolio monorepo](../../README.md).

## Getting Started

```bash
yarn dev     # start dev server at http://localhost:3000
yarn build   # production build
yarn lint    # lint
```

## Environment Variables

```env
# AWS credentials for S3 photo bucket access
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=
```

## Tech Stack

- **Framework:** Next.js, TypeScript
- **Styling:** Tailwind CSS, `tailwind-merge`
- **Storage:** AWS S3 (`@aws-sdk/client-s3`)
- **EXIF metadata:** `exifreader`
- **Content:** MDX, `fast-xml-parser`
- **UI:** `@headlessui/react`, `react-popper`
- **Date formatting:** `dayjs`
- **Image optimisation:** `sharp`
- **Analytics:** Vercel Analytics
