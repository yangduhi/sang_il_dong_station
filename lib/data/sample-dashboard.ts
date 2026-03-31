import type {
  DataQualitySummaryResponse,
  HealthResponse,
  HourlyProfileResponse,
  OdOriginToZoneResponse,
  OdZoneToDestinationResponse,
  StationOverviewResponse
} from "@/lib/schemas/responses";
import { sangilLivingZone, sangilStation, sangilStationScope, zoneNames } from "@/lib/data/analysis-config";

const dateRange = {
  from: "2026-03-18",
  to: "2026-03-31"
};

export const sampleOverview: StationOverviewResponse = {
  data: {
    station: sangilStation,
    analysisScope: sangilStationScope,
    kpis: {
      latestRideCount: 18234,
      latestAlightCount: 17642,
      rollingSevenDayAverage: 35122,
      weekOverWeekDeltaPct: 4.8
    },
    trend: ([
      ["2026-03-18", 16904, 16311],
      ["2026-03-19", 17180, 16540],
      ["2026-03-20", 17444, 16850],
      ["2026-03-21", 11220, 11870],
      ["2026-03-22", 10984, 11610],
      ["2026-03-23", 17650, 17022],
      ["2026-03-24", 17890, 17214],
      ["2026-03-25", 17942, 17320],
      ["2026-03-26", 18084, 17412],
      ["2026-03-27", 18105, 17530],
      ["2026-03-28", 11692, 12118],
      ["2026-03-29", 11488, 11984],
      ["2026-03-30", 18192, 17611],
      ["2026-03-31", 18234, 17642]
    ] as Array<[string, number, number]>).map(([serviceDate, rideCount, alightCount]) => ({
      serviceDate,
      rideCount,
      alightCount
    })),
    qualitySummary: {
      freshnessHours: 12,
      stationMatchRate: 99.1,
      zoneMappingFailureRate: 0.6,
      quarantineRate: 0.4
    }
  },
  meta: {
    sourceNames: ["sample-ridership-fixture", "sample-area-od-fixture"],
    grainLabel: "station_daily + living_zone_od",
    lastLoadedAt: "2026-03-31T07:30:00+09:00",
    dateRange,
    limitations: [
      "기본값은 curated sample data 입니다.",
      "OD는 상일동역이 아니라 상일동 생활권 기준으로 해석한 예시입니다."
    ],
    queryEcho: {
      stationId: sangilStation.stationId
    },
    fallbackUsed: true
  }
};

export const sampleHourly: HourlyProfileResponse = {
  data: {
    station: sangilStation,
    analysisScope: sangilStationScope,
    weekdayType: "weekday",
    rows: ([
      ["05:00", 188, 120],
      ["06:00", 680, 392],
      ["07:00", 1400, 734],
      ["08:00", 2012, 950],
      ["09:00", 1233, 1014],
      ["10:00", 744, 893],
      ["11:00", 610, 780],
      ["12:00", 680, 820],
      ["13:00", 722, 840],
      ["14:00", 760, 862],
      ["15:00", 814, 900],
      ["16:00", 930, 1018],
      ["17:00", 1180, 1320],
      ["18:00", 1460, 1652],
      ["19:00", 1212, 1494],
      ["20:00", 994, 1224],
      ["21:00", 770, 980],
      ["22:00", 490, 650],
      ["23:00", 212, 288]
    ] as Array<[string, number, number]>).map(([hourBucket, rideCount, alightCount]) => ({
      hourBucket,
      rideCount,
      alightCount
    }))
  },
  meta: sampleOverview.meta
};

