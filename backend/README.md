# CPI Backend

FastAPI backend for the Creator Partnership Intelligence platform.

## Configuration

All settings come from `config.yaml` at the monorepo root. The backend reads it at startup via `app/config.py`. If any required field is missing or invalid, the application refuses to start.

**Never hardcode values.** Use `from app.config import settings` and access `settings.<section>.<field>`.

## Running locally

```bash
# From the monorepo root
docker-compose up backend db redis

# Or without Docker:
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Running tests

```bash
cd backend
pytest
```

## Data modes

Set `data_mode` in `config.yaml`:

- `synthetic` — reads creator data from `app/data/synthetic/creators.json`. No external API calls. Fastest for local development.
- `hybrid` — uses the real Anthropic API for LLM calls; all YouTube/HypeAuditor data is still synthetic.
- `live` — all external APIs active. Requires API keys in `config.yaml` or as environment variables.

## Adding synthetic creator data

Place `creators.json` in `app/data/synthetic/`. See `app/data/synthetic/README.md` for the schema.

## Key architectural rules

- All config is read from `settings` — no hardcoded strings for URLs, thresholds, or model names
- Services receive a `db` session via dependency injection — they never create their own connections
- External APIs are wrapped in adapter clients — swapping a provider requires only changes to the relevant `clients/` file
- Hard overrides (human score adjustments) are appended to the score record, never replacing the original AI score
- Brand safety hard blocks write to an immutable blocked channels registry and cannot be reversed via the UI
