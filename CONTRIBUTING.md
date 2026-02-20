# Contributing to Aluplan Support Desk

Thank you for your interest in contributing! 🎉 This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Branch Naming Convention](#branch-naming-convention)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Code of Conduct

Be respectful, constructive, and professional. We're all here to build something great.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/aluplan-support-desk-V02.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `pnpm install`
5. Set up environment: `cp .env.example apps/backend/.env`
6. Start infrastructure: `docker-compose up -d postgres`
7. Run migrations: `cd packages/database && npx prisma migrate dev`
8. Start dev servers: `pnpm dev`

## Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/short-description` | `feature/email-piping` |
| Bug Fix | `fix/short-description` | `fix/sla-calculation` |
| Hotfix | `hotfix/short-description` | `hotfix/auth-bypass` |
| Refactor | `refactor/short-description` | `refactor/ticket-service` |
| Docs | `docs/short-description` | `docs/api-reference` |

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes nor adds |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `chore` | Build, CI, or tooling changes |

### Scopes

| Scope | Area |
|-------|------|
| `backend` | NestJS API changes |
| `frontend` | Next.js UI changes |
| `db` | Prisma schema or migration changes |
| `auth` | Authentication/authorization |
| `tickets` | Ticket module |
| `kb` | Knowledge Base module |
| `ai` | AI/Ollama integration |
| `faq` | FAQ pipeline |
| `customers` | Customer registration/CRM |

### Examples

```
feat(customers): add customer registration with CRM verification
fix(backend): resolve template literal syntax error in users service
docs: add comprehensive README with architecture overview
chore(db): add CustomerProfile model and migration
```

## Pull Request Process

1. **Ensure your branch is up to date** with `main`
2. **Run the build** before submitting: `pnpm run build` (both apps must pass)
3. **Fill out the PR template** completely
4. **Request review** from at least 1 team member
5. **Address feedback** promptly

### PR Checklist

- [ ] Code compiles without errors (`pnpm run build`)
- [ ] New features have appropriate validation
- [ ] Database changes include a Prisma migration
- [ ] Sensitive data is not hardcoded
- [ ] PR description explains *what* and *why*

## Project Structure

```
apps/
├── backend/src/
│   ├── auth/          # JWT authentication, guards, strategies
│   ├── rbac/          # Role-based access control
│   ├── users/         # Internal user (team) management
│   ├── customers/     # Customer registration & CRM matching
│   ├── tickets/       # Ticket CRUD, SLA, escalation
│   ├── knowledge-base/# Article versioning, search
│   ├── ai/            # Ollama integration, query handling
│   ├── faq/           # Self-learning FAQ pipeline
│   ├── notifications/ # WebSocket gateway
│   ├── prisma/        # PrismaService wrapper
│   └── main.ts        # App bootstrap
│
├── frontend/src/
│   ├── app/
│   │   ├── (auth)/    # Login, Register pages
│   │   └── (dashboard)/ # Dashboard, Tickets, KB, AI, FAQ, Users, Customers
│   ├── components/
│   │   ├── ui/        # shadcn/ui primitives
│   │   ├── sidebar.tsx
│   │   └── users/     # User-specific components
│   └── lib/
│       ├── api.ts     # API client
│       └── utils.ts   # Utility functions
│
packages/
└── database/
    └── prisma/
        ├── schema.prisma  # Single source of truth for DB
        ├── migrations/    # Version-controlled migrations
        └── seed.ts        # Default data (admin, roles, permissions)
```

## Questions?

Open an issue or reach out to the team. We're happy to help! 🚀
