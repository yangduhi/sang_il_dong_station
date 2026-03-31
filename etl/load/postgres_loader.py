from __future__ import annotations

import re
import subprocess
from urllib.parse import urlparse
from typing import Any

import psycopg


def _resolve_hostaddr(hostname: str) -> str | None:
    try:
      completed = subprocess.run(
          ["nslookup", hostname],
          check=False,
          capture_output=True,
          text=True,
          timeout=10,
      )
    except Exception:
        return None

    for line in completed.stdout.splitlines():
        match = re.search(r"([0-9a-fA-F:]{4,})", line)
        if match and ":" in match.group(1):
            return match.group(1)

    return None


def _build_connect_kwargs(database_url: str) -> dict[str, Any]:
    parsed = urlparse(database_url)
    kwargs: dict[str, Any] = {
        "conninfo": database_url,
        "connect_timeout": 20,
    }

    if parsed.hostname:
        hostaddr = _resolve_hostaddr(parsed.hostname)
        if hostaddr:
            kwargs["host"] = parsed.hostname
            kwargs["hostaddr"] = hostaddr

    return kwargs


class PostgresDashboardLoader:
    def __init__(self, database_url: str) -> None:
        self.database_url = database_url
        self.connection: psycopg.Connection[Any] | None = None

    def __enter__(self) -> "PostgresDashboardLoader":
        self.connection = psycopg.connect(**_build_connect_kwargs(self.database_url))
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        if self.connection is None:
            return
        if exc is None:
            self.connection.commit()
        else:
            self.connection.rollback()
        self.connection.close()
        self.connection = None

    @property
    def conn(self) -> psycopg.Connection[Any]:
        if self.connection is None:
            raise RuntimeError("PostgresDashboardLoader is not connected.")
        return self.connection

    def upsert_station_daily(self, rows: list[dict[str, Any]]) -> int:
        if not rows:
            return 0

        with self.conn.cursor() as cursor:
            cursor.executemany(
                """
                insert into fact_station_daily (
                  service_date, station_id, ride_count, alight_count, total_count, source_name, loaded_at
                )
                values (
                  %(service_date)s, %(station_id)s, %(ride_count)s, %(alight_count)s, %(total_count)s, %(source_name)s, %(loaded_at)s
                )
                on conflict (service_date, station_id, source_name) do update
                set ride_count = excluded.ride_count,
                    alight_count = excluded.alight_count,
                    total_count = excluded.total_count,
                    loaded_at = excluded.loaded_at
                """,
                rows,
            )
        return len(rows)

    def upsert_living_zone_od_daily(self, rows: list[dict[str, Any]]) -> int:
        if not rows:
            return 0

        with self.conn.cursor() as cursor:
            cursor.executemany(
                """
                insert into fact_living_zone_od_daily (
                  service_date, direction, focus_ctpv_cd, focus_sgg_cd, focus_emd_name,
                  aggregation_level, target_zone_id, target_label, target_ctpv_cd, target_sgg_cd,
                  top_context_label, passenger_count, share_pct, source_name, is_verified_snapshot, loaded_at
                )
                values (
                  %(service_date)s, %(direction)s, %(focus_ctpv_cd)s, %(focus_sgg_cd)s, %(focus_emd_name)s,
                  %(aggregation_level)s, %(target_zone_id)s, %(target_label)s, %(target_ctpv_cd)s, %(target_sgg_cd)s,
                  %(top_context_label)s, %(passenger_count)s, %(share_pct)s, %(source_name)s, %(is_verified_snapshot)s, %(loaded_at)s
                )
                on conflict (service_date, direction, aggregation_level, target_label, source_name) do update
                set target_zone_id = excluded.target_zone_id,
                    top_context_label = excluded.top_context_label,
                    passenger_count = excluded.passenger_count,
                    share_pct = excluded.share_pct,
                    is_verified_snapshot = excluded.is_verified_snapshot,
                    loaded_at = excluded.loaded_at
                """,
                rows,
            )
        return len(rows)

    def upsert_living_zone_od_15min(self, rows: list[dict[str, Any]]) -> int:
        if not rows:
            return 0

        with self.conn.cursor() as cursor:
            cursor.executemany(
                """
                insert into fact_living_zone_od_15min (
                  service_date, direction, focus_ctpv_cd, focus_sgg_cd, focus_emd_name,
                  aggregation_level, reference_zone_id, reference_sgg_cd, reference_label, hour_bucket,
                  passenger_count, source_name, is_verified_snapshot, loaded_at
                )
                values (
                  %(service_date)s, %(direction)s, %(focus_ctpv_cd)s, %(focus_sgg_cd)s, %(focus_emd_name)s,
                  %(aggregation_level)s, %(reference_zone_id)s, %(reference_sgg_cd)s, %(reference_label)s, %(hour_bucket)s,
                  %(passenger_count)s, %(source_name)s, %(is_verified_snapshot)s, %(loaded_at)s
                )
                on conflict (service_date, direction, aggregation_level, reference_label, hour_bucket, source_name) do update
                set reference_zone_id = excluded.reference_zone_id,
                    reference_sgg_cd = excluded.reference_sgg_cd,
                    passenger_count = excluded.passenger_count,
                    is_verified_snapshot = excluded.is_verified_snapshot,
                    loaded_at = excluded.loaded_at
                """,
                rows,
            )
        return len(rows)
