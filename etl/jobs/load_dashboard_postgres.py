from __future__ import annotations

import argparse
import hashlib
from datetime import UTC, datetime
from pathlib import Path

from etl.common.io import write_json
from etl.common.logging import get_logger
from etl.config import get_settings
from etl.contracts import EvidenceRecord, EtlRunManifest, EventRecord, RunRecord, TaskRecord
from etl.extract.dashboard_sources import (
    fetch_seoul_station_daily,
    load_verified_snapshot,
    save_verified_snapshot,
)
from etl.extract.molit_od_materialization import (
    build_zone_snapshots_from_materialization,
    capture_15min_materialization,
    capture_daily_materialization,
)
from etl.load.postgres_loader import PostgresDashboardLoader
from etl.repositories.local_store import LocalRuntimeStore
from etl.transform.dashboard_transform import (
    build_living_zone_od_15min_fact_rows,
    build_living_zone_od_15min_fact_rows_from_materialization,
    build_living_zone_od_daily_fact_rows,
    build_living_zone_od_daily_fact_rows_from_materialization,
    build_station_daily_fact_rows,
)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Load Sangil dashboard facts into Postgres.")
    parser.add_argument("--refresh-live-od", action="store_true", help="Attempt to refresh daily OD snapshots from the public API.")
    parser.add_argument("--refresh-live-15min", action="store_true", help="Attempt to capture 15-minute OD snapshots for top daily zones.")
    parser.add_argument("--top-n", type=int, default=2, help="Top N daily sgg targets to expand into 15-minute snapshots.")
    parser.add_argument(
        "--hours",
        default="7,8,18,19",
        help="Comma-separated hour list for the 15-minute capture job.",
    )
    return parser


