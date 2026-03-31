from __future__ import annotations

import json
import sys

from etl.config import get_settings


def main() -> int:
    settings = get_settings()
    payload = {
        "status": "ok",
        "python": sys.version.split()[0],
        "app_data_mode": settings.app_data_mode,
        "app_source_mode": settings.app_source_mode,
        "repo_root": str(settings.repo_root),
        "raw_sample_path": str(settings.raw_sample_path),
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
