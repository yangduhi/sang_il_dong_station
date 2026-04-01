# Next-day SGG refresh runbook

## Goal

When the public OD API quota resets, refresh the dashboard so that:

- `zone` rows are updated from fresh live OD
- `sgg` rows are materialized for the first time
- optional `15-minute` rows are captured for both zone and sgg

## Preconditions

- `DATABASE_URL` points to the working session pooler URI
- `APP_DATA_MODE=postgres`
- `DATA_GO_KR_SERVICE_KEY` is valid and daily quota has reset

## Step 1. Migrate and seed

```powershell
npx pnpm@10.8.1 db:migrate
npx pnpm@10.8.1 db:seed
```

## Step 2. Refresh daily OD for both zone and sgg

```powershell
.\.venv\Scripts\python.exe -m etl.jobs.load_dashboard_postgres --refresh-live-od
```

Expected result:

- updates `origin-to-zone.json` and `zone-to-destination.json`
- writes `living-zone-od-materialization.json`
- loads `aggregation_level='zone'` rows
- loads `aggregation_level='sgg'` rows

## Step 3. Refresh 15-minute OD for both zone and sgg

```powershell
.\.venv\Scripts\python.exe -m etl.jobs.load_dashboard_postgres --refresh-live-od --refresh-live-15min --top-n 2 --hours 7,8,18,19
```

Expected result:

- writes `living-zone-15min-materialization.json`
- loads `aggregation_level='zone'` 15-minute rows
- loads `aggregation_level='sgg'` 15-minute rows
- capture scope is bounded by top `sgg` targets, and zone rows are rolled up from the same captured set

If that succeeds and quota still remains, expand in a second pass:

```powershell
.\.venv\Scripts\python.exe -m etl.jobs.load_dashboard_postgres --refresh-live-15min --top-n 4 --hours 6,7,8,17,18,19
```

## Step 4. Validate row counts

Check these endpoints:

- `/api/quality/summary`
- `/api/od/origin-to-zone?aggregationLevel=sgg`
- `/api/od/zone-to-destination?aggregationLevel=sgg`
- `/api/stations/sangil-5-551/hourly?aggregationLevel=sgg`

What should change:

- `OD sgg rows` > `0`
- `15min sgg rows` > `0` if the 15-minute capture succeeded
- `grainLabel` should show `living_zone_od_daily:sgg` on OD endpoints

## Step 5. UI follow-up

Once SGG rows are present, the next UI step is:

- add a visible `권역 / 구·시` toggle
- default map stays `권역`
- `구·시` uses the same component path with dynamic fallback positions

## Failure handling

If `--refresh-live-od` fails:

- keep the currently materialized zone rows
- do not promote empty sgg views
- use `docs/reports/etl-dashboard-load-latest.json` for the blocked reason
