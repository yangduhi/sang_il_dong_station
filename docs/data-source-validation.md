# Data source validation

## Current state

Live source verification is now **materially completed for the currently reachable public APIs** in this workspace.

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
- Status: endpoint verified, station-level contract not available
- Source used: `getDailyODUsageforGeneralBusesandUrbanRailways`
- Example query used:
  - `opr_ymd=20250301`
  - `dptre_ctpv_cd=11`
  - `dptre_sgg_cd=11740`
  - `arvl_ctpv_cd=11`
  - `arvl_sgg_cd=11680`
- Result: endpoint responded successfully and returned OD rows with `시도/시군구` filters and `읍면동` response fields
- Important limitation: this public API is **not station-level OD**. It is an area-based OD dataset, so it cannot directly answer “상일동역에서 어디로 갔는가” without additional mapping or a different source

## Blockers for full live completion

- station-level OD source confirmation and implementation
- optional Postgres connection for live-mode integration testing

## Required next step

Extend `scripts/inspect_sources/` so that:
- Seoul hourly or recent-week ridership sources are verified in addition to `CardSubwayStatsNew`
- station-level OD alternatives are evaluated against the currently verified area-based OD endpoint
