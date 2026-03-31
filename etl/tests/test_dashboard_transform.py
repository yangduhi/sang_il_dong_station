from __future__ import annotations

from etl.extract.dashboard_sources import load_verified_snapshot
from etl.transform.dashboard_transform import (
    build_living_zone_od_15min_fact_rows,
    build_living_zone_od_daily_fact_rows,
)


def test_build_daily_od_rows_from_verified_snapshots() -> None:
    outbound = load_verified_snapshot("origin-to-zone.json")
    inbound = load_verified_snapshot("zone-to-destination.json")

    outbound_rows = build_living_zone_od_daily_fact_rows(outbound, "outbound")
    inbound_rows = build_living_zone_od_daily_fact_rows(inbound, "inbound")

    assert outbound_rows
    assert inbound_rows
    assert all(row["target_zone_id"] for row in outbound_rows)
    assert outbound_rows[0]["aggregation_level"] == "zone"
    assert inbound_rows[0]["direction"] == "inbound"


def test_build_empty_15min_rows_from_seed_snapshot() -> None:
    fifteen = load_verified_snapshot("living-zone-15min.json")
    rows = build_living_zone_od_15min_fact_rows(fifteen)

    assert rows == []
