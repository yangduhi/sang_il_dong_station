# Sangil-dong Station Dashboard

Codex-first analytical dashboard for Sangil-dong Station (`상일동역`) with:

- a Next.js dashboard and read APIs
- Python 3.11 ETL scaffolding
- Postgres-ready schemas and migrations
- deterministic `local/sample` fallback mode
- structured contracts, evidence, and quality gates

## Architecture

This repository is intentionally **not** a generic control plane. The target shape is:

```text
User
  -> Next.js dashboard
  -> Next.js read API
  -> query/read model layer
  -> Postgres or local sample repository
  -> Python ETL / quality gate / evidence
```

### Default modes

- `APP_DATA_MODE=local`
- `APP_SOURCE_MODE=sample`

Those defaults keep the app usable even when no database, API keys, or live transport feeds are available.

## Quick start

### 1. Create the Python 3.11 virtual environment

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -e .[dev]
```

### 2. Install JavaScript dependencies

If `pnpm` is not globally installed, use `npx pnpm@10.8.1`.

```powershell
npx pnpm@10.8.1 install
```

### 3. Copy environment variables

```powershell
Copy-Item .env.example .env.local
```

### 4. Run the app

```powershell
npx pnpm@10.8.1 dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification commands

```powershell
npx pnpm@10.8.1 lint
npx pnpm@10.8.1 typecheck
npx pnpm@10.8.1 test
pytest
npx pnpm@10.8.1 build
powershell -ExecutionPolicy Bypass -File .\scripts\preflight.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\verify.ps1
```

## Development flow

1. Start from the operating contract in [`AGENTS.md`](./AGENTS.md).
2. Write or update the stage plan under [`plans/`](./plans).
3. Keep contracts in [`lib/schemas`](./lib/schemas) and [`docs/contracts`](./docs/contracts).
4. Keep evidence in [`runtime/`](./runtime) and report artifacts in [`docs/reports/`](./docs/reports).
5. Do not promote live-mode assumptions without documented evidence in [`docs/data-source-validation.md`](./docs/data-source-validation.md).

## Operating principles

- Responses are `data + meta`, not loose text blobs.
- Known limitations are surfaced in both API and UI.
- ETL failures produce evidence and quarantine records.
- Local/sample mode should keep health checks, API smoke tests, and the dashboard functional.

## Repository structure

```text
app/                    Next.js app router and APIs
components/             dashboard components
lib/                    config, schemas, repositories, queries, ops
etl/                    Python extract / transform / load / jobs / contracts
db/                     SQL migrations, views, seeds
docs/                   contracts, ADRs, runbooks, limitations, reports
plans/                  stage plan and report templates
scripts/                preflight, verify, db helpers, source inspection
data/                   sample, raw sample, and processed fixtures
runtime/                local task/run/event/evidence store
work_instruction/       source specification package, kept as reference only
```

## Current status

- Codex-first operating layer: in place
- Bootstrap app: in place
- Local/sample-mode dashboard: in place
- Live data validation: scaffolded, pending credentials and live calls
- Postgres/live mode: schema and repository scaffolding in place
- Vercel deployment: deploy-ready docs only

## Known limitations

See [`docs/known-limitations.md`](./docs/known-limitations.md). The short version:

- live OD verification is blocked until external service keys are provided
- local/sample mode uses curated sample data
- Postgres workflows are ready but not exercised in this workspace
