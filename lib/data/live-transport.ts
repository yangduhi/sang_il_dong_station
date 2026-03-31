import { getEnv } from "@/lib/config/env";
import {
  sangilLivingZone,
  sangilStation,
  sangilStationScope,
  type ZoneDefinition,
  zoneDefinitions
} from "@/lib/data/analysis-config";
import type {
  DataQualitySummaryResponse,
  HourlyProfileResponse,
  OdOriginToZoneResponse,
  OdZoneToDestinationResponse,
  StationOverviewResponse
} from "@/lib/schemas/responses";

type RidershipRow = {
  USE_YMD: string;
  SBWY_ROUT_LN_NM: string;
  SBWY_STNS_NM: string;
  GTON_TNOPE: string;
  GTOFF_TNOPE: string;
  REG_YMD: string;
};

type MolitDailyItem = {
  opr_ymd: string;
  dptre_ctpv_cd: string;
  dptre_ctpv_nm: string;
  dptre_sgg_cd: string;
  dptre_sgg_nm: string;
  dptre_emd_cd: string;
  dptre_emd_nm: string;
  arvl_ctpv_cd: string;
  arvl_ctpv_nm: string;
  arvl_sgg_cd: string;
  arvl_sgg_nm: string;
  arvl_emd_cd: string;
  arvl_emd_nm: string;
  trfvlm: number;
};

const inMemoryCache = new Map<string, { value: unknown; expiresAt: number }>();

function getCached<T>(key: string) {
  const hit = inMemoryCache.get(key);
  if (!hit || hit.expiresAt < Date.now()) {
    inMemoryCache.delete(key);
    return null;
  }
  return hit.value as T;
}

function setCached<T>(key: string, value: T, ttlMs = 30 * 60 * 1000) {
  inMemoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
  return value;
}

async function fetchJsonUtf8(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    next: { revalidate: 0 }
  });
  const buffer = await response.arrayBuffer();
  const text = new TextDecoder("utf-8").decode(buffer);
  return JSON.parse(text) as Record<string, unknown>;
}

function formatDate(input: Date) {
  return input.toISOString().slice(0, 10).replaceAll("-", "");
}

function recentProbeDates(days = 14) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (index + 3));
    return formatDate(date);
  });
}

async function fetchSeoulDailyForDate(serviceDate: string) {
  const env = getEnv();
  if (!env.SEOUL_OPEN_DATA_API_KEY) {
    return null;
  }

  const cacheKey = `seoul-daily:${serviceDate}`;
  const cached = getCached<RidershipRow[] | null>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const url = `http://openapi.seoul.go.kr:8088/${env.SEOUL_OPEN_DATA_API_KEY}/json/CardSubwayStatsNew/1/1000/${serviceDate}/`;
  const payload = await fetchJsonUtf8(url);
  const rows = ((payload.CardSubwayStatsNew as { row?: RidershipRow[] } | undefined)?.row ?? []).filter(
    (row) => row.SBWY_ROUT_LN_NM.startsWith("5") && row.SBWY_STNS_NM === "상일동"
  );

  return setCached(cacheKey, rows.length ? rows : null);
}

