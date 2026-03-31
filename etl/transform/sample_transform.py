from __future__ import annotations

from etl.extract.sample_sources import load_sample_source


def build_local_dashboard_payload() -> dict:
    ridership = load_sample_source("ridership")
    od = load_sample_source("od")
    station_meta = load_sample_source("station_meta")

    return {
        "station": station_meta["station"],
        "ridership": ridership,
        "od": od,
    }
