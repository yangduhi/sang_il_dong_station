# AGENTS.md

## Project goal
Build a Codex-first analytical dashboard for Sangil-dong Station with a clear operational contract, deterministic fallback modes, Python 3.11 ETL, Postgres-ready schemas, and a Next.js read surface.

## Working model
This repository is a `data product + analytical dashboard`, not a generic control plane.
Preserve the following boundaries:

- Web UI: Next.js App Router
- Read API: Next.js Route Handlers
- ETL: Python 3.11 CLI jobs
- Storage: Postgres in `postgres/live`, file-backed samples in `local/sample`
- Scheduling: GitHub Actions first, Vercel cron optional

## Single-writer rule
- Treat this repository as single-writer by default.
- Do not introduce multi-agent or multi-writer product architecture.
- Do not silently overwrite schema, mapping, or evidence files.

## Stage gates
1. Operating contract and readiness layer
2. Bootstrap and health surface
3. Data source validation
4. Zone/station normalization
5. DB schema
6. Extract / transform / load
7. Read API
8. Dashboard UI
9. QA / deploy / operations

Do not move to the next gate until the current gate has:
- updated code
- updated docs
- verification output
- open risks listed

## Required outputs per stage
- changed file list
- commands executed
- results and blockers
- known limitations
- next-step readiness

## Hard rules
- Never hardcode secrets.
- Never claim live deployment success without a verified URL.
- Never hide OD grain limitations, freshness issues, or station/zone mapping gaps.
- Never drop unmatched rows without quarantine or evidence.
- Keep ETL idempotent and evidence-backed.
- Keep API responses contract-first with structured `data + meta`.

## Evidence and results
- Evidence is stored separately from user-facing artifacts.
- Raw samples, schema captures, quality reports, run manifests, and health snapshots are evidence.
- README, runbooks, and dashboard copy are results.

## Verification baseline
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pytest`
- `pnpm build`
- `powershell -ExecutionPolicy Bypass -File ./scripts/preflight.ps1`
- `powershell -ExecutionPolicy Bypass -File ./scripts/verify.ps1`

## Python baseline
- Use `.venv` at the repo root.
- Use Python `3.11.x` only.
- Document commands assuming Windows PowerShell first.
