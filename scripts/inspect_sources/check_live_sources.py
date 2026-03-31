from __future__ import annotations

import json
from datetime import date, timedelta
from pathlib import Path
from typing import Any

import httpx


REPO_ROOT = Path(__file__).resolve().parents[2]
ENV_LOCAL = REPO_ROOT / ".env.local"
REPORT_PATH = REPO_ROOT / "docs" / "reports" / "live-source-check-latest.json"
MARKDOWN_PATH = REPO_ROOT / "docs" / "reports" / "live-source-check-latest.md"
SANGIL_STATION_NAME = "\uC0C1\uC77C\uB3D9"


def load_local_env() -> dict[str, str]:
    env: dict[str, str] = {}
    if not ENV_LOCAL.exists():
        return env

    for line in ENV_LOCAL.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip()
    return env


def seoul_daily_probe_dates() -> list[str]:
    today = date.today()
    recent = [(today - timedelta(days=offset)).strftime("%Y%m%d") for offset in range(3, 11)]
    fallback = ["20250301", "20240201", "20220301"]
    ordered: list[str] = []
    seen: set[str] = set()
    for item in recent + fallback:
        if item not in seen:
            ordered.append(item)
            seen.add(item)
    return ordered


def fetch_json_utf8(url: str) -> dict[str, Any]:
    response = httpx.get(url, timeout=30.0)
    response.raise_for_status()
    return json.loads(response.content.decode("utf-8"))


def fetch_seoul_daily_sample(key: str) -> dict[str, Any]:
    last_payload: dict[str, Any] | None = None
    for probe_date in seoul_daily_probe_dates():
        url = f"http://openapi.seoul.go.kr:8088/{key}/json/CardSubwayStatsNew/1/1000/{probe_date}/"
        payload = fetch_json_utf8(url)
        last_payload = payload
        dataset = payload.get("CardSubwayStatsNew", {})
        rows = dataset.get("row", [])
        if rows:
            line5_rows = [row for row in rows if str(row.get("SBWY_ROUT_LN_NM", "")).startswith("5")]
            sangil_rows = [row for row in line5_rows if row.get("SBWY_STNS_NM") == SANGIL_STATION_NAME]
            return {
                "status": "ok",
                "sourceName": "CardSubwayStatsNew",
                "probeDate": probe_date,
                "rowCount": len(rows),
                "line5Count": len(line5_rows),
                "stationFound": bool(sangil_rows),
                "stationRows": sangil_rows,
                "tailLine5StationNames": [row["SBWY_STNS_NM"] for row in line5_rows[-15:]],
                "rawResultCode": dataset.get("RESULT", {}).get("CODE", "INFO-000"),
            }

    return {
        "status": "no_data",
        "sourceName": "CardSubwayStatsNew",
        "probeDate": None,
        "rowCount": 0,
        "stationFound": False,
        "stationRows": [],
        "rawResult": last_payload,
    }


