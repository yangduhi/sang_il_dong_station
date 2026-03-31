This directory stores verified raw snapshots that ETL can materialize into Postgres
when public APIs are temporarily unavailable or quota-limited.

Files in this directory are evidence artifacts, not runtime application state.

- `origin-to-zone.json`: verified Sangil living-zone outbound OD snapshot
- `zone-to-destination.json`: verified Sangil living-zone inbound OD snapshot
- `living-zone-15min.json`: optional 15-minute OD snapshot capture when available
