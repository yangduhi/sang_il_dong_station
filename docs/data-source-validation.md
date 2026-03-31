# Data source validation

## Current source posture

The repository now separates:

- source validation and capture
- ETL materialization
- dashboard reads

This means dashboard requests are no longer the place where OD API instability is absorbed.

## Verified public sources

### Station ridership

- Source: `CardSubwayStatsNew`
- Status: verified
- Use in product: station daily ridership trend for Sangil-dong Station
- Current ETL handling: fetched live during ETL and loaded into `fact_station_daily`

### Area-based OD

- Source: `getDailyODUsageforGeneralBusesandUrbanRailways`
- Status: endpoint verified
- Grain: area-based public-transit OD with 읍면동 fields
- Use in product: Sangil-dong living-zone OD, not station-to-station OD
- Current ETL handling:
  - preferred path: live capture into verified snapshots, then DB load
  - fallback path: use the last verified snapshot already stored under `data/verified_snapshots/`

### OD 15-minute

- Source: `getGeneralBusandUrbanRailwaysODUsageby15MinuteIntervals`
- Status: endpoint verified
- Grain: area-based public-transit OD with 15-minute buckets
- Use in product: optional temporal panel for living-zone OD
- Current ETL handling:
  - capture is optional and quota-aware
  - DB schema exists even when the latest capture produced no rows

## Why the architecture changed

The public OD API can fail for reasons that should not directly affect the UI:

- quota exhaustion
- auth or approval propagation delays
- empty or blocked responses for a given capture window

Because of that, production-safe operation is now:

```text
public source
  -> validation / capture
  -> verified snapshot or raw capture
  -> Postgres load
  -> dashboard read
```

## Current blockers

- station-level OD is still not available through the verified public endpoint
- the current local workstation cannot reach the Supabase direct host over IPv6, so local DB verification needs a pooled `DATABASE_URL`

## Evidence

- latest live probe summary: `docs/reports/live-source-check-latest.json`
- latest ETL materialization summary: `docs/reports/etl-dashboard-load-latest.json`
- verified ETL input snapshots: `data/verified_snapshots/`
