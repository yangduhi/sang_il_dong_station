# Rollback runbook

- For local/sample mode, restore the last committed fixture set and rerun `etl.jobs.run_sample_pipeline`.
- For Postgres/live mode, reapply the previous migration set and reseed dimensions before resuming ETL.
- Preserve evidence files in `runtime/` before deleting or regenerating processed data.
