import type {
  DataQualitySummaryResponse,
  HealthResponse,
  HourlyProfileResponse,
  OdOriginToZoneResponse,
  OdZoneToDestinationResponse,
  StationOverviewResponse
} from "@/lib/schemas/responses";

const station = {
  stationId: "sangil-5-551",
  stationName: "상일동역",
  lineName: "5호선",
  operatorName: "서울교통공사",
  zoneName: "강동·송파",
  cityDo: "서울특별시",
  sigungu: "강동구"
};

const dateRange = {
  from: "2026-03-18",
  to: "2026-03-31"
};

export const sampleOverview: StationOverviewResponse = {
  data: {
    station,
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
    sourceNames: ["sample-ridership-fixture", "sample-od-fixture"],
    grainLabel: "station_to_zone",
    lastLoadedAt: "2026-03-31T07:30:00+09:00",
    dateRange,
    limitations: [
      "기본값은 curated sample data 이며 live source 검증은 아직 완료되지 않았습니다.",
      "OD grain 은 mixed-grain 대응 구조로 설계되어 있습니다."
    ],
    queryEcho: {
      stationId: station.stationId
    },
    fallbackUsed: true
  }
};

export const sampleHourly: HourlyProfileResponse = {
  data: {
    station,
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
    station,
    dateRange,
    rows: [
      { zoneName: "강남·서초", passengerCount: 6480, sharePct: 31.2, topStationName: "강남역" },
      { zoneName: "강동·송파", passengerCount: 4912, sharePct: 23.7, topStationName: "잠실역" },
      { zoneName: "하남·구리·남양주", passengerCount: 3010, sharePct: 14.5, topStationName: "하남풍산역" },
      { zoneName: "도심(종로·중구·용산)", passengerCount: 2422, sharePct: 11.7, topStationName: "광화문역" },
      { zoneName: "동북", passengerCount: 1810, sharePct: 8.7, topStationName: "군자역" },
      { zoneName: "서남", passengerCount: 980, sharePct: 4.7, topStationName: "영등포구청역" },
      { zoneName: "서북", passengerCount: 664, sharePct: 3.2, topStationName: "홍대입구역" },
      { zoneName: "기타", passengerCount: 470, sharePct: 2.3, topStationName: "기타" }
    ]
  },
  meta: sampleOverview.meta
};

export const sampleZoneToDestination: OdZoneToDestinationResponse = {
  data: {
    station,
    dateRange,
    rows: [
      { zoneName: "강동·송파", passengerCount: 6220, sharePct: 29.9, topStationName: "잠실역" },
      { zoneName: "하남·구리·남양주", passengerCount: 4460, sharePct: 21.5, topStationName: "하남검단산역" },
      { zoneName: "강남·서초", passengerCount: 3950, sharePct: 19.0, topStationName: "교대역" },
      { zoneName: "도심(종로·중구·용산)", passengerCount: 2472, sharePct: 11.9, topStationName: "광화문역" },
      { zoneName: "동북", passengerCount: 1884, sharePct: 9.1, topStationName: "건대입구역" },
      { zoneName: "서남", passengerCount: 1010, sharePct: 4.9, topStationName: "당산역" },
      { zoneName: "서북", passengerCount: 430, sharePct: 2.1, topStationName: "합정역" },
      { zoneName: "기타", passengerCount: 354, sharePct: 1.7, topStationName: "기타" }
    ]
  },
  meta: sampleOverview.meta
};

export const sampleQuality: DataQualitySummaryResponse = {
  data: {
    station,
    dataMode: "local",
    sourceMode: "sample",
    warnings: [
      "현재 화면은 local/sample fallback 으로 구동되고 있습니다.",
      "live source 의 실제 API 응답은 service key 제공 후 재검증이 필요합니다."
    ],
    metrics: [
      { label: "Data mode", value: "local", status: "warning" },
      { label: "Source mode", value: "sample", status: "warning" },
      { label: "Freshness", value: "12h", status: "good" },
      { label: "Station match rate", value: "99.1%", status: "good" },
      { label: "Zone mapping failure", value: "0.6%", status: "good" },
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

export const sampleStations = [station];

export const sampleZones = [
  "강동·송파",
  "강남·서초",
  "도심(종로·중구·용산)",
  "동북",
  "서북",
  "서남",
  "하남·구리·남양주",
  "기타"
];
