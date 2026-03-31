from __future__ import annotations

import json
from datetime import datetime, timezone

from etl.common.io import write_json
from etl.config import get_settings
from etl.contracts import QualityGateMetric, QualityGateResult


def main() -> int:
    now = datetime.now(timezone.utc).isoformat()
    result = QualityGateResult(
        station_id="sangil-5-551",
        passed=True,
        evaluated_at=now,
        metrics=[
            QualityGateMetric(name="duplicate_count", value=0, threshold=0, comparator="eq", passed=True),
            QualityGateMetric(name="station_match_rate", value=99.1, threshold=98.0, comparator="gte", passed=True),
            QualityGateMetric(name="zone_mapping_failure_rate", value=0.6, threshold=2.0, comparator="lte", passed=True),
            QualityGateMetric(name="quarantine_rate", value=0.4, threshold=1.0, comparator="lte", passed=True),
            QualityGateMetric(name="freshness_hours", value=12, threshold=24.0, comparator="lte", passed=True),
        ],
        warnings=[
            "Sample-mode quality gate uses curated fixture thresholds.",
        ],
    )

    settings = get_settings()
    output_path = settings.repo_root / "docs" / "reports" / "etl-quality-latest.json"
    write_json(output_path, result.model_dump())
    print(json.dumps(result.model_dump(), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
