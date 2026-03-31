# DB-first ETL architecture

## Goal

Prevent dashboard instability caused by request-time OD API calls.

The dashboard should read Postgres only. Public APIs are handled by ETL jobs and verified snapshots.

## Minimal schema

### Existing ridership fact

- `fact_station_daily`
  - one row per `service_date x station_id x source_name`

### Living-zone OD daily fact

- `fact_living_zone_od_daily`
  - `service_date`
  - `direction`
  - `focus_ctpv_cd`
  - `focus_sgg_cd`
  - `focus_emd_name`
  - `aggregation_level`
  - `target_zone_id`
  - `target_label`
  - `top_context_label`
  - `passenger_count`
  - `share_pct`
  - `source_name`
  - `is_verified_snapshot`
  - `loaded_at`

This fact now supports both:

- `aggregation_level='zone'`
- `aggregation_level='sgg'`

### Living-zone OD 15-minute fact

- `fact_living_zone_od_15min`
  - `service_date`
  - `direction`
  - `focus_ctpv_cd`
  - `focus_sgg_cd`
  - `focus_emd_name`
  - `aggregation_level`
  - `reference_zone_id`
  - `reference_label`
  - `hour_bucket`
  - `passenger_count`
  - `source_name`
  - `is_verified_snapshot`
  - `loaded_at`

This fact is prepared for both `zone` and `sgg` materialization once the next live refresh succeeds.

### Read views

- `vw_living_zone_od_daily_latest`
- `vw_living_zone_od_15min_latest`

These views prefer fresher non-snapshot rows and keep verified snapshot rows as a DB-side safety net.

## Batch strategy

### Daily batch

Recommended cadence:

- once per day after the public source has refreshed
- materialize station daily ridership
- materialize living-zone OD daily

Recommended flow:

1. Attempt live OD daily capture.
2. If capture succeeds, overwrite `data/verified_snapshots/origin-to-zone.json` and `zone-to-destination.json`.
3. If capture fails, keep the last verified snapshots.
4. Load snapshots plus station daily facts into Postgres.

Why this is safe:

- the UI never waits on the public OD API
- a failed daily capture does not wipe the dashboard
- the latest successful snapshot remains materializable

### 15-minute batch

Do **not** attempt a full all-zones all-hours capture on every run.

Recommended bounded strategy:

- identify top daily zones first
- capture only `top N` zones
- capture only tracked commute hours
  - default: `06,07,08,17,18,19`
- capture quarter buckets within those hours only

This keeps the request volume inside the daily quota envelope.

## Runtime contract

When `APP_DATA_MODE=postgres`:

- `lib/repositories/index.ts` returns `PostgresDashboardRepository`
- request handlers read Postgres only
- runtime does not call `CardSubwayStatsNew` or OD APIs directly

When `APP_DATA_MODE=local`:

- local/sample or live-wrapper development paths remain available

## Operational recommendation

- put the pooled or IPv4-reachable runtime URL in `DATABASE_URL`
- use `DIRECT_DATABASE_URL` only where direct connectivity is known to work
- run `db:migrate`, `db:seed`, `etl:dashboard` before switching production to `APP_DATA_MODE=postgres`

## Current state

- schema: implemented
- ETL loader: implemented
- Postgres repository queries: implemented
- runtime direct OD fetch in postgres mode: removed
- local DB verification: blocked by current workstation DB connectivity
