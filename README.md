## Technology Stack

**Core Runtime & Platform**

- [Bun](https://bun.sh/) — Lightning-fast JavaScript runtime and package manager
- [Cloudflare Workers](https://workers.cloudflare.com/) — Edge computing platform

### Frontend & UI

- [React 19](https://react.dev/) — Latest React with concurrent features
- [TanStack Router](https://tanstack.com/router) — Type-safe routing with data loading
- [Tailwind CSS v4](https://tailwindcss.com/) — Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) — Beautiful, accessible components
- [Jotai](https://jotai.org/) — Atomic state management
- [Astro](https://astro.build/) — Static site generator for marketing pages

### Backend & API

- [Hono](https://hono.dev/) — Ultra-fast web framework for the edge
- [tRPC](https://trpc.io/) — End-to-end type safety for APIs
- [Better Auth](https://www.better-auth.com/) — Modern authentication solution

### AI & Computer Vision

- [Python](https://www.python.org/) — Programming language for AI and machine learning
- [FastAPI](https://fastapi.tiangolo.com/) — Modern, fast (high-performance) web framework for building APIs
- [YOLOv8](https://github.com/ultralytics/ultralytics) — State-of-the-art object detection model
- [OpenCV](https://opencv.org/) — Open source computer vision library

### Database & ORM

- [Drizzle ORM](https://orm.drizzle.team/) — TypeScript ORM with excellent DX
- [Neon PostgreSQL](https://neon.tech/) — Serverless PostgreSQL database

### Development Tools

- [Vite](https://vitejs.dev/) — Next-generation frontend tooling
- [Vitest](https://vitest.dev/) — Blazing fast unit testing
- [TypeScript](https://www.typescriptlang.org/) — Static type checking
- [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/) — Code quality and formatting

## Monorepo Architecture

This starter kit uses a thoughtfully organized monorepo structure that promotes code reuse and maintainability:

- [`apps/app/`](./apps/app) — React 19 application with TanStack Router, Jotai, and Tailwind CSS v4
- [`apps/web/`](./apps/web) — Astro marketing website for static site generation
- [`apps/api/`](./apps/api) — tRPC API server powered by Hono framework for Cloudflare Workers
- [`apps/email/`](./apps/email) — React Email templates for authentication and transactional emails
- [`apps/shot-detector/`](./apps/shot-detector) — Python service for basketball shot detection using YOLOv8
- [`packages/core/`](./packages/core) — Shared TypeScript types and utilities
- [`packages/ui/`](./packages/ui) — Shared UI components with shadcn/ui management utilities
- [`packages/ws-protocol/`](./packages/ws-protocol) — WebSocket protocol template with type-safe messaging
- [`db/`](./db) — Database schemas, migrations, and seed data
- [`docs/`](./docs) — VitePress documentation site
- [`infra/`](./infra) — Terraform infrastructure configurations for multi-environment deployment
- [`scripts/`](./scripts) — Build automation and development tools

**Why Monorepo?** This structure enables seamless code sharing between frontend and backend, ensures type consistency across your entire stack, and simplifies dependency management. When you update a type definition, both client and server stay in sync automatically.

**Deployment Flexibility:** Each app can be deployed independently to Cloudflare Workers for global edge computing, ensuring optimal performance worldwide.

## Prerequisites

- [Bun](https://bun.sh/) v1.3+ (replaces Node.js and npm)
- [Python](https://www.python.org/) v3.8+ (for basketball shot detection service)
- [pip](https://pip.pypa.io/en/stable/) (Python package manager)
- [VS Code](https://code.visualstudio.com/) with our [recommended extensions](.vscode/extensions.json)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) browser extension (recommended)
- [Cloudflare account](https://dash.cloudflare.com/sign-up) for deployment

## Quick Start

### 1. Create Your Project

[Generate a new repository](https://github.com/kriasoft/react-starter-kit/generate) from this template, then clone it locally:

```bash
git clone https://github.com/your-username/your-project-name.git
cd your-project-name
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Configure Environment

Update environment variables in [`.env`](./.env) and `.env.local` files as well as Wrangler configuration in [`wrangler.jsonc`](./apps/api/wrangler.jsonc).

### 4. Start Development

```bash
# Launch all apps in development mode (web, api, and app)
bun dev

# Or, start specific apps individually
bun --filter @repo/web dev  # Marketing site
bun --filter @repo/app dev  # Main application
bun --filter @repo/api dev  # API server

# Start basketball shot detection service (Python)
cd apps/shot-detector
uv install
uv run uvicorn app:app --host 0.0.0.0 --port 8000
```

### 5. Initialize Database

Set up your database connection and schema:

1. Create a Neon PostgreSQL database `CREATE DATABASE dbname;`.
2. Run the contents of `db/scripts/setup-extensions.sql` to install required extensions.

```bash
# Apply migrations to database
bun --filter @repo/db migrate

# Quick development setup (pushes schema directly, skips migrations)
bun --filter @repo/db push

# Seed with sample data (optional)
bun --filter @repo/db seed

# Open database GUI for inspection
bun --filter @repo/db studio
```

**Note:** Ensure `DATABASE_URL` is configured in your `.env.local` file before running these commands.

Open <http://localhost:5173> to see your React app running. The marketing website runs on <http://localhost:4321>. The backend API will be available at the port shown by `wrangler dev` (typically 8787).

## Production Deployment

### 1. Environment Setup

Configure your production secrets in Cloudflare Workers:

```bash
# Required secrets
bun wrangler secret put BETTER_AUTH_SECRET

# OAuth providers (as needed)
bun wrangler secret put GOOGLE_CLIENT_ID
bun wrangler secret put GOOGLE_CLIENT_SECRET

# Email service
bun wrangler secret put RESEND_API_KEY

# AI features (optional)
bun wrangler secret put OPENAI_API_KEY
```

Note: run these commands from the target app directory or pass `--config apps/<app>/wrangler.jsonc`.

**Note:** The `RESEND_EMAIL_FROM` is configured in `wrangler.jsonc` as it's not sensitive.

### 2. Build and Deploy

```bash
# Build packages that require compilation (order matters!)
bun email:build    # Build email templates first
bun web:build      # Build marketing site
bun app:build      # Build main React app

# Deploy all applications
bun web:deploy     # Deploy marketing site
bun api:deploy     # Deploy API server
bun app:deploy     # Deploy main React app
```

### 3. Deploy Basketball Shot Detection Service

The basketball shot detection service is a Python application that can be deployed to any cloud platform that supports containerized applications, such as Google Cloud Run, AWS ECS, or Azure Container Apps.

#### Using Docker

```bash
# Build Docker image
cd apps/shot-detector
docker build -t basketball-shot-detector .

# Run locally
docker run -p 8000:8000 basketball-shot-detector

# Deploy to Google Cloud Run
docker tag basketball-shot-detector gcr.io/your-project-id/basketball-shot-detector
docker push gcr.io/your-project-id/basketball-shot-detector
gcloud run deploy basketball-shot-detector \
  --image gcr.io/your-project-id/basketball-shot-detector \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Configuration

Update the Python service URL in your API service configuration to point to the deployed shot detection service.
