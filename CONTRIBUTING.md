# Contributing to ARefriz

## Branching Strategy

We use a **three-tier branch model** with batched releases:

```
feat/my-feature  ──PR──▶  staging  ──Batch Release PR──▶  main (Production)
fix/bug-name     ──PR──▶  staging  ──Batch Release PR──▶  main (Production)
```

### Branch Roles

| Branch | Purpose | Deploys To | Protected |
|--------|---------|------------|-----------|
| `main` | Production-ready code. Only receives batched releases from `staging`. | Production (`arefriz.com`) | ✅ Yes |
| `staging` | Integration & QA. All features and fixes merge here first. | Staging (`staging.arefriz.com`) | ✅ Yes |
| `feat/*` | New feature development. Short-lived. | — | ❌ No |
| `fix/*` | Bug fixes. Short-lived. | — | ❌ No |

### Workflow

#### 1. Start a Feature or Fix

```bash
# Always branch from the latest staging
git checkout staging
git pull origin staging
git checkout -b feat/your-feature-name
# or
git checkout -b fix/your-bug-name
```

#### 2. Develop & Commit

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(cart): add quantity increment/decrement buttons
fix(checkout): recalculate total server-side to prevent price manipulation
chore(deps): bump prisma to 6.x
refactor(auth): extract JWT validation to shared middleware
```

#### 3. Open a Pull Request → `staging`

```bash
git push origin feat/your-feature-name
# Open PR on GitHub: feat/your-feature-name → staging
```

**PR Requirements (all must pass before merge):**
- ✅ CI pipeline passes (lint, typecheck, tests)
- ✅ GitHub Copilot automated review completes
- ✅ At least 1 human reviewer approves
- ✅ No merge conflicts

#### 4. Merge to Staging

After PR approval, **squash-merge** into `staging`. The staging environment auto-deploys.

#### 5. Batch Release to Production

When 2–3 features/fixes are verified on staging:

```bash
# Create a release PR: staging → main
# Title: "Release v2.1.0 — [Summary of changes]"
# Body: Consolidated changelog of all merged PRs
```

After the batch release PR is approved and merged:
- Production auto-deploys
- A version tag is created (`v2.1.0`)

---

## Development Setup

### Prerequisites

- **Node.js 20+** (LTS)
- **Docker Desktop** (for PostgreSQL + Redis)
- **Git**

### Quick Start

```bash
# 1. Clone and switch to staging
git clone https://github.com/Akwardhan/arefriz.git
cd arefriz
git checkout staging

# 2. Start infrastructure
docker compose up -d postgres redis

# 3. Setup backend
cd backend
cp .env.example .env          # Edit with your local values
npm install
npx prisma migrate dev        # Apply database migrations
npx prisma db seed            # Seed test data
npm run dev

# 4. Setup frontend (new terminal)
cd frontend
cp .env.example .env.local    # Edit with your local values
npm install
npm run dev
```

### Environment Variables

See `backend/.env.example` and `frontend/.env.example` for required values.

**Never commit `.env` files.** The `.gitignore` is configured to exclude them.

---

## Code Quality Standards

### Backend (Express API)

- **Zod validation** on every route handler input (`req.body`, `req.params`, `req.query`)
- **Prisma ORM** for all database access (no raw SQL unless necessary)
- **Error handling**: All controllers wrapped in try/catch → centralized error middleware
- **No `console.log` in production code** — use structured logging

### Frontend (Next.js)

- **TypeScript** strict mode — no `any` types
- **Environment variables** via `NEXT_PUBLIC_*` prefix only for client-side values
- **No hardcoded API URLs** — always use `process.env.NEXT_PUBLIC_API_URL`

---

## CI/CD Pipeline

The GitHub Actions pipeline (`.github/workflows/ci.yml`) runs automatically:

```
PR opened/updated → Lint → Typecheck → Test → Copilot Review → Human Review → Merge
```

| Check | What it does |
|-------|-------------|
| `npm run lint` | ESLint for both frontend and backend |
| `tsc --noEmit` | TypeScript compilation check |
| `npm test` | Vitest/Jest test suites (with Postgres + Redis service containers) |
| Copilot Review | Automated security and quality review |
| `npm run build` | Next.js production build verification |

---

## Branch Protection Rules (GitHub Settings)

These must be configured in **GitHub → Repository Settings → Branches**:

### `main` branch protection:
- ✅ Require pull request reviews before merging (1 approval minimum)
- ✅ Require status checks to pass (required: `validate`)
- ✅ Require conversation resolution before merging
- ✅ Require linear history (squash merge only)
- ✅ Do not allow bypassing the above settings
- ✅ Restrict who can push (only via approved PR from `staging`)

### `staging` branch protection:
- ✅ Require pull request reviews before merging (1 approval minimum)
- ✅ Require status checks to pass (required: `validate`)
- ✅ Require conversation resolution before merging
- ❌ Linear history not required (allow merge commits for feature branches)

### Enable GitHub Copilot PR Reviews:
1. Go to **Repository Settings → Copilot → Pull request reviews**
2. Enable **"Copilot code review"** for the repository
3. Copilot will automatically review all PRs and leave suggestions
