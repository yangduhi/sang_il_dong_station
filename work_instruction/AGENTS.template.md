# AGENTS.md 템플릿

## Project goal
Build a production-ready dashboard for Sangil-dong Station ridership and OD analysis with Python ETL, Postgres, Next.js, and Vercel deployment readiness.

## Mandatory workflow
1. Read the staged work instruction files in order.
2. Validate data sources before fixing the ETL/data model.
3. Keep each stage independently verifiable.
4. Update code, tests, and docs together.
5. Report what was executed and what remains after each stage.

## Rules
- Never hardcode secrets.
- Never claim deployment success without a verified URL.
- Never hide data grain limitations.
- Never silently drop unmatched stations or invalid rows.
- Keep ETL idempotent.
- Use migrations for schema changes.
- Preserve source lineage and load metadata.

## Hard gates
- Do not proceed past data modeling until source validation is documented.
- Do not load facts until station and zone dimensions are ready.
- Do not mark the project done without health checks, tests, and runbooks.

## Commands
- Web dev: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Unit test: `pnpm test`
- E2E: `pnpm playwright test`
- Pytest: `pytest`
- ETL health: `python -m etl.jobs.healthcheck`

## Done when
- Data source validation doc exists
- Zone/station normalization docs exist
- DB migrations apply cleanly
- Sample ETL run succeeds
- Dashboard loads real data
- Tests pass
- Deployment is verified or blockers are documented
- Runbooks are complete
