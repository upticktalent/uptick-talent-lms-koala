# uptick Talent — LMS Frontend

This repository contains the Next.js frontend for the uptick Talent learning-management system (LMS). It is a modern, TypeScript-based Next.js app using the App Router, server/client components, and common frontend patterns (providers, hooks, redux, API client, and feature folders).

Use this README as a template — it includes placeholders and recommended conventions for a robust Next.js project.

## Table of contents

- About
- Quick start
- Project structure
- Environment variables
- Scripts
- Development conventions
- Testing
- CI / CD (example)
- Deployment (example: Vercel)
- Troubleshooting
- Contributing
- License

## About

Brief: this frontend is a Next.js application (App Router) that connects to the uptake Talent backend API. It uses TypeScript, a centralized `src/lib/api/client.ts` API client, Redux for global state, and React Query or suspense-ready data fetching through providers.

Replace and adapt the sections below to match the project's real endpoints, secrets and workflows.

## Quick start

Requirements

- Node.js 18+ (recommended LTS)
- npm or yarn or pnpm

Install dependencies

```bash
# using npm
npm install

# or using pnpm
pnpm install

# or using yarn
yarn
```

Run development server

```bash
npm run dev
# or: pnpm dev, yarn dev
```

Open http://localhost:3000 in your browser.

Build and run production locally

```bash
npm run build
npm run start
```

## Project structure

Top-level folders you will see in this repo (trimmed):

- `src/app/` — Next.js App Router routes and layouts (server components and page entries)
- `src/components/` — UI components and small presentational pieces
- `src/features/` — Feature folders / domain code
- `src/lib/` — API clients, helpers and shared libraries
- `src/providers/` — React providers (Query client, Redux store, Theme, Auth)
- `src/hooks/` — Reusable React hooks
- `src/layout/` — Layout utilities used by the app root
- `src/utils/` — Utility functions and formatters
- `public/` — Static assets
- `next.config.ts`, `tsconfig.json`, `postcss.config.mjs` — framework/config

Example important files:

- `src/lib/api/client.ts` — central REST/GraphQL client
- `src/providers/query.provider.tsx` — react-query / tanstack provider
- `src/redux/store.ts` — redux store config + persistor

Adapt names to match your code conventions.

## Environment variables

Create a `.env.local` (never commit secrets). Add a `.env.example` to show required variables.

Example `.env.example` (placeholders):

```env
# Next.js
NEXT_PUBLIC_APP_NAME="uptick-talent-lms"
NEXT_PUBLIC_API_BASE_URL=https://api.example.com

# Authentication (example for auth service)
NEXT_PUBLIC_AUTH_CLIENT_ID=your-client-id
AUTH_CLIENT_SECRET=your-client-secret

# Analytics / Feature flags
NEXT_PUBLIC_ANALYTICS_ID=
FEATURE_FLAG_EXPERIMENTAL=false
```

Notes:

- Prefix variables that must be available in the browser with `NEXT_PUBLIC_`.
- Keep server-only secrets out of version control.

## Scripts

Common npm scripts to include in `package.json` (adjust for your stack):

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,md}\"",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:watch": "vitest --watch"
  }
}
```

Add or change commands to match your testing/linting setup (ESLint, Prettier, Vitest/Jest).

## Development conventions

- TypeScript strict mode should be enabled — prefer fixes that keep types strict.
- Use the App Router for pages in `src/app` and colocate component styles and tests.
- Prefer server components when no client-side interactivity is required; add "use client" at the top of client components.
- Keep API calls centralized in `src/lib/api` and wrap requests with error handling and logging.
- Add unit tests near the code (e.g., `MyComponent.test.tsx`) and keep snapshot sizes small.

Accessibility and performance

- Use semantic HTML and accessible roles/labels.
- Use the `next/image` component for images where appropriate.
- Prefer code-splitting and dynamic imports for large client-only components.

State management

- Use local component state where possible. Use Redux or Zustand for global UI state (not transient UI only).
- For server-synced data, prefer React Query (TanStack Query) or Next.js fetch on the server + caching.

## Testing

Suggested tools:

- Unit + component tests: Vitest + React Testing Library
- E2E: Playwright or Cypress

Example quick test commands:

```bash
npm run test
npm run test:watch
```

Add a `vitest.config.ts` and basic test setup file as needed.

## CI / CD (example)

Example GitHub Actions workflow (placeholder):

```yaml
name: CI

on: [push, pull_request]

jobs:
	build:
		runs-on: ubuntu-latest
		steps:
			- uses: actions/checkout@v4
			- name: Use Node.js
				uses: actions/setup-node@v4
				with:
					node-version: 18
			- run: npm ci
			- run: npm run lint
			- run: npm run build
			- run: npm run test --if-present
```

Store secrets (like API keys) in the GitHub repository secrets and reference them in workflow steps.

## Deployment (example: Vercel)

Vercel is an excellent option for Next.js.

Steps:

1. Connect your GitHub repository to Vercel.
2. Set environment variables in the Vercel project settings (do not push them to Git).
3. Configure build command: `npm run build` and the output directory is automatic for Next.js.

Alternative: use Docker with a Node image and host on your cloud provider.

## Troubleshooting

- Build errors: run `npm run build` locally and inspect the stack traces. Use `--trace-deprecation` or `NODE_OPTIONS=--trace-warnings` if needed.
- TypeScript errors: run `npm run typecheck` and fix in order from root-level imports.
- Linting: `npm run lint` will show issues; autofix with `eslint --fix` when safe.

## Contributing

- Please open an issue for significant changes or feature requests.
- Fork, create a feature branch, add tests, and open a pull request.
- Follow commit message conventions (e.g., Conventional Commits) if used by the project.

Suggested developer checklist for PRs:

1. Pull latest `main` and rebase.
2. Run `npm ci`, `npm run build`, `npm run test`.
3. Add/adjust tests and update `CHANGELOG` if applicable.

## Notes & placeholders

- Replace all placeholder URLs, API routes, and env names with real values.
- Consider adding these repo files if missing:
  - `.env.example`
  - `CONTRIBUTING.md`
  - `CODE_OF_CONDUCT.md`
  - `SECURITY.md`

## License

Specify your license here (e.g., MIT). If unknown, add a LICENSE file at the repo root.

---

If you'd like, I can also:

- create a `.env.example` file in the repo with the variables listed above
- add a sample GitHub Actions workflow file to `.github/workflows/ci.yml`
- add a `CONTRIBUTING.md` template

Tell me which of those you'd like me to add next.
