from __future__ import annotations

from pathlib import Path

from etl.common.io import read_json
from etl.config import get_settings


def load_sample_source(name: str) -> dict:
    settings = get_settings()
    source_map = {
        "ridership": settings.raw_sample_path / "ridership" / "sample-response.json",
        "od": settings.raw_sample_path / "od" / "sample-response.json",
        "station_meta": settings.raw_sample_path / "station_meta" / "sample-response.json",
    }
    target = source_map[name]
    return read_json(Path(target))
