# Repository Guidelines

## Project Structure & Module Organization
This repository is a minimal Nuxt 4 application. Main source code lives in `app/`, with the root UI currently defined in `app/app.vue`. Static files belong in `public/` (for example `public/favicon.ico` and `public/robots.txt`). Project notes live in `specs/`. Runtime-generated directories such as `.nuxt/`, `.output/`, and `node_modules/` should not be edited or committed as source changes.

Use `nuxt.config.ts` for framework configuration, modules, and build options. If you add app-wide styles, place them under `app/assets/` and register them in Nuxt config.

## Build, Test, and Development Commands
Install dependencies with `npm install`.

- `npm run dev`: start the local Nuxt dev server on `http://localhost:3000`.
- `npm run build`: create a production build.
- `npm run preview`: serve the production build locally for verification.
- `npm run generate`: generate a static build when the app supports it.

Run commands from the repository root.

## Coding Style & Naming Conventions
Follow the existing Vue and TypeScript style in the repo: 2-space indentation, trailing commas where valid, and concise single-file components. Prefer PascalCase for Vue component filenames, camelCase for variables and functions, and kebab-case for public asset names. Keep Nuxt conventions first: place future routes in `app/pages/`, shared UI in `app/components/`, and composables in `app/composables/`.

No ESLint or Prettier config is committed yet, so keep formatting consistent with existing files and Nuxt defaults.

## Testing Guidelines
There is no automated test runner configured yet. Treat `specs/` as documentation, not executable coverage. Before opening a PR, verify changes with `npm run build` and `npm run preview`. If you add tests, keep them close to the feature or under a dedicated `tests/` directory and name them by behavior, such as `hero-renders.spec.ts`.

## Commit & Pull Request Guidelines
Recent history uses short, imperative commit messages such as `FEAT: tailwind v4`, `update config`, and `added specs`. Keep commits focused and descriptive; a simple uppercase prefix like `FEAT:` is acceptable when it adds clarity.

Pull requests should include a short summary, note any config or dependency changes, and link the relevant issue if one exists. For UI changes, include screenshots or a short recording and list the manual verification steps you ran.

## Configuration Notes
Current Nuxt settings live in `nuxt.config.ts`, including the Tailwind module and `compatibilityDate`. Update those intentionally and mention the reason in your PR when changing framework-level behavior.
