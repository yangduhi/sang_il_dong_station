# Data source validation

## Current state

Live source verification is now **partially completed** in this workspace.

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
- a live Seoul ridership probe can be executed via `scripts/inspect_sources/check_live_sources.py`
- the current live-source summary is stored at `docs/reports/live-source-check-latest.md`

## Latest live check summary

### Seoul daily ridership
- Status: verified
- Source used: `CardSubwayStatsNew`
- Probe date used: `20260327`
- Result: response rows were returned and the 5호선 `상일동` station row was present
- Latest sample record from the probe:
  - `SBWY_ROUT_LN_NM`: `5호선`
  - `SBWY_STNS_NM`: `상일동`
  - `GTON_TNOPE`: `17354`
  - `GTOFF_TNOPE`: `16224`
  - `REG_YMD`: `20260330`

### OD
- Status: not yet verified
- Current blocker: this repository still lacks a confirmed callable station-level OD endpoint implementation for the `DATA_GO_KR_SERVICE_KEY`
- Public STCIS developer docs currently expose a 15-minute **regional** OD endpoint, which is not yet sufficient proof for this project's target station-level OD contract

## Blockers for live completion

- station-level OD endpoint confirmation and implementation
- optional Postgres connection for live-mode integration testing

## Required next step

Extend `scripts/inspect_sources/` so that:
- Seoul hourly or recent-week ridership sources are verified in addition to `CardSubwayStatsNew`
- OD endpoint confirmation is implemented and evidence is captured for the chosen source