def _file_checksum(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main(argv: list[str] | None = None) -> int:
    logger = get_logger("etl.dashboard.postgres")
    parser = _build_parser()
    args = parser.parse_args(argv)
    settings = get_settings()

    database_url = settings.database_url or settings.direct_database_url
    if not database_url:
        print("DATABASE_URL is not configured. Skipping Postgres dashboard load.")
        return 0

    now = datetime.now(UTC).isoformat()
    run_suffix = datetime.now(UTC).strftime("%Y%m%d%H%M%S")
    task_id = "dashboard-postgres-etl-task"
    run_id = f"dashboard-postgres-etl-{run_suffix}"
    report_path = settings.reports_path / "etl-dashboard-load-latest.json"
    store = LocalRuntimeStore(settings.runtime_root)
    warnings: list[str] = []
    evidence_paths: list[str] = []

    store.save_task(
        TaskRecord(
            id=task_id,
            task_type="etl",
            title="Materialize Sangil dashboard facts to Postgres",
            status="running",
            created_at=now,
            updated_at=now,
            notes=[
                "Dashboard runtime should read Postgres only.",
                "OD snapshots are captured ahead of time and then loaded into DB.",
            ],
        )
    )

    station_rows = build_station_daily_fact_rows(fetch_seoul_station_daily())

    outbound_snapshot: dict
    inbound_snapshot: dict
    outbound_snapshot_path = settings.verified_snapshot_path / "origin-to-zone.json"
    inbound_snapshot_path = settings.verified_snapshot_path / "zone-to-destination.json"
    materialization_path = settings.verified_snapshot_path / "living-zone-od-materialization.json"
    live_daily_materialization: dict | None = None

    if args.refresh_live_od:
        try:
            live_daily_materialization = capture_daily_materialization()
            live_outbound, live_inbound = build_zone_snapshots_from_materialization(live_daily_materialization)
            outbound_snapshot_path = save_verified_snapshot("origin-to-zone.json", live_outbound)
            inbound_snapshot_path = save_verified_snapshot("zone-to-destination.json", live_inbound)
            materialization_path = save_verified_snapshot("living-zone-od-materialization.json", live_daily_materialization)
        except Exception as error:
            warnings.append(f"Daily OD live refresh failed; using last verified snapshot. ({error})")

    outbound_snapshot = load_verified_snapshot("origin-to-zone.json")
    inbound_snapshot = load_verified_snapshot("zone-to-destination.json")
    evidence_paths.extend([str(outbound_snapshot_path), str(inbound_snapshot_path)])
    if live_daily_materialization:
        evidence_paths.append(str(materialization_path))

    if live_daily_materialization:
        daily_od_rows = build_living_zone_od_daily_fact_rows_from_materialization(live_daily_materialization)
    else:
        daily_od_rows = build_living_zone_od_daily_fact_rows(outbound_snapshot, "outbound")
        daily_od_rows.extend(build_living_zone_od_daily_fact_rows(inbound_snapshot, "inbound"))

    hourly_snapshot_path = settings.verified_snapshot_path / "living-zone-15min.json"
    hourly_materialization_path = settings.verified_snapshot_path / "living-zone-15min-materialization.json"
    hourly_rows: list[dict] = []
    if args.refresh_live_15min:
        try:
            tracked_hours = tuple(int(value.strip()) for value in args.hours.split(",") if value.strip())
            daily_materialization = live_daily_materialization or load_verified_snapshot("living-zone-od-materialization.json")
            live_15min = capture_15min_materialization(
                daily_materialization["serviceDate"],
                daily_materialization["dailyRows"],
                top_n=args.top_n,
                tracked_hours=tracked_hours,
            )
            hourly_materialization_path = save_verified_snapshot("living-zone-15min-materialization.json", live_15min)
        except Exception as error:
            warnings.append(f"15-minute OD live refresh failed; keeping prior materialized rows. ({error})")

    if hourly_materialization_path.exists():
        hourly_snapshot = load_verified_snapshot("living-zone-15min-materialization.json")
        hourly_rows = build_living_zone_od_15min_fact_rows_from_materialization(hourly_snapshot)
        evidence_paths.append(str(hourly_materialization_path))
    elif hourly_snapshot_path.exists():
        hourly_snapshot = load_verified_snapshot("living-zone-15min.json")
        hourly_rows = build_living_zone_od_15min_fact_rows(hourly_snapshot)
        evidence_paths.append(str(hourly_snapshot_path))
    else:
        warnings.append("No 15-minute OD snapshot is available yet. Hourly panel will keep the DB-backed empty state.")

    rows_loaded = 0
    status = "succeeded"
    summary = "Dashboard facts materialized to Postgres."
    error_message: str | None = None
    try:
        with PostgresDashboardLoader(database_url) as loader:
            rows_loaded += loader.upsert_station_daily(station_rows)
            rows_loaded += loader.upsert_living_zone_od_daily(daily_od_rows)
            if hourly_rows:
                rows_loaded += loader.upsert_living_zone_od_15min(hourly_rows)
    except Exception as error:
        status = "blocked"
        summary = "Dashboard facts were prepared but could not be materialized to Postgres."
        error_message = str(error)
        warnings.append(f"Postgres materialization blocked: {error}")

    manifest = EtlRunManifest(
        run_id=run_id,
        job_name="dashboard_postgres_load",
        source_name="station_daily + living_zone_od_snapshots",
        status=status,
        rows_extracted=len(station_rows) + len(daily_od_rows) + len(hourly_rows),
        rows_transformed=len(station_rows) + len(daily_od_rows) + len(hourly_rows),
        rows_loaded=rows_loaded,
        checksum="",
        evidence_paths=evidence_paths,
    )

    report_payload = {
        "runId": run_id,
        "executedAt": now,
        "rows": {
            "stationDaily": len(station_rows),
            "livingZoneOdDaily": len(daily_od_rows),
            "livingZoneOd15min": len(hourly_rows),
            "rowsLoaded": rows_loaded,
        },
        "status": status,
        "batchStrategy": {
            "daily": "Refresh station_daily plus living_zone_od_daily for both zone and sgg aggregation levels in one batch. Dashboard reads the latest materialized facts only.",
            "fifteenMinute": "Optional batch. Capture only top daily zone/sgg destinations and only tracked commute hours to stay below OD API quota.",
        },
        "warnings": warnings,
        "evidencePaths": evidence_paths,
    }
    if error_message:
        report_payload["error"] = error_message
    write_json(report_path, report_payload)
    manifest.checksum = _file_checksum(report_path)

    store.save_run(
        RunRecord(
            id=run_id,
            task_id=task_id,
            stage="load",
            status=status,
            started_at=now,
            ended_at=datetime.now(UTC).isoformat(),
            summary=summary,
            metrics={
                "station_daily_rows": float(len(station_rows)),
                "living_zone_daily_rows": float(len(daily_od_rows)),
                "living_zone_15min_rows": float(len(hourly_rows)),
            },
        )
    )
    store.save_event(
        EventRecord(
            id=f"{run_id}-event",
            run_id=run_id,
            event_type="dashboard_postgres_materialized" if status == "succeeded" else "dashboard_postgres_blocked",
            occurred_at=datetime.now(UTC).isoformat(),
            payload=report_payload,
        )
    )
    store.save_evidence(
        EvidenceRecord(
            id=f"{run_id}-report",
            run_id=run_id,
            evidence_type="etl_report",
            created_at=datetime.now(UTC).isoformat(),
            path=str(report_path),
            summary="Latest ETL materialization report for the Postgres-backed dashboard.",
        )
    )
    store.save_task(
        TaskRecord(
            id=task_id,
            task_type="etl",
            title="Materialize Sangil dashboard facts to Postgres",
            status=status,
            created_at=now,
            updated_at=datetime.now(UTC).isoformat(),
            notes=warnings or [summary],
        )
    )

    logger.info("dashboard postgres manifest: %s", manifest.model_dump_json(indent=2))
    return 0 if status == "succeeded" else 1


if __name__ == "__main__":
    raise SystemExit(main())
