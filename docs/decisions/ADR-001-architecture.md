# ADR-001: Codex-first analytical dashboard architecture

## Status
Accepted

## Decision

The project uses:

- Next.js App Router for UI and read APIs
- Python 3.11 for ETL and quality jobs
- Postgres for live storage
- file-backed local/sample mode for deterministic fallback

This project explicitly avoids generic control-plane patterns, multi-agent runtime, and operator-tower UI.

## Consequences

- We must keep contracts and read models explicit.
- We must keep ETL quality gates and known limitations visible.
- We can keep the product useful without live credentials.
