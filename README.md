# Character Career Blueprint

AI-powered career guidance combining MBTI, Human Design, and career psychology.

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

| Sprint | Status | Description |
|---|---|---|
| 0 | ✅ | Architecture |
| 1 | ✅ | Project setup + infrastructure |
| 2 | ⏳ | Database + Backend foundation |
| 3 | ⏳ | Landing page |
| 4 | ⏳ | Character creation form |
| 5 | ⏳ | AI generation pipeline |
| 6 | ⏳ | Email delivery |
| 7 | ⏳ | Blueprint report page |
| 8 | ⏳ | Admin dashboard |
| 9 | ⏳ | Integration testing |
| 10 | ⏳ | Production hardening |

## Project Structure

```
character-career-blueprint/
├── docker-compose.yml          # Dev environment
├── docker-compose.prod.yml     # Production overrides
├── .env.example                # Environment template
│
├── backend/
│   ├── app/
│   │   ├── api/routes/         # FastAPI route handlers
│   │   ├── models/             # SQLAlchemy models (Sprint 2)
│   │   ├── tasks/              # Celery tasks (Sprint 5)
│   │   ├── config.py           # Pydantic settings
│   │   ├── database.py         # DB engine + session
│   │   ├── celery_app.py       # Celery configuration
│   │   └── main.py             # FastAPI app entry point
│   ├── alembic/                # DB migrations
│   ├── knowledge/              # AI knowledge base JSONs (Sprint 5)
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── app/                # Next.js App Router pages
│       ├── components/
│       │   ├── layout/         # PixelLayout, Navbar, Footer
│       │   └── ui/             # PixelPanel, PixelButton, etc.
│       └── lib/                # utils, constants, types, config
│
└── nginx/
    └── nginx.conf
```
