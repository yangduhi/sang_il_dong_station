from __future__ import annotations

import os
from pathlib import Path

from pydantic import BaseModel, Field


class Settings(BaseModel):
    app_data_mode: str = Field(default=os.getenv("APP_DATA_MODE", "local"))
    app_source_mode: str = Field(default=os.getenv("APP_SOURCE_MODE", "sample"))
    database_url: str | None = Field(default=os.getenv("DATABASE_URL"))
    seoul_open_data_api_key: str | None = Field(default=os.getenv("SEOUL_OPEN_DATA_API_KEY"))
    data_go_kr_service_key: str | None = Field(default=os.getenv("DATA_GO_KR_SERVICE_KEY"))
    repo_root: Path = Field(default=Path(__file__).resolve().parents[1])
    runtime_root: Path = Field(default=Path(__file__).resolve().parents[1] / "runtime")
    processed_path: Path = Field(default=Path(__file__).resolve().parents[1] / "data" / "processed")
    raw_sample_path: Path = Field(default=Path(__file__).resolve().parents[1] / "data" / "raw_samples")


def get_settings() -> Settings:
    return Settings()
