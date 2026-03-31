from __future__ import annotations

import os
from pathlib import Path


def _parse_env_file(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}

    parsed: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if (value.startswith('"') and value.endswith('"')) or (
            value.startswith("'") and value.endswith("'")
        ):
            value = value[1:-1]
        parsed[key] = value

    return parsed


def load_local_env(repo_root: Path) -> None:
    merged = {
        **_parse_env_file(repo_root / ".env"),
        **_parse_env_file(repo_root / ".env.local"),
    }

    for key, value in merged.items():
        os.environ.setdefault(key, value)
