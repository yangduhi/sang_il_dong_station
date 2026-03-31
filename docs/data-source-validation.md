# Data source validation

## Current state

Live source verification is **scaffolded but not completed** in this workspace because no external service keys were provided.

The repository currently operates in:

- `APP_DATA_MODE=local`
- `APP_SOURCE_MODE=sample`

## Candidate sources

### Ridership
- Seoul daily ridership API / file sources
- Seoul hourly ridership API / file sources
- Seoul Metro type / transfer file sources

### OD
- MOLIT / public transport OD API
- STCIS OD export workflow

### Station metadata
- national urban rail station metadata
- Seoul Metro station coordinate data

## Verified in this repository

- sample fixtures exist under `data/raw_samples/`
- local/sample-mode ETL can transform those fixtures into processed artifacts
- API/UI contracts expose `grainLabel`, `sourceNames`, `lastLoadedAt`, and `limitations`

## Blockers for live completion

- `SEOUL_OPEN_DATA_API_KEY`
- `DATA_GO_KR_SERVICE_KEY`
- optional Postgres connection for live-mode integration testing

## Required next step

Implement live source inspection scripts under `scripts/inspect_sources/` and store captured responses as evidence.
