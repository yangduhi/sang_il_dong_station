from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


RunStatus = Literal["planned", "ready", "running", "succeeded", "failed", "blocked"]


class DateRange(BaseModel):
    from_date: str = Field(alias="from")
    to_date: str = Field(alias="to")


class SourceValidationReport(BaseModel):
    source_name: str
    source_kind: Literal["ridership", "od", "station_meta"]
    adopted_as: Literal["Primary", "Secondary", "Rejected"]
    access_method: str
    auth_required: bool
    grain_label: str
    date_range: DateRange
    notes: list[str] = []


class EtlRunManifest(BaseModel):
    run_id: str
    job_name: str
    source_name: str
    status: RunStatus
    rows_extracted: int = 0
    rows_transformed: int = 0
    rows_loaded: int = 0
    checksum: str = ""
    evidence_paths: list[str] = []


class QualityGateMetric(BaseModel):
    name: str
    value: float
    threshold: float
    comparator: Literal["gte", "lte", "eq"]
    passed: bool


class QualityGateResult(BaseModel):
    station_id: str
    passed: bool
    evaluated_at: str
    metrics: list[QualityGateMetric]
    warnings: list[str] = []


class QuarantineRecord(BaseModel):
    source_name: str
    stage: str
    reason_code: str
    message: str
    payload: dict[str, Any]


class TaskRecord(BaseModel):
    id: str
    task_type: str
    title: str
    status: RunStatus
    created_at: str
    updated_at: str
    notes: list[str] = []


class RunRecord(BaseModel):
    id: str
    task_id: str
    stage: str
    status: RunStatus
    started_at: str
    ended_at: str | None = None
    summary: str
    metrics: dict[str, float] = {}


class EventRecord(BaseModel):
    id: str
    run_id: str
    event_type: str
    occurred_at: str
    payload: dict[str, Any]


class EvidenceRecord(BaseModel):
    id: str
    run_id: str
    evidence_type: str
    created_at: str
    path: str
    summary: str
