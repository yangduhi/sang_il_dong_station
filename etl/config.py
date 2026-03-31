from __future__ import annotations

import os
from pathlib import Path

from pydantic import BaseModel, Field
from etl.common.env import load_local_env


REPO_ROOT = Path(__file__).resolve().parents[1]
load_local_env(REPO_ROOT)


class Settings(BaseModel):
    app_data_mode: str = Field(default=os.getenv("APP_DATA_MODE", "local"))
    app_source_mode: str = Field(default=os.getenv("APP_SOURCE_MODE", "sample"))
    database_url: str | None = Field(default=os.getenv("DATABASE_URL"))
    direct_database_url: str | None = Field(default=os.getenv("DIRECT_DATABASE_URL"))
    seoul_open_data_api_key: str | None = Field(default=os.getenv("SEOUL_OPEN_DATA_API_KEY"))
    data_go_kr_service_key: str | None = Field(default=os.getenv("DATA_GO_KR_SERVICE_KEY"))
    repo_root: Path = Field(default=REPO_ROOT)
    runtime_root: Path = Field(default=REPO_ROOT / "runtime")
    processed_path: Path = Field(default=REPO_ROOT / "data" / "processed")
    raw_sample_path: Path = Field(default=REPO_ROOT / "data" / "raw_samples")
    verified_snapshot_path: Path = Field(default=REPO_ROOT / "data" / "verified_snapshots")
    reports_path: Path = Field(default=REPO_ROOT / "docs" / "reports")


def get_settings() -> Settings:
    return Settings()
