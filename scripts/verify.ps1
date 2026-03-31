$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host "== Verify =="
.\scripts\preflight.ps1
npx pnpm@10.8.1 lint
npx pnpm@10.8.1 typecheck
npx pnpm@10.8.1 test
.\.venv\Scripts\python.exe -m pytest
npx pnpm@10.8.1 build
.\.venv\Scripts\python.exe -m etl.jobs.run_sample_pipeline
.\.venv\Scripts\python.exe -m etl.jobs.run_quality_gate
npx pnpm@10.8.1 test:e2e
Write-Host "Verification complete."
