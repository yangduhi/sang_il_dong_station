from __future__ import annotations

import json
from collections import defaultdict
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

import httpx

from etl.config import get_settings


SEOUL_RIDERSHIP_SOURCE = "CardSubwayStatsNew"
MOLIT_DAILY_SOURCE = "getDailyODUsageforGeneralBusesandUrbanRailways"
MOLIT_15MIN_SOURCE = "getGeneralBusandUrbanRailwaysODUsageby15MinuteIntervals"
FOCUS_CTPV_CD = "11"
FOCUS_SGG_CD = "11740"
FOCUS_EMD_NAME = "상일동"
FOCUS_STATION_ID = "sangil-5-551"


@dataclass(frozen=True)
class ZoneMember:
    zone_id: str
    zone_name: str
    ctpv_cd: str
    ctpv_name: str
    sgg_cd: str
    sgg_name: str


ZONE_MEMBERS: tuple[ZoneMember, ...] = (
    ZoneMember("seoul-east-southeast", "강동·송파", "11", "서울특별시", "11740", "강동구"),
    ZoneMember("seoul-east-southeast", "강동·송파", "11", "서울특별시", "11710", "송파구"),
    ZoneMember("seoul-gangnam", "강남·서초", "11", "서울특별시", "11680", "강남구"),
    ZoneMember("seoul-gangnam", "강남·서초", "11", "서울특별시", "11650", "서초구"),
    ZoneMember("seoul-core", "도심(종로·중구·용산)", "11", "서울특별시", "11110", "종로구"),
    ZoneMember("seoul-core", "도심(종로·중구·용산)", "11", "서울특별시", "11140", "중구"),
    ZoneMember("seoul-core", "도심(종로·중구·용산)", "11", "서울특별시", "11170", "용산구"),
    ZoneMember("seoul-northeast", "동북", "11", "서울특별시", "11200", "성동구"),
    ZoneMember("seoul-northeast", "동북", "11", "서울특별시", "11215", "광진구"),
    ZoneMember("seoul-northeast", "동북", "11", "서울특별시", "11230", "동대문구"),
    ZoneMember("seoul-northeast", "동북", "11", "서울특별시", "11260", "중랑구"),
    ZoneMember("seoul-northeast", "동북", "11", "서울특별시", "11290", "성북구"),
    ZoneMember("seoul-northeast", "동북", "11", "서울특별시", "11305", "강북구"),
    ZoneMember("seoul-northeast", "동북", "11", "서울특별시", "11320", "도봉구"),
    ZoneMember("seoul-northeast", "동북", "11", "서울특별시", "11350", "노원구"),
    ZoneMember("seoul-northwest", "서북", "11", "서울특별시", "11380", "은평구"),
    ZoneMember("seoul-northwest", "서북", "11", "서울특별시", "11410", "서대문구"),
    ZoneMember("seoul-northwest", "서북", "11", "서울특별시", "11440", "마포구"),
    ZoneMember("seoul-southwest", "서남", "11", "서울특별시", "11470", "양천구"),
    ZoneMember("seoul-southwest", "서남", "11", "서울특별시", "11500", "강서구"),
    ZoneMember("seoul-southwest", "서남", "11", "서울특별시", "11530", "구로구"),
    ZoneMember("seoul-southwest", "서남", "11", "서울특별시", "11545", "금천구"),
    ZoneMember("seoul-southwest", "서남", "11", "서울특별시", "11560", "영등포구"),
    ZoneMember("seoul-southwest", "서남", "11", "서울특별시", "11590", "동작구"),
    ZoneMember("seoul-southwest", "서남", "11", "서울특별시", "11620", "관악구"),
    ZoneMember("gyeonggi-east", "하남·구리·남양주", "41", "경기도", "41450", "하남시"),
    ZoneMember("gyeonggi-east", "하남·구리·남양주", "41", "경기도", "41310", "구리시"),
    ZoneMember("gyeonggi-east", "하남·구리·남양주", "41", "경기도", "41360", "남양주시"),
    ZoneMember("gyeonggi-southeast", "성남·광주·이천·여주·양평", "41", "경기도", "41130", "성남시"),
    ZoneMember("gyeonggi-southeast", "성남·광주·이천·여주·양평", "41", "경기도", "41610", "광주시"),
    ZoneMember("gyeonggi-southeast", "성남·광주·이천·여주·양평", "41", "경기도", "41500", "이천시"),
    ZoneMember("gyeonggi-southeast", "성남·광주·이천·여주·양평", "41", "경기도", "41670", "여주시"),
    ZoneMember("gyeonggi-southeast", "성남·광주·이천·여주·양평", "41", "경기도", "41830", "양평군"),
    ZoneMember("gyeonggi-south", "용인·수원·화성·오산·평택·안성", "41", "경기도", "41460", "용인시"),
    ZoneMember("gyeonggi-south", "용인·수원·화성·오산·평택·안성", "41", "경기도", "41110", "수원시"),
    ZoneMember("gyeonggi-south", "용인·수원·화성·오산·평택·안성", "41", "경기도", "41590", "화성시"),
    ZoneMember("gyeonggi-south", "용인·수원·화성·오산·평택·안성", "41", "경기도", "41370", "오산시"),
    ZoneMember("gyeonggi-south", "용인·수원·화성·오산·평택·안성", "41", "경기도", "41220", "평택시"),
    ZoneMember("gyeonggi-south", "용인·수원·화성·오산·평택·안성", "41", "경기도", "41550", "안성시"),
    ZoneMember("gyeonggi-southwest", "안양·군포·의왕·과천·광명·부천", "41", "경기도", "41170", "안양시"),
    ZoneMember("gyeonggi-southwest", "안양·군포·의왕·과천·광명·부천", "41", "경기도", "41410", "군포시"),
    ZoneMember("gyeonggi-southwest", "안양·군포·의왕·과천·광명·부천", "41", "경기도", "41430", "의왕시"),
    ZoneMember("gyeonggi-southwest", "안양·군포·의왕·과천·광명·부천", "41", "경기도", "41290", "과천시"),
    ZoneMember("gyeonggi-southwest", "안양·군포·의왕·과천·광명·부천", "41", "경기도", "41210", "광명시"),
    ZoneMember("gyeonggi-southwest", "안양·군포·의왕·과천·광명·부천", "41", "경기도", "41190", "부천시"),
    ZoneMember("gyeonggi-west", "시흥·안산", "41", "경기도", "41390", "시흥시"),
    ZoneMember("gyeonggi-west", "시흥·안산", "41", "경기도", "41270", "안산시"),
    ZoneMember("gyeonggi-northwest", "고양·파주·김포", "41", "경기도", "41280", "고양시"),
    ZoneMember("gyeonggi-northwest", "고양·파주·김포", "41", "경기도", "41480", "파주시"),
    ZoneMember("gyeonggi-northwest", "고양·파주·김포", "41", "경기도", "41570", "김포시"),
    ZoneMember("gyeonggi-north", "의정부·양주·동두천·포천·연천·가평", "41", "경기도", "41150", "의정부시"),
    ZoneMember("gyeonggi-north", "의정부·양주·동두천·포천·연천·가평", "41", "경기도", "41630", "양주시"),
    ZoneMember("gyeonggi-north", "의정부·양주·동두천·포천·연천·가평", "41", "경기도", "41250", "동두천시"),
    ZoneMember("gyeonggi-north", "의정부·양주·동두천·포천·연천·가평", "41", "경기도", "41650", "포천시"),
    ZoneMember("gyeonggi-north", "의정부·양주·동두천·포천·연천·가평", "41", "경기도", "41800", "연천군"),
    ZoneMember("gyeonggi-north", "의정부·양주·동두천·포천·연천·가평", "41", "경기도", "41820", "가평군"),
)

