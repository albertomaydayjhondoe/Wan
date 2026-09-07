# AGENTS.md

## Repository context

- `repo.md` (`.openhands/microagents/repo.md`) referenced by the user does **not** exist anywhere in this repository, git history, GitHub, or the filesystem. Sprint instructions reference it for the exact schema/seed data; a plausible 13-model AI chat app schema was used instead: User, Account, Session, VerificationToken, Chatbot, Conversation, Message, Document, DocumentChunk, PromptTemplate, Tool, ApiKey, UsageRecord.

## Commands

- Sprints are executed per the user's Spanish instructions: scaffold (sprint-1), schema+seed+CI (sprint-2), etc. Commits follow conventional format, e.g. `chore(sprint-1): scaffold + CI`, `feat(sprint--2): ...`.
- CI: `.github/workflows/ci.yml` — two jobs: `build` (npm ci/install, prisma generate, tsc --noEmit, build) and `seed` (pgvector/pgvector:pg16 service + healthcheck, init-db.sql, prisma db push, `npx tsx prisma/seed.ts`, build).

## Key learnings

- `Unsupported("vector")` columns make a model "raw" — it has no generated CRUD delegates (no createMany/create*). Insertvia `prisma.$executeRaw`.
- pgvector rejects `'[]'::vector` — a vector needs at least 1 dimension; use `'[0.0]'::vector` as a placeholder.

- GitHub Actions runners need `sudo apt-get install -y postgresql-client` before using `psql`.
- A seed script should start by deleting prior rows (in FK order) to stay idempotent.

- Node 20 is deprecated on GH Action runners (they force Node 24 for the checkout/setup-node actions, but `node-version: 20` still installs Node 20; warning isso innocuous).