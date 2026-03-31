from __future__ import annotations

import csv
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any

from etl.config import get_settings


def load_zone_lookup() -> tuple[dict[str, str], dict[str, str]]:
    settings = get_settings()
    path = settings.repo_root / "db" / "seeds" / "zone_mapping.csv"
    by_name: dict[str, str] = {}
    by_id: dict[str, str] = {}

    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            zone_id = row["zone_id"]
            zone_name = row["zone_name"]
            by_name[zone_name] = zone_id
            by_id[zone_id] = zone_name

    return by_name, by_id


def _normalize_loaded_at(raw_value: str | None, fallback_date: str) -> str:
    candidate = raw_value or fallback_date
    if len(candidate) == 8 and candidate.isdigit():
        return f"{candidate[:4]}-{candidate[4:6]}-{candidate[6:8]}T00:00:00+09:00"
    if len(candidate) == 10 and candidate[4] == "-" and candidate[7] == "-":
        return f"{candidate}T00:00:00+09:00"
    try:
        datetime.fromisoformat(candidate.replace("Z", "+00:00"))
        return candidate
    except ValueError:
        return f"{fallback_date}T00:00:00+09:00"


def build_station_daily_fact_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "service_date": row["service_date"],
            "station_id": row["station_id"],
            "ride_count": int(row["ride_count"]),
            "alight_count": int(row["alight_count"]),
            "total_count": int(row["total_count"]),
            "source_name": row["source_name"],
            "loaded_at": _normalize_loaded_at(row.get("loaded_at"), row["service_date"]),
        }
        for row in rows
    ]


def build_living_zone_od_daily_fact_rows(snapshot: dict[str, Any], direction: str) -> list[dict[str, Any]]:
    zone_lookup, _ = load_zone_lookup()
    data = snapshot["data"]
    meta = snapshot["meta"]
    service_date = data["dateRange"]["to"]

    return [
        {
            "service_date": service_date,
            "direction": direction,
            "focus_ctpv_cd": "11",
            "focus_sgg_cd": "11740",
            "focus_emd_name": "상일동",
            "aggregation_level": "zone",
            "target_zone_id": zone_lookup.get(row["zoneName"]),
            "target_label": row["zoneName"],
            "target_ctpv_cd": None,
            "target_sgg_cd": None,
            "top_context_label": row["topContextLabel"],
            "passenger_count": int(row["passengerCount"]),
            "share_pct": float(row["sharePct"]),
            "source_name": meta["sourceNames"][0],
            "is_verified_snapshot": bool(meta.get("fallbackUsed", False)),
            "loaded_at": _normalize_loaded_at(meta.get("lastLoadedAt"), service_date),
        }
        for row in data["rows"]
    ]


def build_living_zone_od_daily_fact_rows_from_materialization(payload: dict[str, Any]) -> list[dict[str, Any]]:
    service_date = payload["serviceDate"]
    source_name = payload["sourceName"]
    fallback_used = bool(payload.get("fallbackUsed", False))

    return [
        {
            "service_date": service_date,
            "direction": row["direction"],
            "focus_ctpv_cd": payload["focusArea"]["ctpvCd"],
            "focus_sgg_cd": payload["focusArea"]["sggCd"],
            "focus_emd_name": payload["focusArea"]["emdName"],
            "aggregation_level": row["aggregationLevel"],
            "target_zone_id": row.get("targetZoneId"),
            "target_label": row["targetLabel"],
            "target_ctpv_cd": row.get("targetCtpvCd"),
            "target_sgg_cd": row.get("targetSggCd"),
            "top_context_label": row["topContextLabel"],
            "passenger_count": int(row["passengerCount"]),
            "share_pct": float(row["sharePct"]),
            "source_name": source_name,
            "is_verified_snapshot": fallback_used,
            "loaded_at": _normalize_loaded_at(payload.get("capturedAt"), service_date),
        }
        for row in payload.get("dailyRows", [])
    ]


def build_living_zone_od_15min_fact_rows(snapshot: dict[str, Any]) -> list[dict[str, Any]]:
    _, zone_name_lookup = load_zone_lookup()
    service_date = snapshot["serviceDate"]
    source_name = snapshot["sourceName"]
    fallback_used = bool(snapshot.get("fallbackUsed", False))

    return [
        {
            "service_date": service_date,
            "direction": row["direction"],
            "focus_ctpv_cd": snapshot["focusArea"]["ctpvCd"],
            "focus_sgg_cd": snapshot["focusArea"]["sggCd"],
            "focus_emd_name": snapshot["focusArea"]["emdName"],
            "aggregation_level": snapshot["aggregationLevel"],
            "reference_zone_id": row["referenceZoneId"],
            "reference_sgg_cd": row.get("referenceSggCd"),
            "reference_label": row["referenceLabel"] or zone_name_lookup.get(row["referenceZoneId"], row["referenceZoneId"]),
            "hour_bucket": row["hourBucket"],
            "passenger_count": int(row["passengerCount"]),
            "source_name": source_name,
            "is_verified_snapshot": fallback_used,
            "loaded_at": _normalize_loaded_at(snapshot.get("capturedAt"), service_date),
        }
        for row in snapshot.get("rows", [])
    ]


def build_living_zone_od_15min_fact_rows_from_materialization(payload: dict[str, Any]) -> list[dict[str, Any]]:
    service_date = payload["serviceDate"]
    source_name = payload["sourceName"]
    fallback_used = bool(payload.get("fallbackUsed", False))

    return [
        {
            "service_date": service_date,
            "direction": row["direction"],
            "focus_ctpv_cd": payload["focusArea"]["ctpvCd"],
            "focus_sgg_cd": payload["focusArea"]["sggCd"],
            "focus_emd_name": payload["focusArea"]["emdName"],
            "aggregation_level": row["aggregationLevel"],
            "reference_zone_id": row.get("referenceZoneId"),
            "reference_sgg_cd": row.get("referenceSggCd"),
            "reference_label": row["referenceLabel"],
            "hour_bucket": row["hourBucket"],
            "passenger_count": int(row["passengerCount"]),
            "source_name": source_name,
            "is_verified_snapshot": fallback_used,
            "loaded_at": _normalize_loaded_at(payload.get("capturedAt"), service_date),
        }
        for row in payload.get("rows", [])
    ]


def build_hourly_profile_rows(fact_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    buckets: dict[str, dict[str, int]] = defaultdict(lambda: {"outbound": 0, "inbound": 0})
    for row in fact_rows:
        buckets[row["hour_bucket"]][row["direction"]] += int(row["passenger_count"])

    return [
        {
            "hour_bucket": hour_bucket,
            "ride_count": values["outbound"],
            "alight_count": values["inbound"],
        }
        for hour_bucket, values in sorted(buckets.items())
    ]
