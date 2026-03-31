# Data quality runbook

Quality gates tracked in sample mode:
- duplicate count
- station match rate
- zone mapping failure rate
- quarantine ratio
- freshness hours

Command:

```powershell
.\.venv\Scripts\python.exe -m etl.jobs.run_quality_gate
```
