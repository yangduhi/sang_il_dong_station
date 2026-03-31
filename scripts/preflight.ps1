$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host "== Preflight =="

if (-not (Test-Path ".venv\Scripts\python.exe")) {
  throw "Python 3.11 virtual environment not found at .venv\Scripts\python.exe"
}

$pythonVersion = & .\.venv\Scripts\python.exe -c "import sys; print('.'.join(map(str, sys.version_info[:3])))"
Write-Host "Python:" $pythonVersion
if (-not $pythonVersion.StartsWith("3.11.")) {
  throw "Python 3.11.x is required."
}

$nodeVersion = node -v
Write-Host "Node:" $nodeVersion

$pnpmVersion = npx pnpm@10.8.1 -v
Write-Host "pnpm:" $pnpmVersion

$requiredPaths = @(
  "AGENTS.md",
  "README.md",
  ".env.example",
  "docs\known-limitations.md",
  "data\raw_samples\ridership\sample-response.json",
  "data\verified_snapshots\origin-to-zone.json",
  "db\migrations\001_init.sql",
  "app\api\health\route.ts"
)

foreach ($path in $requiredPaths) {
  if (-not (Test-Path $path)) {
    throw "Missing required path: $path"
  }
}

Write-Host "Preflight checks passed."