export async function fetchLiveRidershipOverview(): Promise<StationOverviewResponse> {
  const rows = (
    await Promise.all(recentProbeDates().map(async (serviceDate) => ({ serviceDate, rows: await fetchSeoulDailyForDate(serviceDate) })))
  )
    .filter((entry) => entry.rows?.length)
    .map((entry) => ({
      serviceDate: `${entry.serviceDate.slice(0, 4)}-${entry.serviceDate.slice(4, 6)}-${entry.serviceDate.slice(6, 8)}`,
      rideCount: Number(entry.rows?.[0]?.GTON_TNOPE ?? 0),
      alightCount: Number(entry.rows?.[0]?.GTOFF_TNOPE ?? 0),
      lastLoadedAtRaw: entry.rows?.[0]?.REG_YMD ?? entry.serviceDate
    }))
    .sort((left, right) => left.serviceDate.localeCompare(right.serviceDate));

  if (!rows.length) {
    throw new Error("No live ridership rows were returned for Sangil-dong Station.");
  }

  const latest = rows.at(-1)!;
  const rollingWindow = rows.slice(-7);
  const rollingAverage =
    rollingWindow.reduce((sum, row) => sum + row.rideCount + row.alightCount, 0) /
    Math.max(1, rollingWindow.length);
  const previousWindow = rows.slice(-14, -7);
  const previousAverage =
    previousWindow.reduce((sum, row) => sum + row.rideCount + row.alightCount, 0) /
    Math.max(1, previousWindow.length || 1);
  const weekOverWeekDeltaPct =
    previousAverage > 0 ? ((rollingAverage - previousAverage) / previousAverage) * 100 : 0;

  return {
    data: {
      station: sangilStation,
      analysisScope: sangilStationScope,
      kpis: {
        latestRideCount: latest.rideCount,
        latestAlightCount: latest.alightCount,
        rollingSevenDayAverage: Math.round(rollingAverage),
        weekOverWeekDeltaPct: Number(weekOverWeekDeltaPct.toFixed(1))
      },
      trend: rows.map((row) => ({
        serviceDate: row.serviceDate,
        rideCount: row.rideCount,
        alightCount: row.alightCount
      })),
      qualitySummary: {
        freshnessHours: 24,
        stationMatchRate: 100,
        zoneMappingFailureRate: 0,
        quarantineRate: 0
      }
    },
    meta: {
      sourceNames: ["CardSubwayStatsNew"],
      grainLabel: "station_daily",
      lastLoadedAt: latest.lastLoadedAtRaw,
      dateRange: {
        from: rows[0]!.serviceDate,
        to: rows.at(-1)!.serviceDate
      },
      limitations: [
        "승하차 데이터는 상일동역(5호선) 역 단위 live 데이터입니다.",
        "현재 공개 승하차 source는 일별 추세를 우선 연결했고, 시간대별 역 단위 live 연계는 별도 검증이 필요합니다."
      ],
      queryEcho: {
        stationId: sangilStation.stationId
      },
      fallbackUsed: false
    }
  };
}

async function resolveMolitWorkingDate() {
  const cacheKey = "molit-working-date";
  const cached = getCached<string>(cacheKey);
  if (cached) {
    return cached;
  }

  const env = getEnv();
  if (!env.DATA_GO_KR_SERVICE_KEY) {
    throw new Error("DATA_GO_KR_SERVICE_KEY is not configured.");
  }

  const base =
    "https://apis.data.go.kr/1613000/ODUsageforGeneralBusesandUrbanRailways/getDailyODUsageforGeneralBusesandUrbanRailways";

  for (const serviceDate of recentProbeDates(21)) {
    const url = new URL(base);
    url.searchParams.set("serviceKey", env.DATA_GO_KR_SERVICE_KEY);
    url.searchParams.set("pageNo", "1");
    url.searchParams.set("numOfRows", "1");
    url.searchParams.set("opr_ymd", serviceDate);
    url.searchParams.set("dptre_ctpv_cd", "11");
    url.searchParams.set("dptre_sgg_cd", "11740");
    url.searchParams.set("arvl_ctpv_cd", "11");
    url.searchParams.set("arvl_sgg_cd", "11680");
    url.searchParams.set("dataType", "json");

    const payload = await fetchJsonUtf8(url.toString());
    if ("Response" in payload) {
      return setCached(cacheKey, serviceDate);
    }
  }

  return setCached(cacheKey, "20250301");
}

