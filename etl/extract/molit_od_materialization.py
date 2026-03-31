from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any

import httpx

from etl.config import get_settings


MOLIT_DAILY_SOURCE = "getDailyODUsageforGeneralBusesandUrbanRailways"
MOLIT_15MIN_SOURCE = "getGeneralBusandUrbanRailwaysODUsageby15MinuteIntervals"
FOCUS_CTPV_CD = "11"
FOCUS_SGG_CD = "11740"
FOCUS_EMD_NAME = "상일동"


@dataclass(frozen=True)
class RegionMember:
    zone_id: str
    zone_name: str
    ctpv_cd: str
    ctpv_name: str
    sgg_cd: str
    sgg_name: str


REGION_MEMBERS: tuple[RegionMember, ...] = (
    RegionMember("seoul-east-southeast", "강동·송파", "11", "서울특별시", "11740", "강동구"),
    RegionMember("seoul-east-southeast", "강동·송파", "11", "서울특별시", "11710", "송파구"),
    RegionMember("seoul-gangnam", "강남·서초", "11", "서울특별시", "11680", "강남구"),
    RegionMember("seoul-gangnam", "강남·서초", "11", "서울특별시", "11650", "서초구"),
    RegionMember("seoul-core", "도심(종로·중구·용산)", "11", "서울특별시", "11110", "종로구"),
    RegionMember("seoul-core", "도심(종로·중구·용산)", "11", "서울특별시", "11140", "중구"),
    RegionMember("seoul-core", "도심(종로·중구·용산)", "11", "서울특별시", "11170", "용산구"),
    RegionMember("seoul-northeast", "동북", "11", "서울특별시", "11200", "성동구"),
    RegionMember("seoul-northeast", "동북", "11", "서울특별시", "11215", "광진구"),
    RegionMember("seoul-northeast", "동북", "11", "서울특별시", "11230", "동대문구"),
    RegionMember("seoul-northeast", "동북", "11", "서울특별시", "11260", "중랑구"),
    RegionMember("seoul-northeast", "동북", "11", "서울특별시", "11290", "성북구"),
    RegionMember("seoul-northeast", "동북", "11", "서울특별시", "11305", "강북구"),
    RegionMember("seoul-northeast", "동북", "11", "서울특별시", "11320", "도봉구"),
    RegionMember("seoul-northeast", "동북", "11", "서울특별시", "11350", "노원구"),
    RegionMember("seoul-northwest", "서북", "11", "서울특별시", "11380", "은평구"),
    RegionMember("seoul-northwest", "서북", "11", "서울특별시", "11410", "서대문구"),
    RegionMember("seoul-northwest", "서북", "11", "서울특별시", "11440", "마포구"),
    RegionMember("seoul-southwest", "서남", "11", "서울특별시", "11470", "양천구"),
    RegionMember("seoul-southwest", "서남", "11", "서울특별시", "11500", "강서구"),
    RegionMember("seoul-southwest", "서남", "11", "서울특별시", "11530", "구로구"),
    RegionMember("seoul-southwest", "서남", "11", "서울특별시", "11545", "금천구"),
    RegionMember("seoul-southwest", "서남", "11", "서울특별시", "11560", "영등포구"),
    RegionMember("seoul-southwest", "서남", "11", "서울특별시", "11590", "동작구"),
    RegionMember("seoul-southwest", "서남", "11", "서울특별시", "11620", "관악구"),
    RegionMember("gyeonggi-east", "하남·구리·남양주", "41", "경기도", "41450", "하남시"),
    RegionMember("gyeonggi-east", "하남·구리·남양주", "41", "경기도", "41310", "구리시"),
    RegionMember("gyeonggi-east", "하남·구리·남양주", "41", "경기도", "41360", "남양주시"),
    RegionMember("gyeonggi-southeast", "성남·광주·이천·여주·양평", "41", "경기도", "41130", "성남시"),
    RegionMember("gyeonggi-southeast", "성남·광주·이천·여주·양평", "41", "경기도", "41610", "광주시"),
    RegionMember("gyeonggi-southeast", "성남·광주·이천·여주·양평", "41", "경기도", "41500", "이천시"),
    RegionMember("gyeonggi-southeast", "성남·광주·이천·여주·양평", "41", "경기도", "41670", "여주시"),
    RegionMember("gyeonggi-southeast", "성남·광주·이천·여주·양평", "41", "경기도", "41830", "양평군"),
    RegionMember("gyeonggi-south", "용인·수원·화성·오산·평택·안성", "41", "경기도", "41460", "용인시"),
    RegionMember("gyeonggi-south", "용인·수원·화성·오산·평택·안성", "41", "경기도", "41110", "수원시"),
    RegionMember("gyeonggi-south", "용인·수원·화성·오산·평택·안성", "41", "경기도", "41590", "화성시"),
    RegionMember("gyeonggi-south", "용인·수원·화성·오산·평택·안성", "41", "경기도", "41370", "오산시"),
    RegionMember("gyeonggi-south", "용인·수원·화성·오산·평택·안성", "41", "경기도", "41220", "평택시"),
    RegionMember("gyeonggi-south", "용인·수원·화성·오산·평택·안성", "41", "경기도", "41550", "안성시"),
    RegionMember("gyeonggi-southwest", "안양·군포·의왕·과천·광명·부천", "41", "경기도", "41170", "안양시"),
    RegionMember("gyeonggi-southwest", "안양·군포·의왕·과천·광명·부천", "41", "경기도", "41410", "군포시"),
    RegionMember("gyeonggi-southwest", "안양·군포·의왕·과천·광명·부천", "41", "경기도", "41430", "의왕시"),
    RegionMember("gyeonggi-southwest", "안양·군포·의왕·과천·광명·부천", "41", "경기도", "41290", "과천시"),
    RegionMember("gyeonggi-southwest", "안양·군포·의왕·과천·광명·부천", "41", "경기도", "41210", "광명시"),
    RegionMember("gyeonggi-southwest", "안양·군포·의왕·과천·광명·부천", "41", "경기도", "41190", "부천시"),
    RegionMember("gyeonggi-west", "시흥·안산", "41", "경기도", "41390", "시흥시"),
    RegionMember("gyeonggi-west", "시흥·안산", "41", "경기도", "41270", "안산시"),
    RegionMember("gyeonggi-northwest", "고양·파주·김포", "41", "경기도", "41280", "고양시"),
    RegionMember("gyeonggi-northwest", "고양·파주·김포", "41", "경기도", "41480", "파주시"),
    RegionMember("gyeonggi-northwest", "고양·파주·김포", "41", "경기도", "41570", "김포시"),
    RegionMember("gyeonggi-north", "의정부·양주·동두천·포천·연천·가평", "41", "경기도", "41150", "의정부시"),
    RegionMember("gyeonggi-north", "의정부·양주·동두천·포천·연천·가평", "41", "경기도", "41630", "양주시"),
    RegionMember("gyeonggi-north", "의정부·양주·동두천·포천·연천·가평", "41", "경기도", "41250", "동두천시"),
    RegionMember("gyeonggi-north", "의정부·양주·동두천·포천·연천·가평", "41", "경기도", "41650", "포천시"),
    RegionMember("gyeonggi-north", "의정부·양주·동두천·포천·연천·가평", "41", "경기도", "41800", "연천군"),
    RegionMember("gyeonggi-north", "의정부·양주·동두천·포천·연천·가평", "41", "경기도", "41820", "가평군"),
)

