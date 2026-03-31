from __future__ import annotations

from pathlib import Path

from etl.common.io import write_json
from etl.config import get_settings


def write_processed_payload(payload: dict) -> Path:
    settings = get_settings()
    target = settings.processed_path / "local-dashboard.json"
    write_json(target, payload)
    return target
