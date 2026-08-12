# Re:Lumma

AI-powered career guidance combining MBTI, Human Design, and career psychology.

(Repo/package names still read `character-career-blueprint` / `ccblueprint` in
places — internal identifiers, database names, and API paths were
deliberately left alone during the rebrand to avoid unnecessary churn. Only
user-facing copy was renamed.)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, TailwindCSS |
| Backend | FastAPI, Python 3.11 |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 + Celery |
| AI | Gemini API (provider-agnostic) |
| Email | Resend |
| Proxy | Nginx |
| Container | Docker Compose |

## Getting Started

**Prerequisites:** Docker, Docker Compose, Git

```bash
# 1. Clone the repo
git clone <repo-url> && cd character-career-blueprint

# 2. Set up environment
cp .env.example .env
# Edit .env and fill in POSTGRES_PASSWORD, GEMINI_API_KEY, RESEND_API_KEY, secrets

# 3. Start all services
docker compose up --build

# 4. Open in browser
open http://localhost
```

## Service URLs (Development)

| Service | URL |
|---|---|
| App (via Nginx) | http://localhost |
| Frontend direct | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/api/docs |
| API Health | http://localhost:8000/api/health |

## Common Commands

```bash
# View logs
docker compose logs -f backend
docker compose logs -f worker
docker compose logs -f frontend

# Run DB migrations (Sprint 2+)
docker compose exec backend alembic upgrade head

# Create a new migration (Sprint 2+)
docker compose exec backend alembic revision --autogenerate -m "add submissions table"

# Open a Python shell in the backend container
docker compose exec backend python

# Restart a single service
docker compose restart backend

# Stop everything
docker compose down

# Stop and wipe volumes (WARNING: deletes all DB data)
docker compose down -v
```

## Sprint Status

_Last verified against source 2026-08-12 — see `RELUMMA-HEALTH-REPORT.md` in
the project folder for the full audit this table is based on._

| Sprint | Status | Description |
|---|---|---|
| 0 | ✅ | Architecture |
| 1 | ✅ | Project setup + infrastructure |
| 2 | ✅ | Database + backend foundation |
| 3 | ✅ | Landing page |
| 4 | ✅ | Character creation form |
| 5 | ✅ | AI generation pipeline |
| 6 | ✅ | Email delivery |
| 7 | ✅ | Blueprint report page |
| 8 | ✅ | Admin dashboard |
| 9 | ✅ | Payments (Mayar.id) |
| 10 | ✅ | Production hardening (Docker prod compose, Nginx prod config) |
| 11 | ✅ | Blueprint report page polish + tracker page |
| 12 | ✅ | Landing page cinematic motion redesign |
| 13 | ✅ | Re:Lumma accounts, free Trial Reading, Habit Tracker, funnel inversion |

No sprints are currently incomplete. Open work is tracked as findings in
`RELUMMA-HEALTH-REPORT.md`, not as unfinished sprints — most notably a
critical account/report-linking issue that needs a product decision before
scaling traffic through login/register (see that report's §5 and §7).

## Project Structure

```
character-career-blueprint/
├── docker-compose.yml          # Dev environment
├── docker-compose.prod.yml     # Production overrides
├── .env.example                # Environment template
│
├── backend/
│   ├── app/
│   │   ├── api/routes/         # FastAPI route handlers (health, submissions,
│   │   │                       #   reports, admin, payments, auth, trial,
│   │   │                       #   habits, users)
│   │   ├── ai/                 # Provider-agnostic AI gateway, prompt
│   │   │                       #   builder, knowledge loader, output parser
│   │   │                       #   + providers/ (Gemini)
│   │   ├── core/                # security (JWT/bcrypt), dependencies (auth
│   │   │                       #   guards), habit_templates, trial_reading
│   │   ├── email/               # Resend client + HTML templates
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── services/           # mayar.py — Mayar.id payment gateway client
│   │   ├── tasks/               # Celery tasks (AI generation, email delivery)
│   │   ├── config.py           # Pydantic settings
│   │   ├── database.py         # DB engine + session (API pool + worker NullPool)
│   │   ├── celery_app.py       # Celery configuration
│   │   └── main.py             # FastAPI app entry point
│   ├── alembic/                # DB migrations
│   ├── knowledge/              # MBTI + Human Design static knowledge JSONs
│   ├── scripts/                # seed.py, generate_knowledge.py
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── app/                # Next.js App Router pages — landing, create,
│       │                       #   pricing, login, register, dashboard,
│       │                       #   dashboard/habits, blueprint/[token],
│       │                       #   admin/*
│       ├── components/
│       │   ├── layout/         # PixelLayout, PixelNavbar, PixelFooter
│       │   ├── ui/             # PixelPanel, PixelButton, etc. + ui/motion/
│       │   │                   #   (aurora/cinematic effects)
│       │   ├── auth/           # AuthLayout (glassmorphism auth screens)
│       │   ├── form/            # 5-step CharacterCreationForm + steps
│       │   ├── trial/          # TrialReadingScreen
│       │   ├── dashboard/      # WelcomeCard, BlueprintCard, habit widgets
│       │   ├── habits/          # HabitRow, SimpleProgressBar
│       │   ├── landing/        # Hero, HowItWorks, Pricing, FAQ, etc.
│       │   ├── report/         # BlueprintReport and its sub-sections
│       │   └── admin/          # AdminSidebar, StatusBadge
│       ├── hooks/               # useActiveSection, useCountUp, useMagnetic,
│       │                       #   useMousePosition, usePrefersReducedMotion
│       └── lib/                # api.ts, auth.ts, utils, constants, types,
│                               #   validation, motion.ts, config
│
└── nginx/
    └── nginx.conf
```
