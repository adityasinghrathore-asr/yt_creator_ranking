# CPI Frontend

Next.js frontend for the Creator Partnership Intelligence platform.

## Configuration

All values come from `config.yaml` at the monorepo root, read at build time by `config.ts` → `next.config.ts`. The result is injected as `NEXT_PUBLIC_*` environment variables.

**To change the API URL, image domains, or dwell time:** edit `config.yaml`. Do not edit `next.config.ts` directly.

## Running locally

```bash
# From monorepo root
docker-compose up frontend

# Or without Docker:
cd frontend
npm install
npm run dev
```

App: http://localhost:3000

## Running tests

```bash
cd frontend
npm test
```

## Key files

| File | Purpose |
|---|---|
| `config.ts` | Reads `config.yaml`, exposes typed `frontendConfig` |
| `next.config.ts` | Consumes `frontendConfig`, injects env vars |
| `src/lib/api.ts` | All API calls — no component calls `fetch` directly |
| `src/lib/queryClient.ts` | TanStack Query config with stale times per data type |
| `src/lib/formatters.ts` | Subscriber count, engagement rate, CCMS, tier colours |
| `src/stores/sessionStore.ts` | Zustand store — briefId, confirmed signals, scoring diff, lock state |

## Minimum dwell on confirmation screen

The signal confirmation screen enforces a minimum dwell time before the Confirm button activates. This is intentional — it ensures the marketer has time to read the signal set before proceeding. The duration is set in `config.yaml` under `frontend.confirmation_min_dwell_ms`.

## Component rules

- `RisksBlock` is always rendered on every creator card, regardless of score
- `InferenceBanner` is always rendered — embedded at the point of signal consumption, not as a page-level disclaimer
- `TierBadge` is the single definition of tier colours — never style tiers inline
- `ErrorState` always explains what happened and what to do — never show a generic error message
- `DataUnavailablePlaceholder` always gives a specific reason — never show "data not found"