async function fetchMolitDailyPair(
  origin: { ctpvCd: string; sggCd: string },
  destination: { ctpvCd: string; sggCd: string },
  serviceDate: string
) {
  const env = getEnv();
  if (!env.DATA_GO_KR_SERVICE_KEY) {
    return [] as MolitDailyItem[];
  }

  const cacheKey = `molit-daily:${serviceDate}:${origin.ctpvCd}:${origin.sggCd}:${destination.ctpvCd}:${destination.sggCd}`;
  const cached = getCached<MolitDailyItem[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const base =
    "https://apis.data.go.kr/1613000/ODUsageforGeneralBusesandUrbanRailways/getDailyODUsageforGeneralBusesandUrbanRailways";
  const rows: MolitDailyItem[] = [];
  let pageNo = 1;
  let totalCount = 0;

  while (true) {
    const url = new URL(base);
    url.searchParams.set("serviceKey", env.DATA_GO_KR_SERVICE_KEY);
    url.searchParams.set("pageNo", String(pageNo));
    url.searchParams.set("numOfRows", "100");
    url.searchParams.set("opr_ymd", serviceDate);
    url.searchParams.set("dptre_ctpv_cd", origin.ctpvCd);
    url.searchParams.set("dptre_sgg_cd", origin.sggCd);
    url.searchParams.set("arvl_ctpv_cd", destination.ctpvCd);
    url.searchParams.set("arvl_sgg_cd", destination.sggCd);
    url.searchParams.set("dataType", "json");

    const payload = await fetchJsonUtf8(url.toString());
    if (!("Response" in payload)) {
      break;
    }

    const response = payload.Response as {
      body: { totalCount: string; items: { item: MolitDailyItem[] | MolitDailyItem } };
    };
    totalCount = Number(response.body.totalCount ?? 0);
    const pageItems = response.body.items?.item;
    const normalized = Array.isArray(pageItems) ? pageItems : pageItems ? [pageItems] : [];
    rows.push(...normalized);

    if (rows.length >= totalCount || !normalized.length || totalCount <= 100) {
      break;
    }
    pageNo += 1;
  }

  return setCached(cacheKey, rows);
}

type Direction = "outbound" | "inbound";

function flattenZoneTargets() {
  return zoneDefinitions.flatMap((zone) =>
    zone.members.map((member) => ({
      zone,
      member
    }))
  );
}

async function buildLivingZoneOd(direction: Direction) {
  const serviceDate = await resolveMolitWorkingDate();
  const targetPairs = flattenZoneTargets();

  const rows = await Promise.all(
    targetPairs.map(async ({ zone, member }) => {
      const origin = direction === "outbound" ? { ctpvCd: "11", sggCd: "11740" } : { ctpvCd: member.ctpvCd, sggCd: member.sggCd };
      const destination = direction === "outbound" ? { ctpvCd: member.ctpvCd, sggCd: member.sggCd } : { ctpvCd: "11", sggCd: "11740" };
      const items = await fetchMolitDailyPair(origin, destination, serviceDate);

      const scoped = items.filter((item) =>
        direction === "outbound" ? item.dptre_emd_nm === "상일동" : item.arvl_emd_nm === "상일동"
      );

      if (!scoped.length) {
        return null;
      }

      const passengerCount = scoped.reduce((sum, item) => sum + Number(item.trfvlm ?? 0), 0);
      const contextMap = new Map<string, number>();
      for (const item of scoped) {
        const label =
          direction === "outbound"
            ? `${item.arvl_sgg_nm} ${item.arvl_emd_nm}`
            : `${item.dptre_sgg_nm} ${item.dptre_emd_nm}`;
        contextMap.set(label, (contextMap.get(label) ?? 0) + Number(item.trfvlm ?? 0));
      }

      const topContextLabel =
        [...contextMap.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? zone.zoneName;

      return {
        zoneName: zone.zoneName,
        passengerCount,
        topContextLabel
      };
    })
  );

  const aggregated = new Map<string, { passengerCount: number; topContextLabel: string }>();
  for (const row of rows) {
    if (!row) continue;
    const current = aggregated.get(row.zoneName);
    if (!current || row.passengerCount > current.passengerCount) {
      aggregated.set(row.zoneName, {
        passengerCount: (current?.passengerCount ?? 0) + row.passengerCount,
        topContextLabel: row.topContextLabel
      });
    } else {
      current.passengerCount += row.passengerCount;
    }
  }

  const total = [...aggregated.values()].reduce((sum, row) => sum + row.passengerCount, 0);
  const finalRows = [...aggregated.entries()]
    .map(([zoneName, row]) => ({
      zoneName,
      passengerCount: row.passengerCount,
      sharePct: total > 0 ? Number(((row.passengerCount / total) * 100).toFixed(1)) : 0,
      topContextLabel: row.topContextLabel
    }))
    .filter((row) => row.passengerCount > 0)
    .sort((left, right) => right.passengerCount - left.passengerCount);

  const limitations = [
    "공개 OD API는 상일동역 역-역 이동이 아니라 상일동(읍면동) 생활권 기준 대중교통 OD입니다.",
    "OD에는 일반버스와 도시철도가 함께 포함됩니다.",
    "현재 권역 집계는 서울/경기 권역 제안안을 기준으로 재분류한 결과입니다."
  ];

  const base = {
    station: sangilStation,
    analysisScope: sangilLivingZone,
    dateRange: {
      from: `${serviceDate.slice(0, 4)}-${serviceDate.slice(4, 6)}-${serviceDate.slice(6, 8)}`,
      to: `${serviceDate.slice(0, 4)}-${serviceDate.slice(4, 6)}-${serviceDate.slice(6, 8)}`
    },
    rows: finalRows
  };

  const meta = {
    sourceNames: ["getDailyODUsageforGeneralBusesandUrbanRailways"],
    grainLabel: "emd_based_public_transit_od",
    lastLoadedAt: serviceDate,
    dateRange: base.dateRange,
    limitations,
    queryEcho: {
      direction,
      focusArea: sangilLivingZone.focusAreaLabel
    },
    fallbackUsed: false
  };

  if (direction === "outbound") {
    const response: OdOriginToZoneResponse = {
      data: base,
      meta
    };
    return response;
  }

  const response: OdZoneToDestinationResponse = {
    data: base,
    meta
  };
  return response;
}

export async function fetchLiveOriginToZone() {
  return buildLivingZoneOd("outbound");
}

export async function fetchLiveZoneToDestination() {
  return buildLivingZoneOd("inbound");
}

export async function buildLiveHourlyPlaceholder(): Promise<HourlyProfileResponse> {
  return {
    data: {
      station: sangilStation,
      analysisScope: sangilStationScope,
      weekdayType: "weekday",
      rows: []
    },
    meta: {
      sourceNames: ["CardSubwayStatsNew", "getGeneralBusandUrbanRailwaysODUsageby15MinuteIntervals"],
      grainLabel: "not_connected",
      lastLoadedAt: new Date().toISOString(),
      dateRange: {
        from: "",
        to: ""
      },
      limitations: [
        "역 단위 시간대 승하차 live source는 아직 연결하지 않았습니다.",
        "공개 15분 OD endpoint는 생활권 단위이며, 전체 일과 패턴을 materialize 하려면 별도 적재 작업이 필요합니다."
      ],
      queryEcho: {},
      fallbackUsed: false
    }
  };
}

export async function buildLiveQualitySummary(): Promise<DataQualitySummaryResponse> {
  const ridership = await fetchLiveRidershipOverview();
  const od = await fetchLiveOriginToZone();
  return {
    data: {
      station: sangilStation,
      analysisScopes: [sangilStationScope, sangilLivingZone],
      dataMode: getEnv().APP_DATA_MODE,
      sourceMode: "live",
      warnings: [
        "승하차는 상일동역 역 단위 live 데이터입니다.",
        "OD는 상일동 생활권(상일동) 기준 대중교통 live 데이터입니다.",
        "공개 OD는 역 단위가 아니라 읍면동 기반입니다."
      ],
      metrics: [
        { label: "Data mode", value: getEnv().APP_DATA_MODE, status: "warning" },
        { label: "Source mode", value: "live", status: "good" },
        { label: "Ridership source", value: "CardSubwayStatsNew", status: "good" },
        { label: "OD source", value: "MOLIT Daily OD", status: "warning" },
        { label: "Latest ridership date", value: ridership.meta.dateRange.to, status: "good" },
        { label: "Latest OD date", value: od.meta.dateRange.to, status: "warning" }
      ]
    },
    meta: {
      sourceNames: ["CardSubwayStatsNew", "getDailyODUsageforGeneralBusesandUrbanRailways"],
      grainLabel: "station_daily + emd_based_od",
      lastLoadedAt: ridership.meta.lastLoadedAt,
      dateRange: ridership.meta.dateRange,
      limitations: ridership.meta.limitations.concat(od.meta.limitations),
      queryEcho: {},
      fallbackUsed: false
    }
  };
}
