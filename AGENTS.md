# Repository Guidelines

## Project Structure & Module Organization

This repository is a single-process full-stack app.

- `client/`: React + Vite frontend. Main UI lives in `client/src/pages/` and shared UI primitives in `client/src/components/ui/`.
- `server/`: Express backend. Entry point is `server/index.ts`, routes are in `server/routes.ts`, and database access is in `server/storage.ts`.
- `shared/`: cross-stack schema and types, currently centered around `shared/schema.ts`.
- `script/`: build tooling, including `script/build.ts`.
- `uploads/`: present but not part of the active product flow.

## Build, Test, and Development Commands

- `npm install`: install dependencies.
- `npm run dev`: start the Express server in development mode with Vite middleware.
- `npm run build`: build the client into `dist/public` and bundle the server to `dist/index.cjs`.
- `npm run start`: run the production build.
- `npm run check`: run TypeScript type checking with `tsc`.
- `npm run db:push`: push the Drizzle schema to the configured PostgreSQL database.

Example:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db npm run dev
```

## Coding Style & Naming Conventions

- Use TypeScript for both client and server code.
- Match the surrounding file style and avoid unrelated reformatting.
- Use `PascalCase` for React components, `camelCase` for variables/functions, and lowercase file names for route/page modules like `home.tsx`.
- Keep shared types in `shared/` rather than duplicating API types in the client.
- No formatter or linter config is currently committed; rely on `npm run check` and existing patterns.

## Testing Guidelines

- No test framework is set up yet, and there is no coverage gate.
- Before opening a PR, run `npm run check` and manually verify list, create, edit, delete, search, and category filter flows.
- If tests are added later, prefer `*.test.ts` naming; those files are already excluded from `tsconfig.json`.

## Commit & Pull Request Guidelines

- Follow the existing Conventional Commits pattern: `feat: ...`, `chore: ...`.
- Keep commit messages focused on user-visible behavior or a clear technical change.
- PRs should include a short summary, any env or database changes, screenshots for UI work, and manual verification notes.

## Security & Configuration Tips

- Set `DATABASE_URL` before running the app or Drizzle commands.
- Do not commit real credentials or production database URLs.
- Product images are stored as base64 in PostgreSQL, so be mindful of payload and table growth when changing upload behavior.
