# Creator Partnership Intelligence (CPI)

A decision-support tool that takes a campaign brief, evaluates a pool of YouTube creators against it, and returns a ranked shortlist with every recommendation explained and every inference labeled.

---

## Quick Start

```bash
# 1. Clone the repo
git clone <repo-url>
cd youtubecreator

# 2. Configure — one file, everything lives here
#    Set your data_mode, API keys, DB credentials, etc.
nano config.yaml

# 3. Run locally
docker-compose up
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1
- API docs: http://localhost:8000/docs

---

## Configuration

**Everything is in `config.yaml` at the monorepo root.** No other config files need to be edited.

| Section | What it controls |
|---|---|
| `data_mode` | `synthetic` (no live APIs), `hybrid` (Anthropic + synthetic data), `live` (all APIs) |
| `api_keys` | Anthropic, YouTube, HypeAuditor, Perspective, Jira |
| `scoring.dimension_weights` | CCMS weights per campaign objective |
| `scoring.tiers` | Platinum/Gold/Silver/Bronze CCMS thresholds |
| `brand_safety.sensitivity_levels` | Toxicity hard-block and soft-flag thresholds |
| `llm` | Model version, temperatures, word limits |
| `infrastructure` | DB host/port/name, Redis, backend port, frontend port |
| `export.jira_priority` | Campaign urgency thresholds in days |

For production, override sensitive values via environment variables — `DATABASE_URL`, `REDIS_URL`, `ANTHROPIC_API_KEY`, `YOUTUBE_API_KEY`, `PERSPECTIVE_API_KEY`. The backend's `config.py` checks env vars before falling back to `config.yaml`.

---

## Project Structure

```
/
├── config.yaml              ← single source of truth for all config
├── docker-compose.yml
├── README.md
├── shared/
│   ├── openapi.json         ← auto-generated from backend
│   └── generated-types.ts  ← auto-generated TypeScript types
├── backend/
│   ├── app/
│   │   ├── config.py        ← reads config.yaml, exposes typed `settings`
│   │   ├── main.py
│   │   ├── api/v1/          ← brief, creators, scoring, validation, export
│   │   ├── models/          ← SQLAlchemy ORM models
│   │   ├── schemas/         ← Pydantic v2 request/response schemas
│   │   ├── services/        ← business logic
│   │   ├── clients/         ← external API adapters
│   │   ├── data/synthetic/  ← place creators.json here
│   │   └── workers/         ← Celery background tasks
│   └── migrations/
└── frontend/
    ├── config.ts            ← reads config.yaml for Next.js build
    ├── next.config.ts
    └── src/
        ├── pages/
        ├── components/
        ├── hooks/
        ├── stores/
        └── lib/
```

---

## Adding Synthetic Creators

Put a `creators.json` file in `backend/app/data/synthetic/`. See `backend/app/data/synthetic/README.md` for the schema.

---

## Running Tests

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test
```

---

## Deployment

- Backend → Google Cloud Run (see `.github/workflows/backend-deploy.yml`)
- Frontend → Google Cloud Storage + CDN (see `.github/workflows/frontend-deploy.yml`)
- Both pipelines gate on tests passing (see `.github/workflows/test.yml`)