export const sampleOriginToZone: OdOriginToZoneResponse = {
  data: {
    station: sangilStation,
    analysisScope: sangilLivingZone,
    dateRange,
    rows: [
      { zoneName: "강남·서초", passengerCount: 6480, sharePct: 31.2, topContextLabel: "강남구 역삼동" },
      { zoneName: "강동·송파", passengerCount: 4912, sharePct: 23.7, topContextLabel: "송파구 잠실동" },
      { zoneName: "하남·구리·남양주", passengerCount: 3010, sharePct: 14.5, topContextLabel: "하남시 풍산동" },
      { zoneName: "도심(종로·중구·용산)", passengerCount: 2422, sharePct: 11.7, topContextLabel: "종로구 세종로" },
      { zoneName: "동북", passengerCount: 1810, sharePct: 8.7, topContextLabel: "광진구 자양동" },
      { zoneName: "서남", passengerCount: 980, sharePct: 4.7, topContextLabel: "영등포구 당산동" },
      { zoneName: "서북", passengerCount: 664, sharePct: 3.2, topContextLabel: "마포구 서교동" },
      { zoneName: "기타", passengerCount: 470, sharePct: 2.3, topContextLabel: "기타 권역" }
    ]
  },
  meta: sampleOverview.meta
};

export const sampleZoneToDestination: OdZoneToDestinationResponse = {
  data: {
    station: sangilStation,
    analysisScope: sangilLivingZone,
    dateRange,
    rows: [
      { zoneName: "강동·송파", passengerCount: 6220, sharePct: 29.9, topContextLabel: "송파구 잠실동" },
      { zoneName: "하남·구리·남양주", passengerCount: 4460, sharePct: 21.5, topContextLabel: "하남시 덕풍동" },
      { zoneName: "강남·서초", passengerCount: 3950, sharePct: 19.0, topContextLabel: "서초구 서초동" },
      { zoneName: "도심(종로·중구·용산)", passengerCount: 2472, sharePct: 11.9, topContextLabel: "종로구 세종로" },
      { zoneName: "동북", passengerCount: 1884, sharePct: 9.1, topContextLabel: "광진구 자양동" },
      { zoneName: "서남", passengerCount: 1010, sharePct: 4.9, topContextLabel: "영등포구 당산동" },
      { zoneName: "서북", passengerCount: 430, sharePct: 2.1, topContextLabel: "마포구 합정동" },
      { zoneName: "기타", passengerCount: 354, sharePct: 1.7, topContextLabel: "기타 권역" }
    ]
  },
  meta: sampleOverview.meta
};

export const sampleQuality: DataQualitySummaryResponse = {
  data: {
    station: sangilStation,
    analysisScopes: [sangilStationScope, sangilLivingZone],
    dataMode: "local",
    sourceMode: "sample",
    warnings: [
      "현재 화면은 local/sample fallback 으로 구동되고 있습니다.",
      "승하차는 역 단위, OD는 생활권 단위로 해석된 예시입니다."
    ],
    metrics: [
      { label: "Data mode", value: "local", status: "warning" },
      { label: "Source mode", value: "sample", status: "warning" },
      { label: "Ridership scope", value: "상일동역", status: "good" },
      { label: "OD scope", value: "상일동 생활권", status: "warning" },
      { label: "Freshness", value: "12h", status: "good" },
      { label: "Quarantine ratio", value: "0.4%", status: "warning" }
    ]
  },
  meta: sampleOverview.meta
};

export const sampleHealth: HealthResponse = {
  data: {
    status: "ok",
    app: "Sangil-dong Station Dashboard",
    version: "0.1.0",
    env: "development",
    dataMode: "local",
    sourceMode: "sample",
    python: {
      required: "3.11.x",
      venvPath: ".venv\\Scripts\\python.exe"
    },
    db: {
      configured: false,
      mode: "local"
    }
  },
  meta: {
    sourceNames: ["application-runtime"],
    grainLabel: "not_applicable",
    lastLoadedAt: "2026-03-31T07:30:00+09:00",
    dateRange: {
      from: "",
      to: ""
    },
    limitations: [
      "Health check does not verify live database connectivity in local mode."
    ],
    queryEcho: {},
    fallbackUsed: true
  }
};

export const sampleStations = [sangilStation];
export const sampleZones = [...zoneNames, "기타"];