ZONE_BY_ID = {member.zone_id: member.zone_name for member in ZONE_MEMBERS}


def _settings():
    return get_settings()


def _json_load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _json_dump(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def _recent_probe_dates(days: int = 14, lag_days: int = 3) -> list[str]:
    today = datetime.now(UTC).date()
    values: list[str] = []
    for offset in range(days):
        service_date = today - timedelta(days=lag_days + offset)
        values.append(service_date.strftime("%Y%m%d"))
    return values


def _fetch_json(url: str, params: dict[str, str], timeout_seconds: float = 45.0) -> dict[str, Any]:
    with httpx.Client(timeout=timeout_seconds, follow_redirects=True) as client:
        response = client.get(url, params=params)
        response.raise_for_status()
        return response.json()


def fetch_seoul_station_daily(days: int = 14) -> list[dict[str, Any]]:
    settings = _settings()
    if not settings.seoul_open_data_api_key:
        raise RuntimeError("SEOUL_OPEN_DATA_API_KEY is not configured.")

    rows: list[dict[str, Any]] = []
    for service_date in _recent_probe_dates(days=days):
        payload = _fetch_json(
            f"http://openapi.seoul.go.kr:8088/{settings.seoul_open_data_api_key}/json/{SEOUL_RIDERSHIP_SOURCE}/1/1000/{service_date}/",
            {},
            timeout_seconds=30.0,
        )
        for row in payload.get(SEOUL_RIDERSHIP_SOURCE, {}).get("row", []):
            if row.get("SBWY_ROUT_LN_NM", "").startswith("5") and row.get("SBWY_STNS_NM") == "상일동":
                rows.append(
                    {
                        "service_date": f"{service_date[:4]}-{service_date[4:6]}-{service_date[6:8]}",
                        "station_id": FOCUS_STATION_ID,
                        "ride_count": int(row.get("GTON_TNOPE", 0)),
                        "alight_count": int(row.get("GTOFF_TNOPE", 0)),
                        "total_count": int(row.get("GTON_TNOPE", 0)) + int(row.get("GTOFF_TNOPE", 0)),
                        "source_name": SEOUL_RIDERSHIP_SOURCE,
                        "loaded_at": row.get("REG_YMD", service_date),
                    }
                )
                break

    if not rows:
        raise RuntimeError("No Seoul station daily rows were found for Sangil-dong station.")

    return sorted(rows, key=lambda row: row["service_date"])


def _find_available_od_service_date() -> str:
    settings = _settings()
    if not settings.data_go_kr_service_key:
        raise RuntimeError("DATA_GO_KR_SERVICE_KEY is not configured.")

    base_url = (
        "https://apis.data.go.kr/1613000/ODUsageforGeneralBusesandUrbanRailways/"
        f"{MOLIT_DAILY_SOURCE}"
    )

    for service_date in _recent_probe_dates(days=21):
        try:
            payload = _fetch_json(
                base_url,
                {
                    "serviceKey": settings.data_go_kr_service_key,
                    "pageNo": "1",
                    "numOfRows": "1",
                    "opr_ymd": service_date,
                    "dptre_ctpv_cd": FOCUS_CTPV_CD,
                    "dptre_sgg_cd": FOCUS_SGG_CD,
                    "arvl_ctpv_cd": "11",
                    "arvl_sgg_cd": "11680",
                    "dataType": "json",
                },
            )
        except Exception:
            continue

        if "Response" in payload:
            return service_date

    raise RuntimeError("No accessible OD service date was found within the probe window.")


def _fetch_molit_items(
    endpoint_name: str,
    params: dict[str, str],
    page_size: int = 100,
    timeout_seconds: float = 45.0,
) -> list[dict[str, Any]]:
    settings = _settings()
    if not settings.data_go_kr_service_key:
        raise RuntimeError("DATA_GO_KR_SERVICE_KEY is not configured.")

    base_url = f"https://apis.data.go.kr/1613000/ODUsageforGeneralBusesandUrbanRailways/{endpoint_name}"
    page_no = 1
    rows: list[dict[str, Any]] = []

    while True:
        payload = _fetch_json(
            base_url,
            {
                "serviceKey": settings.data_go_kr_service_key,
                "pageNo": str(page_no),
                "numOfRows": str(page_size),
                "dataType": "json",
                **params,
            },
            timeout_seconds=timeout_seconds,
        )

        if "Response" not in payload:
            raise RuntimeError(f"Unexpected OD payload shape: {payload}")

        body = payload["Response"]["body"]
        items = body.get("items", {}).get("item", [])
        if isinstance(items, dict):
            items = [items]
        rows.extend(items)

        total_count = int(body.get("totalCount", 0) or 0)
        if len(rows) >= total_count or not items:
            break
        page_no += 1

    return rows


def _build_station_payload() -> dict[str, Any]:
    return {
        "stationId": FOCUS_STATION_ID,
        "stationName": "상일동역",
        "lineName": "5호선",
        "operatorName": "서울교통공사",
        "zoneName": "강동·송파",
        "cityDo": "서울특별시",
        "sigungu": "강동구",
    }


def _build_living_scope() -> dict[str, Any]:
    return {
        "scopeType": "living_zone",
        "scopeLabel": "상일동 생활권",
        "focusAreaLabel": "서울특별시 강동구 상일동",
        "description": "공개 OD API가 역 단위가 아니라 읍면동 기반이므로, 상일동 생활권(상일동)을 기준으로 대중교통 이동을 해석합니다.",
    }


def capture_live_od_daily_snapshots(service_date: str | None = None) -> tuple[dict[str, Any], dict[str, Any]]:
    service_date = service_date or _find_available_od_service_date()
    outbound_rows: dict[str, dict[str, Any]] = {}
    inbound_rows: dict[str, dict[str, Any]] = {}

    for member in ZONE_MEMBERS:
        outbound_items = _fetch_molit_items(
            MOLIT_DAILY_SOURCE,
            {
                "opr_ymd": service_date,
                "dptre_ctpv_cd": FOCUS_CTPV_CD,
                "dptre_sgg_cd": FOCUS_SGG_CD,
                "arvl_ctpv_cd": member.ctpv_cd,
                "arvl_sgg_cd": member.sgg_cd,
            },
        )
        inbound_items = _fetch_molit_items(
            MOLIT_DAILY_SOURCE,
            {
                "opr_ymd": service_date,
                "dptre_ctpv_cd": member.ctpv_cd,
                "dptre_sgg_cd": member.sgg_cd,
                "arvl_ctpv_cd": FOCUS_CTPV_CD,
                "arvl_sgg_cd": FOCUS_SGG_CD,
            },
        )

        for direction, items, bucket in (
            ("outbound", outbound_items, outbound_rows),
            ("inbound", inbound_items, inbound_rows),
        ):
            scoped = [
                item
                for item in items
                if (
                    item.get("dptre_emd_nm") == FOCUS_EMD_NAME
                    if direction == "outbound"
                    else item.get("arvl_emd_nm") == FOCUS_EMD_NAME
                )
            ]
            if not scoped:
                continue

            passenger_count = sum(int(item.get("trfvlm", 0) or 0) for item in scoped)
            context_totals: dict[str, int] = defaultdict(int)
            for item in scoped:
                label = (
                    f"{item.get('arvl_sgg_nm', '')} {item.get('arvl_emd_nm', '')}".strip()
                    if direction == "outbound"
                    else f"{item.get('dptre_sgg_nm', '')} {item.get('dptre_emd_nm', '')}".strip()
                )
                context_totals[label] += int(item.get("trfvlm", 0) or 0)

            top_context = max(context_totals.items(), key=lambda pair: pair[1])[0]
            top_context_count = context_totals[top_context]
            current = bucket.get(member.zone_id)
            if current is None:
                bucket[member.zone_id] = {
                    "zoneId": member.zone_id,
                    "zoneName": member.zone_name,
                    "passengerCount": passenger_count,
                    "topContextLabel": top_context,
                    "topContextCount": top_context_count,
                }
            else:
                current["passengerCount"] += passenger_count
                if top_context_count > current["topContextCount"]:
                    current["topContextLabel"] = top_context
                    current["topContextCount"] = top_context_count

    def _build_response(direction: str, bucket: dict[str, dict[str, Any]]) -> dict[str, Any]:
        rows = sorted(bucket.values(), key=lambda row: row["passengerCount"], reverse=True)
        total = sum(row["passengerCount"] for row in rows)
        response_rows = [
            {
                "zoneName": row["zoneName"],
                "passengerCount": row["passengerCount"],
                "sharePct": round((row["passengerCount"] / total) * 100, 1) if total else 0,
                "topContextLabel": row["topContextLabel"],
            }
            for row in rows
            if row["passengerCount"] > 0
        ]
        service_date_iso = f"{service_date[:4]}-{service_date[4:6]}-{service_date[6:8]}"
        return {
            "data": {
                "station": _build_station_payload(),
                "analysisScope": _build_living_scope(),
                "dateRange": {"from": service_date_iso, "to": service_date_iso},
                "rows": response_rows,
            },
            "meta": {
                "sourceNames": [MOLIT_DAILY_SOURCE],
                "grainLabel": "emd_based_public_transit_od",
                "lastLoadedAt": service_date,
                "dateRange": {"from": service_date_iso, "to": service_date_iso},
                "limitations": [
                    "공개 OD API는 상일동역 역-역 이동이 아니라 상일동(읍면동) 생활권 기준 대중교통 OD입니다.",
                    "OD에는 일반버스와 도시철도가 함께 포함됩니다.",
                ],
                "queryEcho": {
                    "direction": direction,
                    "focusArea": "서울특별시 강동구 상일동",
                },
                "fallbackUsed": False,
            },
        }

    return _build_response("outbound", outbound_rows), _build_response("inbound", inbound_rows)


def capture_live_od_15min_snapshot(
    service_date: str,
    daily_rows_by_direction: dict[str, list[dict[str, Any]]],
    top_n: int = 4,
    tracked_hours: tuple[int, ...] = (6, 7, 8, 17, 18, 19),
) -> dict[str, Any]:
    zone_member_map: dict[str, list[ZoneMember]] = defaultdict(list)
    for member in ZONE_MEMBERS:
        zone_member_map[member.zone_id].append(member)

    tracked_zone_ids: dict[str, list[str]] = {}
    for direction, rows in daily_rows_by_direction.items():
        tracked_zone_ids[direction] = [
            next(
                member.zone_id
                for member in ZONE_MEMBERS
                if member.zone_name == row["zoneName"]
            )
            for row in rows[:top_n]
            if any(member.zone_name == row["zoneName"] for member in ZONE_MEMBERS)
        ]

    aggregated: dict[tuple[str, str, str], int] = defaultdict(int)

    for direction, zone_ids in tracked_zone_ids.items():
        for zone_id in zone_ids:
            for member in zone_member_map[zone_id]:
                for hour in tracked_hours:
                    for quarter in ("00", "15", "30", "45"):
                        params = {
                            "opr_ymd": service_date,
                            "dptre_ctpv_cd": FOCUS_CTPV_CD if direction == "outbound" else member.ctpv_cd,
                            "dptre_sgg_cd": FOCUS_SGG_CD if direction == "outbound" else member.sgg_cd,
                            "arvl_ctpv_cd": member.ctpv_cd if direction == "outbound" else FOCUS_CTPV_CD,
                            "arvl_sgg_cd": member.sgg_cd if direction == "outbound" else FOCUS_SGG_CD,
                            "tzon": f"{hour:02d}",
                            "qtrp": quarter,
                        }
                        items = _fetch_molit_items(
                            MOLIT_15MIN_SOURCE,
                            params,
                            timeout_seconds=25.0,
                        )
                        scoped = [
                            item
                            for item in items
                            if (
                                item.get("dptre_emd_nm") == FOCUS_EMD_NAME
                                if direction == "outbound"
                                else item.get("arvl_emd_nm") == FOCUS_EMD_NAME
                            )
                        ]
                        if not scoped:
                            continue

                        key = (direction, zone_id, f"{hour:02d}:00")
                        aggregated[key] += sum(int(item.get("pasg_cnt", 0) or 0) for item in scoped)

    rows = [
        {
            "direction": direction,
            "referenceZoneId": zone_id,
            "referenceLabel": ZONE_BY_ID[zone_id],
            "hourBucket": hour_bucket,
            "passengerCount": passenger_count,
        }
        for (direction, zone_id, hour_bucket), passenger_count in sorted(aggregated.items())
    ]

    return {
        "capturedAt": datetime.now(UTC).isoformat(),
        "serviceDate": f"{service_date[:4]}-{service_date[4:6]}-{service_date[6:8]}",
        "sourceName": MOLIT_15MIN_SOURCE,
        "aggregationLevel": "zone",
        "focusArea": {
            "ctpvCd": FOCUS_CTPV_CD,
            "sggCd": FOCUS_SGG_CD,
            "emdName": FOCUS_EMD_NAME,
        },
        "trackedHours": [f"{hour:02d}:00" for hour in tracked_hours],
        "rows": rows,
        "fallbackUsed": False,
    }


def load_verified_snapshot(name: str) -> dict[str, Any]:
    return _json_load(_settings().verified_snapshot_path / name)


def save_verified_snapshot(name: str, payload: dict[str, Any]) -> Path:
    path = _settings().verified_snapshot_path / name
    _json_dump(path, payload)
    return path
