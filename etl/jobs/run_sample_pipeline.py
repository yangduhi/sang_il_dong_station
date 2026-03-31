from __future__ import annotations

import hashlib
from datetime import datetime, timezone

from etl.common.logging import get_logger
from etl.contracts import EvidenceRecord, EtlRunManifest, EventRecord, RunRecord, TaskRecord
from etl.load.local_loader import write_processed_payload
from etl.repositories.local_store import LocalRuntimeStore
from etl.transform.sample_transform import build_local_dashboard_payload
from etl.config import get_settings


def main() -> int:
    logger = get_logger("etl.sample")
    settings = get_settings()
    now = datetime.now(timezone.utc).isoformat()
    run_id = "sample-pipeline-run"
    task_id = "sample-pipeline-task"

    payload = build_local_dashboard_payload()
    target = write_processed_payload(payload)
    checksum = hashlib.sha256(target.read_bytes()).hexdigest()

    store = LocalRuntimeStore(settings.runtime_root)
    store.save_task(
        TaskRecord(
            id=task_id,
            task_type="etl",
            title="Run local sample pipeline",
            status="succeeded",
            created_at=now,
            updated_at=now,
            notes=["Sample-mode pipeline writes processed dashboard fixtures."],
        )
    )
    store.save_run(
        RunRecord(
            id=run_id,
            task_id=task_id,
            stage="load",
            status="succeeded",
            started_at=now,
            ended_at=now,
            summary="Sample pipeline completed.",
            metrics={"processed_bytes": float(target.stat().st_size)},
        )
    )
    store.save_event(
        EventRecord(
            id="sample-pipeline-event",
            run_id=run_id,
            event_type="sample_pipeline_completed",
            occurred_at=now,
            payload={"target_path": str(target), "checksum": checksum},
        )
    )
    store.save_evidence(
        EvidenceRecord(
            id="sample-pipeline-evidence",
            run_id=run_id,
            evidence_type="processed_fixture",
            created_at=now,
            path=str(target),
            summary="Processed local dashboard fixture produced by the sample pipeline.",
        )
    )

    manifest = EtlRunManifest(
        run_id=run_id,
        job_name="sample_pipeline",
        source_name="local-sample",
        status="succeeded",
        rows_extracted=3,
        rows_transformed=3,
        rows_loaded=1,
        checksum=checksum,
        evidence_paths=[str(target)],
    )

    logger.info("sample pipeline manifest: %s", manifest.model_dump_json(indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
