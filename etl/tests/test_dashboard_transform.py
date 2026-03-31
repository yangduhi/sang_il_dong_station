from __future__ import annotations

from etl.extract.dashboard_sources import load_verified_snapshot
from etl.transform.dashboard_transform import (
    build_living_zone_od_15min_fact_rows,
    build_living_zone_od_15min_fact_rows_from_materialization,
    build_living_zone_od_daily_fact_rows,
    build_living_zone_od_daily_fact_rows_from_materialization,
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


def test_build_fact_rows_from_materialization_payloads() -> None:
    payload = {
        "capturedAt": "2026-03-31T00:00:00+09:00",
        "serviceDate": "2025-03-01",
        "sourceName": "test-source",
        "focusArea": {"ctpvCd": "11", "sggCd": "11740", "emdName": "상일동"},
        "dailyRows": [
            {
                "direction": "outbound",
                "aggregationLevel": "sgg",
                "targetZoneId": "seoul-gangnam",
                "targetLabel": "강남구",
                "targetCtpvCd": "11",
                "targetSggCd": "11680",
                "topContextLabel": "강남구 역삼동",
                "passengerCount": 100,
                "sharePct": 20.0,
            },
            {
                "direction": "outbound",
                "aggregationLevel": "zone",
                "targetZoneId": "seoul-gangnam",
                "targetLabel": "강남·서초",
                "targetCtpvCd": "11",
                "targetSggCd": "11680",
                "topContextLabel": "강남구 역삼동",
                "passengerCount": 150,
                "sharePct": 30.0,
            },
        ],
        "rows": [
            {
                "direction": "outbound",
                "aggregationLevel": "sgg",
                "referenceZoneId": "seoul-gangnam",
                "referenceSggCd": "11680",
                "referenceLabel": "강남구",
                "hourBucket": "07:00",
                "passengerCount": 12,
            }
        ],
        "fallbackUsed": False,
    }

    daily_rows = build_living_zone_od_daily_fact_rows_from_materialization(payload)
    hourly_rows = build_living_zone_od_15min_fact_rows_from_materialization(payload)

    assert len(daily_rows) == 2
    assert any(row["aggregation_level"] == "sgg" for row in daily_rows)
    assert hourly_rows[0]["reference_sgg_cd"] == "11680"
