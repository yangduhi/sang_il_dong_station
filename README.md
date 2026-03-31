# Sangil-dong Station Dashboard

Codex-first analytical dashboard for Sangil-dong with:

- a Next.js map-first dashboard and read APIs
- Python 3.11 ETL jobs
- Postgres materialization for station ridership and living-zone OD
- deterministic local/sample fallback
- evidence, manifests, and quality reports under `runtime/` and `docs/reports/`

## Operating model

The repository now supports two distinct runtime paths:

- `APP_DATA_MODE=local`
  Uses curated sample fixtures or live wrappers for development.
- `APP_DATA_MODE=postgres`
  Reads **only** materialized Postgres facts. In this mode the dashboard does not call the OD API at request time.

This separation is deliberate. The public OD API is quota-limited and sometimes unstable, so the production-safe path is:

```text
OD API / verified snapshot
  -> capture step
  -> ETL materialization
  -> Postgres facts / views
  -> dashboard read APIs
  -> UI
```

## Data interpretation

The product intentionally combines two different public-data grains:

- station-level Sangil-dong Station ridership trend
- living-zone public-transit OD centered on Sangil-dong area

That means the ridership section is station-grain and the OD section is living-zone-grain.

## Environment variables

Copy `.env.example` to `.env.local`.

Important DB guidance:

- `DATABASE_URL`
  Preferred runtime connection string. Use an IPv4-reachable pooled URL when available.
- `DIRECT_DATABASE_URL`
  Optional direct admin connection for environments that can reach the direct host.

If you use Supabase and the direct host is IPv6-only from your network, keep the pooled URL in `DATABASE_URL` and reserve the direct URL for environments that can reach IPv6.

## Quick start

### 1. Create the Python 3.11 virtual environment

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -e .[dev]
```

### 2. Install JavaScript dependencies

```powershell
npx pnpm@10.8.1 install
```

### 3. Copy environment variables

```powershell
Copy-Item .env.example .env.local
```

### 4. Start the app

```powershell
npx pnpm@10.8.1 dev
```

Open [http://localhost:3000](http://localhost:3000).

## DB-first workflow

### Prepare schema and seeds

```powershell
npx pnpm@10.8.1 db:migrate
npx pnpm@10.8.1 db:seed
```

### Materialize dashboard facts

Default load:

```powershell
npx pnpm@10.8.1 etl:dashboard
```

Attempt a fresh OD capture before loading:

```powershell
.\.venv\Scripts\python.exe -m etl.jobs.load_dashboard_postgres --refresh-live-od
```

Attempt both daily and 15-minute OD capture:

```powershell
.\.venv\Scripts\python.exe -m etl.jobs.load_dashboard_postgres --refresh-live-od --refresh-live-15min --top-n 4 --hours 6,7,8,17,18,19
```

In `postgres` mode, the dashboard reads only:

- `fact_station_daily`
- `vw_living_zone_od_daily_latest`
- `vw_living_zone_od_15min_latest`

## Verification commands

```powershell
npx pnpm@10.8.1 lint
npx pnpm@10.8.1 typecheck
npx pnpm@10.8.1 test
.\.venv\Scripts\python.exe -m pytest
powershell -ExecutionPolicy Bypass -File .\scripts\preflight.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\verify.ps1
```

## What changed to avoid runtime API failures

- Postgres mode no longer wraps request-time live OD fetches.
- OD capture and dashboard serving are separated.
- Verified snapshots live in `data/verified_snapshots/` as ETL evidence, not runtime UI state.
- Views prefer fresher non-snapshot rows but keep verified snapshot rows available when the public API is blocked.
- 15-minute OD capture is optional and quota-aware instead of being attempted on every request.

## Repository structure

```text
app/                    Next.js app router and APIs
components/             dashboard components
lib/                    config, schemas, repositories, queries, ops
etl/                    Python extract / transform / load / jobs / contracts
db/                     SQL migrations, views, seeds
docs/                   contracts, runbooks, source validation, reports
plans/                  stage plan and report templates
scripts/                preflight, verify, db helpers, source inspection
data/                   fixtures, verified snapshots, raw sample inputs
runtime/                local task/run/event/evidence store
work_instruction/       source specification package, reference only
```

## Current status

- map-first dashboard: implemented
- local/sample fallback: implemented
- DB-first ETL path: implemented
- Postgres repository queries: implemented
- station ridership live verification: completed
- living-zone OD endpoint verification: completed
- request-time OD API dependency in postgres mode: removed
- local DB connectivity: depends on a working `DATABASE_URL` / pooler URL in the current network

## More detail

- [`docs/data-source-validation.md`](./docs/data-source-validation.md)
- [`docs/db-first-etl-architecture.md`](./docs/db-first-etl-architecture.md)
- [`docs/dashboard-ui-thesis.md`](./docs/dashboard-ui-thesis.md)
- [`docs/runbooks/next-day-sgg-refresh.md`](./docs/runbooks/next-day-sgg-refresh.md)
- [`docs/known-limitations.md`](./docs/known-limitations.md)
