# Repository Guidelines

## Project Structure & Module Organization

This is a Vue 3/TypeScript monorepo. `demo/` is the API-backed public site; `demo-static/` is its fully static counterpart. `manager/front/` is the Vue/Pinia administration UI, and `manager/backend/` is the Express, SQLite, and Socket.IO API. Shared Vue components and validation tests live in `shared/`. Runtime configuration and uploaded assets are persisted outside source code through `data/` and `uploads/`; do not reset or overwrite them while making code changes.

## Build, Test, and Development Commands

Install dependencies with `yarn install` at the relevant package directory.

- `cd demo && yarn dev` — run the public site on port 3000.
- `cd manager/backend && yarn dev` — run the API on port 3002.
- `cd manager/front && yarn dev` — run the admin UI (Vite proxy targets the backend).
- `yarn build` in `demo/`, `demo-static/`, or `manager/front/` — validate and produce frontend bundles.
- `cd manager/backend && yarn build` — TypeScript-check and compile the API.
- `cd shared && yarn test` or `cd demo && yarn test` — run Vitest suites.
- `./publish-release.sh` — build release artifacts after all relevant builds pass; it follows the repository release workflow.

## Coding Style & Naming Conventions

Use Vue Composition API with `<script setup lang="ts">`, TypeScript types for component props and API data, and two-space indentation. Name Vue components in PascalCase (for example, `BasicConfigPanel.vue`), composables as `useX.ts`, and services in camelCase. Keep configuration defaults aligned across `manager/front`, `manager/backend`, `demo`, and `demo-static`. Prefer targeted CSS scoped to a component; preserve responsive behavior when changing admin UI layouts.

## Testing Guidelines

Tests use Vitest, Vue Test Utils, happy-dom, and property tests with fast-check. Place tests beside source as `*.test.ts` or `*.property.test.ts`. Run the affected package’s test command and build every changed deployable package. For UI changes, verify desktop and narrow viewport behavior manually.

## Commit & Pull Request Guidelines

Recent history uses short Traditional Chinese messages plus prefixes such as `Fix:`, `Update:`, and `Docs:`. Use the same concise pattern, e.g. `Fix: 同步推薦區域設定預設值`. Keep commits focused. PRs should explain user-visible behavior, list validation commands, identify configuration or migration effects, and include screenshots for admin UI changes.

## Security & Release Notes

Never commit credentials, tokens, databases, or uploaded files. Treat configuration saves and `publish-release.sh` as separate actions: save first, then publish only when the user intends to update the static release.
