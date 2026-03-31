# ETL runbook

## Local/sample pipeline

```powershell
.\.venv\Scripts\python.exe -m etl.jobs.run_sample_pipeline
.\.venv\Scripts\python.exe -m etl.jobs.run_quality_gate
```

## Expected artifacts
- `data/processed/local-dashboard.json`
- `runtime/tasks/*.json`
- `runtime/runs/*.json`
- `runtime/events/*.json`
- `runtime/evidence/*.json`
- `docs/reports/etl-quality-latest.json`
