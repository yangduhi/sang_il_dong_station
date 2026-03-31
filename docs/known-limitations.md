# Known limitations

- The verified public OD API is area-based, not station-based. The OD sections therefore describe Sangil-dong living-zone public-transit flow, not station-to-station OD.
- The dashboard combines station-grain ridership and living-zone-grain OD on purpose. Those sections must not be interpreted as the same grain.
- The 15-minute OD batch is quota-aware and optional. If the capture job has not materialized rows yet, the temporal panel stays in the DB-backed empty state.
- Verified OD snapshots are still part of the ETL safety net. They are used during ETL when live OD capture is blocked, but they are no longer a request-time dashboard fallback in Postgres mode.
- Local networks that cannot reach the Supabase direct host over IPv6 need a pooled `DATABASE_URL`. The current workstation cannot reach the direct host from this network.
