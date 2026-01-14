<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request mentions planning/proposals or introduces breaking changes.

Use `@/openspec/AGENTS.md` to learn how to create and apply change proposals.

Keep this managed block so 'openspec update' can refresh instructions.

<!-- OPENSPEC:END -->

# AGENTS.md

## Project Overview

Full-stack React application built with Bun, TypeScript 5.8, React 19, TanStack Router, Hono, tRPC, Python, FastAPI, Cloudflare Workers.

**Monorepo:** `apps/web/`, `apps/app/`, `apps/shot-detector/`, `apps/api/`, `apps/email/`, `packages/core/`, `packages/ui/`, `db/`

## Essential Commands

```bash
cd apps/shot-detector
uv venv
source .venv/bin/activate
uv sync
uv run uvicorn app:app --port 8000
```

```bash
# Development
bun dev              # Start all apps
bun web:dev          # Marketing site
bun api:dev          # API server
bun app:dev          # Main app


# Building
bun build            # Build all
bun web:build        # Marketing site
bun app:build        # Main app
bun api:build        # API

# Testing
bun test             # All tests
bun test path/to/file.test.ts    # Single test file
bun test --run "pattern"         # Match pattern
bun app:test         # Test main app
bun api:test         # Test API

# Lint/Typecheck
bun lint             # Must pass before commit
bun typecheck        # TypeScript errors

# Database
bun --filter @repo/db generate  # Migrations
bun --filter @repo/db studio    # Drizzle Studio
bun --filter @repo/db push      # Apply schema

# UI Components
bun ui:add component  # Add shadcn/ui
bun ui:list           # List installed
```

## Code Style

### Imports

- Named imports: `import { foo } from "bar"` (tree-shaking)
- No namespace: `import * as baz from "bar"`
- Use `.js` extensions for ESM
- Group: external → internal → local

### Formatting

- Width: 80 chars, indent: 2 spaces, semicolons: always
- Quotes: double (`"`), single in JSX, trailing commas: always
- Arrow parens: always, line endings: LF

### TypeScript

- Use type inference, explicit for exports/complex logic
- `type` for definitions, `interface` for object shapes
- Export Drizzle types: `export type User = typeof user.$inferSelect`
- No `_` prefix for private vars

### Naming

- Functions/variables: `camelCase`, Components: `PascalCase`, Types: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`, Files: kebab-case/PascalCase

### Error Handling

- Backend: `HTTPException` (Hono), `TRPCError` (tRPC) with proper codes
- Frontend: try/catch with `console.error`, user-friendly messages
- Auth errors: use error boundaries (`apps/app/components/auth/auth-error-boundary.tsx`)
- Never expose secrets

### Comments

- Brief `//` for non-obvious logic rationale
- `@file` JSDoc only for core architectural files

### React Patterns

- Functional components with hooks, no class components
- Destructure props: `function Header({ isSidebarOpen }: Props)`
- `interface` with `ComponentProps` for extending native props
- Props interface before component
- Jotai for state, TanStack Query for server state
- Follow shadcn/ui patterns

### Backend Patterns

- Hono middleware for cross-cutting concerns
- FastAPI for shot detection service RESTful API
- tRPC routers in `apps/api/routers/*.ts`
- `protectedProcedure` for auth (defined in `lib/trpc.ts`)
- Drizzle ORM schemas in `db/schema/*.ts`
- Better Auth with custom adapters in `apps/api/lib/auth.ts`

### File Organization

- Colocate related files, barrel exports (`index.ts`)
- Routing in `apps/app/routes/`, shared hooks in `apps/app/hooks/`

## Key Libraries

**Frontend:** TanStack Router, Jotai, shadcn/ui, Better Auth client
**Backend:** Hono, tRPC, Drizzle ORM, Better Auth server
**Testing:** Vitest, Happy DOM

## Before Committing

1. `bun lint` - zero warnings
2. `bun typecheck` - no TS errors
3. `bun test` - all passing
4. `bun build` - build relevant apps
5. Never commit secrets

## Principles

- Functional over class-based code
- Leverage Bun/Hono patterns
- Keep components composable and testable
