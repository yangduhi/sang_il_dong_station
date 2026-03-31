from __future__ import annotations

from pathlib import Path

from etl.common.io import write_json
from etl.contracts import EvidenceRecord, EventRecord, RunRecord, TaskRecord


class LocalRuntimeStore:
    def __init__(self, root: Path) -> None:
        self.root = root

    def save_task(self, record: TaskRecord) -> Path:
        path = self.root / "tasks" / f"{record.id}.json"
        write_json(path, record.model_dump())
        return path

    def save_run(self, record: RunRecord) -> Path:
        path = self.root / "runs" / f"{record.id}.json"
        write_json(path, record.model_dump())
        return path

    def save_event(self, record: EventRecord) -> Path:
        path = self.root / "events" / f"{record.id}.json"
        write_json(path, record.model_dump())
        return path

    def save_evidence(self, record: EvidenceRecord) -> Path:
        path = self.root / "evidence" / f"{record.id}.json"
        write_json(path, record.model_dump())
        return path