REGION_BY_SGG = {member.sgg_cd: member for member in REGION_MEMBERS}


def recent_probe_dates(days: int = 21, lag_days: int = 3) -> list[str]:
    today = datetime.now(UTC).date()
    return [
        (today - timedelta(days=lag_days + offset)).strftime("%Y%m%d")
        for offset in range(days)
    ]


def fetch_json(url: str, params: dict[str, str], timeout_seconds: float = 45.0) -> dict[str, Any]:
    with httpx.Client(timeout=timeout_seconds, follow_redirects=True) as client:
        response = client.get(url, params=params)
        response.raise_for_status()
        return response.json()


def fetch_molit_items(
    endpoint_name: str,
    params: dict[str, str],
    page_size: int = 100,
    timeout_seconds: float = 45.0,
) -> list[dict[str, Any]]:
    settings = get_settings()
    if not settings.data_go_kr_service_key:
        raise RuntimeError("DATA_GO_KR_SERVICE_KEY is not configured.")

    base_url = f"https://apis.data.go.kr/1613000/ODUsageforGeneralBusesandUrbanRailways/{endpoint_name}"
    page_no = 1
    rows: list[dict[str, Any]] = []

    while True:
        payload = fetch_json(
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


def find_available_service_date() -> str:
    settings = get_settings()
    if not settings.data_go_kr_service_key:
        raise RuntimeError("DATA_GO_KR_SERVICE_KEY is not configured.")

    base_url = (
        "https://apis.data.go.kr/1613000/ODUsageforGeneralBusesandUrbanRailways/"
        f"{MOLIT_DAILY_SOURCE}"
    )
    for service_date in recent_probe_dates():
        try:
            payload = fetch_json(
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


def _context_label(item: dict[str, Any], direction: str) -> str:
    if direction == "outbound":
        return f"{item.get('arvl_sgg_nm', '')} {item.get('arvl_emd_nm', '')}".strip()
    return f"{item.get('dptre_sgg_nm', '')} {item.get('dptre_emd_nm', '')}".strip()


def capture_daily_materialization(service_date: str | None = None) -> dict[str, Any]:
    service_date = service_date or find_available_service_date()
    direction_buckets: dict[str, dict[str, dict[str, Any]]] = {
        "outbound:zone": {},
        "inbound:zone": {},
        "outbound:sgg": {},
        "inbound:sgg": {},
    }

    for member in REGION_MEMBERS:
        outbound_items = fetch_molit_items(
            MOLIT_DAILY_SOURCE,
            {
                "opr_ymd": service_date,
                "dptre_ctpv_cd": FOCUS_CTPV_CD,
                "dptre_sgg_cd": FOCUS_SGG_CD,
                "arvl_ctpv_cd": member.ctpv_cd,
                "arvl_sgg_cd": member.sgg_cd,
            },
        )
        inbound_items = fetch_molit_items(
            MOLIT_DAILY_SOURCE,
            {
                "opr_ymd": service_date,
                "dptre_ctpv_cd": member.ctpv_cd,
                "dptre_sgg_cd": member.sgg_cd,
                "arvl_ctpv_cd": FOCUS_CTPV_CD,
                "arvl_sgg_cd": FOCUS_SGG_CD,
            },
        )

        for direction, items in (("outbound", outbound_items), ("inbound", inbound_items)):
            scoped = [
                item for item in items
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
                context_totals[_context_label(item, direction)] += int(item.get("trfvlm", 0) or 0)

            top_context_label, top_context_count = max(context_totals.items(), key=lambda pair: pair[1])

            zone_key = f"{direction}:zone"
            zone_bucket = direction_buckets[zone_key]
            zone_row = zone_bucket.get(member.zone_id)
            if zone_row is None:
                zone_bucket[member.zone_id] = {
                    "direction": direction,
                    "aggregationLevel": "zone",
                    "targetZoneId": member.zone_id,
                    "targetLabel": member.zone_name,
                    "targetCtpvCd": member.ctpv_cd,
                    "targetSggCd": member.sgg_cd,
                    "topContextLabel": top_context_label,
                    "topContextCount": top_context_count,
                    "passengerCount": passenger_count,
                }
            else:
                zone_row["passengerCount"] += passenger_count
                if top_context_count > zone_row["topContextCount"]:
                    zone_row["topContextLabel"] = top_context_label
                    zone_row["topContextCount"] = top_context_count

            sgg_key = f"{direction}:sgg"
            sgg_bucket = direction_buckets[sgg_key]
            sgg_bucket[member.sgg_cd] = {
                "direction": direction,
                "aggregationLevel": "sgg",
                "targetZoneId": member.zone_id,
                "targetLabel": member.sgg_name,
                "targetCtpvCd": member.ctpv_cd,
                "targetSggCd": member.sgg_cd,
                "topContextLabel": top_context_label,
                "topContextCount": top_context_count,
                "passengerCount": passenger_count,
            }

    daily_rows: list[dict[str, Any]] = []
    for bucket_key, bucket in direction_buckets.items():
        values = sorted(bucket.values(), key=lambda row: row["passengerCount"], reverse=True)
        total = sum(row["passengerCount"] for row in values)
        for row in values:
            daily_rows.append(
                {
                    **row,
                    "sharePct": round((row["passengerCount"] / total) * 100, 1) if total else 0.0,
                }
            )

    return {
        "capturedAt": datetime.now(UTC).isoformat(),
        "serviceDate": f"{service_date[:4]}-{service_date[4:6]}-{service_date[6:8]}",
        "sourceName": MOLIT_DAILY_SOURCE,
        "focusArea": {
            "ctpvCd": FOCUS_CTPV_CD,
            "sggCd": FOCUS_SGG_CD,
            "emdName": FOCUS_EMD_NAME,
        },
        "dailyRows": daily_rows,
        "fallbackUsed": False,
    }


def build_zone_snapshots_from_materialization(payload: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    service_date = payload["serviceDate"]
    zone_rows = [row for row in payload["dailyRows"] if row["aggregationLevel"] == "zone"]

    def _build(direction: str) -> dict[str, Any]:
        rows = [
            {
                "zoneName": row["targetLabel"],
                "passengerCount": row["passengerCount"],
                "sharePct": row["sharePct"],
                "topContextLabel": row["topContextLabel"],
            }
            for row in zone_rows
            if row["direction"] == direction
        ]
        return {
            "data": {
                "station": {
                    "stationId": "sangil-5-551",
                    "stationName": "상일동역",
                    "lineName": "5호선",
                    "operatorName": "서울교통공사",
                    "zoneName": "강동·송파",
                    "cityDo": "서울특별시",
                    "sigungu": "강동구",
                },
                "analysisScope": {
                    "scopeType": "living_zone",
                    "scopeLabel": "상일동 생활권",
                    "focusAreaLabel": "서울특별시 강동구 상일동",
                    "description": "공개 OD API가 역 단위가 아니라 읍면동 기반이므로, 상일동 생활권(상일동)을 기준으로 대중교통 이동을 해석합니다.",
                },
                "dateRange": {"from": service_date, "to": service_date},
                "rows": rows,
            },
            "meta": {
                "sourceNames": [MOLIT_DAILY_SOURCE],
                "grainLabel": "emd_based_public_transit_od",
                "lastLoadedAt": payload["capturedAt"],
                "dateRange": {"from": service_date, "to": service_date},
                "limitations": [
                    "공개 OD API는 상일동역 역-역 이동이 아니라 상일동(읍면동) 생활권 기준 대중교통 OD입니다.",
                    "OD에는 일반버스와 도시철도가 함께 포함됩니다.",
                ],
                "queryEcho": {"direction": direction, "focusArea": "서울특별시 강동구 상일동"},
                "fallbackUsed": False,
            },
        }

    return _build("outbound"), _build("inbound")


def capture_15min_materialization(
    service_date: str,
    daily_rows: list[dict[str, Any]],
    top_n: int = 4,
    tracked_hours: tuple[int, ...] = (6, 7, 8, 17, 18, 19),
) -> dict[str, Any]:
    target_member_codes: dict[str, set[str]] = {"outbound": set(), "inbound": set()}
    for direction in ("outbound", "inbound"):
        direction_rows = [row for row in daily_rows if row["direction"] == direction]
        top_zone_ids = {
            row["targetZoneId"]
            for row in direction_rows
            if row["aggregationLevel"] == "zone"
        }
        top_zone_ids = set(list(top_zone_ids)[:top_n])
        top_sgg_codes = [
            row["targetSggCd"]
            for row in direction_rows
            if row["aggregationLevel"] == "sgg"
        ][:top_n]

        for member in REGION_MEMBERS:
            if member.zone_id in top_zone_ids or member.sgg_cd in top_sgg_codes:
                target_member_codes[direction].add(member.sgg_cd)

    hourly_buckets: dict[tuple[str, str, str, str], int] = defaultdict(int)
    for direction, member_codes in target_member_codes.items():
        for sgg_code in member_codes:
            member = REGION_BY_SGG[sgg_code]
            for hour in tracked_hours:
                for quarter in ("00", "15", "30", "45"):
                    items = fetch_molit_items(
                        MOLIT_15MIN_SOURCE,
                        {
                            "opr_ymd": service_date.replace("-", ""),
                            "dptre_ctpv_cd": FOCUS_CTPV_CD if direction == "outbound" else member.ctpv_cd,
                            "dptre_sgg_cd": FOCUS_SGG_CD if direction == "outbound" else member.sgg_cd,
                            "arvl_ctpv_cd": member.ctpv_cd if direction == "outbound" else FOCUS_CTPV_CD,
                            "arvl_sgg_cd": member.sgg_cd if direction == "outbound" else FOCUS_SGG_CD,
                            "tzon": f"{hour:02d}",
                            "qtrp": quarter,
                        },
                        timeout_seconds=25.0,
                    )
                    scoped = [
                        item for item in items
                        if (
                            item.get("dptre_emd_nm") == FOCUS_EMD_NAME
                            if direction == "outbound"
                            else item.get("arvl_emd_nm") == FOCUS_EMD_NAME
                        )
                    ]
                    if not scoped:
                        continue
                    passenger_count = sum(int(item.get("pasg_cnt", 0) or 0) for item in scoped)
                    hour_bucket = f"{hour:02d}:00"
                    hourly_buckets[(direction, "zone", member.zone_id, hour_bucket)] += passenger_count
                    hourly_buckets[(direction, "sgg", member.sgg_cd, hour_bucket)] += passenger_count

    rows: list[dict[str, Any]] = []
    for (direction, aggregation_level, target_id, hour_bucket), passenger_count in sorted(hourly_buckets.items()):
        member = REGION_BY_SGG[target_id] if aggregation_level == "sgg" else next(
            member for member in REGION_MEMBERS if member.zone_id == target_id
        )
        rows.append(
            {
                "direction": direction,
                "aggregationLevel": aggregation_level,
                "referenceZoneId": member.zone_id,
                "referenceSggCd": member.sgg_cd if aggregation_level == "sgg" else None,
                "referenceLabel": member.sgg_name if aggregation_level == "sgg" else member.zone_name,
                "hourBucket": hour_bucket,
                "passengerCount": passenger_count,
            }
        )

    return {
        "capturedAt": datetime.now(UTC).isoformat(),
        "serviceDate": service_date,
        "sourceName": MOLIT_15MIN_SOURCE,
        "focusArea": {"ctpvCd": FOCUS_CTPV_CD, "sggCd": FOCUS_SGG_CD, "emdName": FOCUS_EMD_NAME},
        "trackedHours": [f"{hour:02d}:00" for hour in tracked_hours],
        "rows": rows,
        "fallbackUsed": False,
    }