def fetch_molit_od_sample(key: str) -> dict[str, Any]:
    base = (
        "https://apis.data.go.kr/1613000/ODUsageforGeneralBusesandUrbanRailways/"
        "getDailyODUsageforGeneralBusesandUrbanRailways"
    )
    params = {
        "serviceKey": key,
        "pageNo": "1",
        "numOfRows": "5",
        "opr_ymd": "20250301",
        "dptre_ctpv_cd": "11",
        "dptre_sgg_cd": "11740",
        "arvl_ctpv_cd": "11",
        "arvl_sgg_cd": "11680",
        "dataType": "json",
    }
    payload = fetch_json_utf8(f"{base}?{'&'.join(f'{k}={v}' for k, v in params.items())}")
    response = payload.get("Response")
    if not response:
        return {
            "status": "error",
            "sourceName": "getDailyODUsageforGeneralBusesandUrbanRailways",
            "params": {
                "opr_ymd": params["opr_ymd"],
                "dptre_ctpv_cd": params["dptre_ctpv_cd"],
                "dptre_sgg_cd": params["dptre_sgg_cd"],
                "arvl_ctpv_cd": params["arvl_ctpv_cd"],
                "arvl_sgg_cd": params["arvl_sgg_cd"],
            },
            "rawResult": payload,
        }

    items = response["body"]["items"]["item"]
    if isinstance(items, dict):
        items = [items]

    return {
        "status": "ok",
        "sourceName": "getDailyODUsageforGeneralBusesandUrbanRailways",
        "params": {
            "opr_ymd": params["opr_ymd"],
            "dptre_ctpv_cd": params["dptre_ctpv_cd"],
            "dptre_sgg_cd": params["dptre_sgg_cd"],
            "arvl_ctpv_cd": params["arvl_ctpv_cd"],
            "arvl_sgg_cd": params["arvl_sgg_cd"],
        },
        "granularity": "sgg-filtered response with emd-level origin/destination fields",
        "totalCount": response["body"]["totalCount"],
        "stationLevelSupported": False,
        "sampleItems": items[:3],
    }


def build_report() -> dict[str, Any]:
    env = load_local_env()
    report: dict[str, Any] = {
        "checkedAt": date.today().isoformat(),
        "appDataMode": env.get("APP_DATA_MODE", "local"),
        "appSourceMode": env.get("APP_SOURCE_MODE", "sample"),
        "sources": {},
    }

    seoul_key = env.get("SEOUL_OPEN_DATA_API_KEY")
    if seoul_key:
        report["sources"]["seoulDailyRidership"] = fetch_seoul_daily_sample(seoul_key)
    else:
        report["sources"]["seoulDailyRidership"] = {
            "status": "blocked",
            "reason": "SEOUL_OPEN_DATA_API_KEY is missing",
        }

    data_go_key = env.get("DATA_GO_KR_SERVICE_KEY")
    if data_go_key:
        report["sources"]["molitOd"] = fetch_molit_od_sample(data_go_key)
    else:
        report["sources"]["molitOd"] = {
            "status": "blocked",
            "reason": "DATA_GO_KR_SERVICE_KEY is missing",
        }

    return report


def write_report_files(report: dict[str, Any]) -> None:
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    seoul = report["sources"]["seoulDailyRidership"]
    od = report["sources"]["molitOd"]
    lines = [
        "# Live source check",
        "",
        f"- Checked at: `{report['checkedAt']}`",
        f"- Seoul daily ridership: `{seoul['status']}`",
        f"- MOLIT OD: `{od['status']}`",
        "",
        "## Seoul daily ridership",
        f"- Source: `{seoul.get('sourceName', 'n/a')}`",
        f"- Probe date used: `{seoul.get('probeDate')}`",
        f"- Row count: `{seoul.get('rowCount')}`",
        f"- Line 5 rows: `{seoul.get('line5Count', 'n/a')}`",
        f"- Sangil-dong station found: `{seoul.get('stationFound')}`",
    ]

    if seoul.get("stationRows"):
        lines.extend(
            [
                "",
                "```json",
                json.dumps(seoul["stationRows"], ensure_ascii=False, indent=2),
                "```",
            ]
        )

    lines.extend(
        [
            "",
            "## MOLIT / OD",
            f"- Status: `{od['status']}`",
        ]
    )
    if od["status"] == "ok":
        lines.extend(
            [
                f"- Source: `{od['sourceName']}`",
                f"- Query params: `{od['params']}`",
                f"- Total count: `{od['totalCount']}`",
                f"- Granularity: `{od['granularity']}`",
                f"- Station-level supported: `{od['stationLevelSupported']}`",
                "",
                "```json",
                json.dumps(od["sampleItems"], ensure_ascii=False, indent=2),
                "```",
            ]
        )
    else:
        lines.extend(
            [
                f"- Reason: {od['reason']}",
            ]
        )

    MARKDOWN_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    report = build_report()
    write_report_files(report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
