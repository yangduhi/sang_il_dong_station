$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function Invoke-OptionalCommand {
  param(
    [string]$Label,
    [string]$Command
  )

  Write-Host "== $Label =="
  & powershell -NoProfile -Command $Command
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "$Label skipped or failed in the current environment."
  }
}

Write-Host "== Verify =="
.\scripts\preflight.ps1
npx pnpm@10.8.1 lint
npx pnpm@10.8.1 typecheck
npx pnpm@10.8.1 test
.\.venv\Scripts\python.exe -m pytest
Invoke-OptionalCommand "DB migrate" "npx pnpm@10.8.1 db:migrate"
Invoke-OptionalCommand "DB seed" "npx pnpm@10.8.1 db:seed"
Invoke-OptionalCommand "DB ETL" ".\\.venv\\Scripts\\python.exe -m etl.jobs.load_dashboard_postgres"
npx pnpm@10.8.1 build
.\.venv\Scripts\python.exe -m etl.jobs.run_sample_pipeline
.\.venv\Scripts\python.exe -m etl.jobs.run_quality_gate
npx pnpm@10.8.1 test:e2e
Write-Host "Verification complete."
