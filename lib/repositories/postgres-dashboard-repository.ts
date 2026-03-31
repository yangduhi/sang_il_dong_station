import type { Pool } from "pg";
import { getEnv } from "@/lib/config/env";
import { sangilLivingZone, sangilStation, sangilStationScope } from "@/lib/data/analysis-config";
import { getDbPool } from "@/lib/db/client";
import type { DashboardRepository } from "@/lib/repositories/dashboard-repository";
import { LocalDashboardRepository } from "@/lib/repositories/local-dashboard-repository";

const localFallback = new LocalDashboardRepository();

type AggregationLevel = "zone" | "sgg";

type StationRow = {
  station_id: string;
  station_name: string;
  line_name: string;
  operator_name: string;
  city_do: string | null;
  sigungu: string | null;
  zone_name: string | null;
};

type StationDailyRow = {
  service_date: string;
  ride_count: number;
  alight_count: number;
  loaded_at: Date | string;
  source_name: string;
};

type LivingZoneDailyRow = {
  target_label: string;
  top_context_label: string;
  passenger_count: number;
  share_pct: string | number;
  loaded_at: Date | string;
  source_name: string;
};

type LivingZone15MinuteRow = {
  hour_bucket: string;
  direction: "outbound" | "inbound";
  passenger_count: number;
  loaded_at: Date | string;
  source_name: string;
};

function resolveAggregationLevel(query: Record<string, unknown>): AggregationLevel {
  return query.aggregationLevel === "sgg" ? "sgg" : "zone";
}

function toIsoString(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function buildStationPayload(row?: StationRow | null) {
  if (!row) {
    return sangilStation;
  }

  return {
    stationId: row.station_id,
    stationName: row.station_name,
    lineName: row.line_name,
    operatorName: row.operator_name,
    zoneName: row.zone_name ?? sangilStation.zoneName,
    cityDo: row.city_do ?? sangilStation.cityDo,
    sigungu: row.sigungu ?? sangilStation.sigungu
  };
}

async function getStationMeta(pool: Pool, stationId: string) {
  const result = await pool.query<StationRow>(
    `
    select
      s.station_id,
      s.station_name,
      s.line_name,
      s.operator_name,
      s.city_do,
      s.sigungu,
      z.zone_name
    from public.dim_station s
    left join public.dim_zone z on z.zone_id = s.zone_id
    where s.station_id = $1
    limit 1
    `,
    [stationId]
  );

  return result.rows[0] ?? null;
}

function buildStationOverviewLimitations(hasRows: boolean) {
  if (!hasRows) {
    return [
      "Postgres mode is enabled, but no station_daily facts are materialized yet.",
      "Run the DB ETL before relying on the dashboard."
    ];
  }

  return [
    "Dashboard reads materialized station_daily facts from Postgres only.",
    "Station trend does not call the public API at request time."
  ];
}

function buildLivingZoneLimitations(include15MinuteNote: boolean, aggregationLevel: AggregationLevel) {
  const label = aggregationLevel === "sgg" ? "sgg" : "zone";
  const limitations = [
    "Dashboard reads materialized living-zone OD facts from Postgres only.",
    "Living-zone OD is based on Sangil-dong area public-transit flow, not station-to-station OD.",
    `Current OD response is aggregated at ${label} level.`
  ];

  if (include15MinuteNote) {
    limitations.push(
      "15-minute OD batches are optional and quota-aware. Empty hourly data means the last 15-minute materialization has not been captured yet."
    );
  }

  return limitations;
}

export class PostgresDashboardRepository implements DashboardRepository {
  async getHealth() {
    const pool = getDbPool();
    if (!pool) {
      return localFallback.getHealth();
    }

    const [stationCount, dailyOdCount, fifteenCount, latestLoad] = await Promise.all([
      pool.query<{ count: string }>("select count(*)::text as count from public.fact_station_daily"),
      pool.query<{ count: string }>("select count(*)::text as count from public.fact_living_zone_od_daily"),
      pool.query<{ count: string }>("select count(*)::text as count from public.fact_living_zone_od_15min"),
      pool.query<{ last_loaded_at: Date | null }>(
        `
        select max(last_loaded_at) as last_loaded_at
        from (
          select max(loaded_at) as last_loaded_at from public.fact_station_daily
          union all
          select max(loaded_at) as last_loaded_at from public.fact_living_zone_od_daily
          union all
          select max(loaded_at) as last_loaded_at from public.fact_living_zone_od_15min
        ) materialized_loads
        `
      )
    ]);

    return {
      data: {
        status: "ok" as const,
        app: getEnv().APP_NAME,
        version: "0.1.0",
        env: getEnv().NODE_ENV,
        dataMode: "postgres" as const,
        sourceMode: getEnv().APP_SOURCE_MODE,
        python: {
          required: "3.11.x",
          venvPath: ".venv\\Scripts\\python.exe"
        },
        db: {
          configured: true,
          mode: "postgres" as const
        }
      },
      meta: {
        sourceNames: ["fact_station_daily", "fact_living_zone_od_daily", "fact_living_zone_od_15min"],
        grainLabel: "db_materialized_dashboard",
        lastLoadedAt: toIsoString(latestLoad.rows[0]?.last_loaded_at) || new Date().toISOString(),
        dateRange: { from: "", to: "" },
        limitations: [
          `station_daily rows: ${stationCount.rows[0]?.count ?? "0"}`,
          `living_zone_od_daily rows: ${dailyOdCount.rows[0]?.count ?? "0"}`,
          `living_zone_od_15min rows: ${fifteenCount.rows[0]?.count ?? "0"}`
        ],
        queryEcho: {},
        fallbackUsed: false
      }
    };
  }

  async getStationOverview(stationId: string, query: Record<string, unknown>) {
    const pool = getDbPool();
    if (!pool) {
      return localFallback.getStationOverview(stationId, query);
    }

    const stationMeta = await getStationMeta(pool, stationId);
    const params: unknown[] = [stationId];
    let whereClause = "where station_id = $1";

    if (typeof query.from === "string") {
      params.push(query.from);
      whereClause += ` and service_date >= $${params.length}`;
    }
    if (typeof query.to === "string") {
      params.push(query.to);
      whereClause += ` and service_date <= $${params.length}`;
    }

    const result = await pool.query<StationDailyRow>(
      `
      select service_date::text, ride_count, alight_count, loaded_at, source_name
      from public.fact_station_daily
      ${whereClause}
      order by service_date asc
      `,
      params
    );

    const rows = (typeof query.from === "string" || typeof query.to === "string")
      ? result.rows
      : result.rows.slice(-14);

    const latest = rows.at(-1);
    const rollingWindow = rows.slice(-7);
    const previousWindow = rows.slice(-14, -7);
    const rollingAverage = rollingWindow.length
      ? rollingWindow.reduce((sum, row) => sum + row.ride_count + row.alight_count, 0) / rollingWindow.length
      : 0;
    const previousAverage = previousWindow.length
      ? previousWindow.reduce((sum, row) => sum + row.ride_count + row.alight_count, 0) / previousWindow.length
      : 0;

    return {
      data: {
        station: buildStationPayload(stationMeta),
        analysisScope: sangilStationScope,
        kpis: {
          latestRideCount: latest?.ride_count ?? 0,
          latestAlightCount: latest?.alight_count ?? 0,
          rollingSevenDayAverage: Math.round(rollingAverage),
          weekOverWeekDeltaPct: previousAverage > 0 ? Number((((rollingAverage - previousAverage) / previousAverage) * 100).toFixed(1)) : 0
        },
        trend: rows.map((row) => ({
          serviceDate: row.service_date,
          rideCount: row.ride_count,
          alightCount: row.alight_count
        })),
        qualitySummary: {
          freshnessHours: latest ? 24 : 999,
          stationMatchRate: rows.length ? 100 : 0,
          zoneMappingFailureRate: 0,
          quarantineRate: 0
        }
      },
      meta: {
        sourceNames: unique(rows.map((row) => row.source_name)),
        grainLabel: "station_daily",
        lastLoadedAt: toIsoString(rows.at(-1)?.loaded_at) || new Date().toISOString(),
        dateRange: {
          from: rows[0]?.service_date ?? "",
          to: rows.at(-1)?.service_date ?? ""
        },
        limitations: buildStationOverviewLimitations(rows.length > 0),
        queryEcho: query,
        fallbackUsed: false
      }
    };
  }

  async getHourlyProfile(stationId: string, query: Record<string, unknown>) {
    const pool = getDbPool();
    if (!pool) {
      return localFallback.getHourlyProfile(stationId, query);
    }

    const aggregationLevel = resolveAggregationLevel(query);
    const stationMeta = await getStationMeta(pool, stationId);
    const latestDateResult = await pool.query<{ service_date: string }>(
      `
      select max(service_date)::text as service_date
      from public.vw_living_zone_od_15min_latest
      where aggregation_level = $1
      `,
      [aggregationLevel]
    );

    const latestServiceDate = latestDateResult.rows[0]?.service_date ?? "";
    const params: unknown[] = [aggregationLevel];
    let whereClause = "where aggregation_level = $1";

    if (typeof query.from === "string") {
      params.push(query.from);
      whereClause += ` and service_date >= $${params.length}`;
    }
    if (typeof query.to === "string") {
      params.push(query.to);
      whereClause += ` and service_date <= $${params.length}`;
    }
    if (params.length === 1 && latestServiceDate) {
      params.push(latestServiceDate);
      whereClause += ` and service_date = $${params.length}`;
    }

    const rowsResult = await pool.query<LivingZone15MinuteRow>(
      `
      select
        hour_bucket,
        direction,
        sum(passenger_count)::int as passenger_count,
        max(loaded_at) as loaded_at,
        min(source_name) as source_name
      from public.vw_living_zone_od_15min_latest
      ${whereClause}
      group by hour_bucket, direction
      order by hour_bucket asc, direction asc
      `,
      params
    );

    const byHour = new Map<string, { rideCount: number; alightCount: number }>();
    for (const row of rowsResult.rows) {
      const current = byHour.get(row.hour_bucket) ?? { rideCount: 0, alightCount: 0 };
      if (row.direction === "outbound") {
        current.rideCount += row.passenger_count;
      } else {
        current.alightCount += row.passenger_count;
      }
      byHour.set(row.hour_bucket, current);
    }

    return {
      data: {
        station: buildStationPayload(stationMeta),
        analysisScope: sangilLivingZone,
        weekdayType: typeof query.weekdayType === "string" ? query.weekdayType : "all",
        rows: [...byHour.entries()].map(([hourBucket, values]) => ({
          hourBucket,
          rideCount: values.rideCount,
          alightCount: values.alightCount
        }))
      },
      meta: {
        sourceNames: unique(rowsResult.rows.map((row) => row.source_name)),
        grainLabel: `living_zone_od_15min:${aggregationLevel}`,
        lastLoadedAt: toIsoString(rowsResult.rows.at(-1)?.loaded_at) || new Date().toISOString(),
        dateRange: {
          from: typeof query.from === "string" ? query.from : latestServiceDate,
          to: typeof query.to === "string" ? query.to : latestServiceDate
        },
        limitations: buildLivingZoneLimitations(true, aggregationLevel),
        queryEcho: query,
        fallbackUsed: false
      }
    };
  }

  async getOriginToZone(query: Record<string, unknown>) {
    return this.getLivingZoneDirection("outbound", query);
  }

  async getZoneToDestination(query: Record<string, unknown>) {
    return this.getLivingZoneDirection("inbound", query);
  }

  private async getLivingZoneDirection(direction: "outbound" | "inbound", query: Record<string, unknown>) {
    const pool = getDbPool();
    if (!pool) {
      return direction === "outbound"
        ? localFallback.getOriginToZone(query)
        : localFallback.getZoneToDestination(query);
    }

    const aggregationLevel = resolveAggregationLevel(query);
    const latestDateResult = await pool.query<{ service_date: string }>(
      `
      select max(service_date)::text as service_date
      from public.vw_living_zone_od_daily_latest
      where direction = $1 and aggregation_level = $2
      `,
      [direction, aggregationLevel]
    );

    const latestServiceDate = latestDateResult.rows[0]?.service_date ?? "";
    const params: unknown[] = [direction, aggregationLevel];
    let whereClause = "where direction = $1 and aggregation_level = $2";

    if (typeof query.from === "string") {
      params.push(query.from);
      whereClause += ` and service_date >= $${params.length}`;
    }
    if (typeof query.to === "string") {
      params.push(query.to);
      whereClause += ` and service_date <= $${params.length}`;
    }
    if (params.length === 2 && latestServiceDate) {
      params.push(latestServiceDate);
      whereClause += ` and service_date = $${params.length}`;
    }

    const result = await pool.query<LivingZoneDailyRow>(
      `
      select
        target_label,
        max(top_context_label) as top_context_label,
        sum(passenger_count)::int as passenger_count,
        max(share_pct) as share_pct,
        max(loaded_at) as loaded_at,
        min(source_name) as source_name
      from public.vw_living_zone_od_daily_latest
      ${whereClause}
      group by target_label
      order by passenger_count desc
      `,
      params
    );

    const total = result.rows.reduce((sum, row) => sum + row.passenger_count, 0);

    return {
      data: {
        station: sangilStation,
        analysisScope: sangilLivingZone,
        dateRange: {
          from: typeof query.from === "string" ? query.from : latestServiceDate,
          to: typeof query.to === "string" ? query.to : latestServiceDate
        },
        rows: result.rows.map((row) => ({
          zoneName: row.target_label,
          passengerCount: row.passenger_count,
          sharePct: total > 0 ? Number(((row.passenger_count / total) * 100).toFixed(1)) : Number(row.share_pct ?? 0),
          topContextLabel: row.top_context_label
        }))
      },
      meta: {
        sourceNames: unique(result.rows.map((row) => row.source_name)),
        grainLabel: `living_zone_od_daily:${aggregationLevel}`,
        lastLoadedAt: toIsoString(result.rows.at(-1)?.loaded_at) || new Date().toISOString(),
        dateRange: {
          from: typeof query.from === "string" ? query.from : latestServiceDate,
          to: typeof query.to === "string" ? query.to : latestServiceDate
        },
        limitations: buildLivingZoneLimitations(false, aggregationLevel),
        queryEcho: query,
        fallbackUsed: false
      }
    };
  }

  async getDataQualitySummary(stationId: string) {
    void stationId;
    const pool = getDbPool();
    if (!pool) {
      return localFallback.getDataQualitySummary(stationId);
    }

    const [stationDaily, zoneDaily, sggDaily, zoneFifteen, sggFifteen, latestLoad] = await Promise.all([
      pool.query<{ count: string; latest_date: string | null }>(
        `
        select count(*)::text as count, max(service_date)::text as latest_date
        from public.fact_station_daily
        where station_id = 'sangil-5-551'
        `
      ),
      pool.query<{ count: string; latest_date: string | null; snapshot_rows: string }>(
        `
        select
          count(*)::text as count,
          max(service_date)::text as latest_date,
          sum(case when is_verified_snapshot then 1 else 0 end)::text as snapshot_rows
        from public.vw_living_zone_od_daily_latest
        where aggregation_level = 'zone'
        `
      ),
      pool.query<{ count: string }>(
        `
        select count(*)::text as count
        from public.vw_living_zone_od_daily_latest
        where aggregation_level = 'sgg'
        `
      ),
      pool.query<{ count: string }>(
        `
        select count(*)::text as count
        from public.vw_living_zone_od_15min_latest
        where aggregation_level = 'zone'
        `
      ),
      pool.query<{ count: string }>(
        `
        select count(*)::text as count
        from public.vw_living_zone_od_15min_latest
        where aggregation_level = 'sgg'
        `
      ),
      pool.query<{ last_loaded_at: Date | null }>(
        `
        select max(last_loaded_at) as last_loaded_at
        from (
          select max(loaded_at) as last_loaded_at from public.fact_station_daily
          union all
          select max(loaded_at) as last_loaded_at from public.fact_living_zone_od_daily
          union all
          select max(loaded_at) as last_loaded_at from public.fact_living_zone_od_15min
        ) materialized_loads
        `
      )
    ]);

    const warnings = [
      "Dashboard runtime reads Postgres facts only. Public APIs are queried by ETL, not by request handlers.",
      "Ridership remains station_daily while OD remains living-zone_daily; the two grains are intentionally separated."
    ];

    if (Number(zoneFifteen.rows[0]?.count ?? 0) === 0) {
      warnings.push("15-minute OD facts are not materialized yet. The temporal panel will keep the DB-backed empty state.");
    }
    if (Number(sggDaily.rows[0]?.count ?? 0) === 0) {
      warnings.push("SGG-level OD rows are not materialized yet. Tomorrow's live refresh can populate finer-grained views.");
    }
    if (Number(zoneDaily.rows[0]?.snapshot_rows ?? 0) > 0) {
      warnings.push("Some living-zone OD zone rows still come from a verified snapshot because the public OD API was not stable at capture time.");
    }

    return {
      data: {
        station: sangilStation,
        analysisScopes: [sangilStationScope, sangilLivingZone],
        dataMode: "postgres" as const,
        sourceMode: getEnv().APP_SOURCE_MODE,
        warnings,
        metrics: [
          { label: "Data mode", value: "postgres", status: "good" as const },
          { label: "Station daily rows", value: stationDaily.rows[0]?.count ?? "0", status: "good" as const },
          { label: "OD zone rows", value: zoneDaily.rows[0]?.count ?? "0", status: Number(zoneDaily.rows[0]?.count ?? 0) > 0 ? "good" as const : "critical" as const },
          { label: "OD sgg rows", value: sggDaily.rows[0]?.count ?? "0", status: Number(sggDaily.rows[0]?.count ?? 0) > 0 ? "good" as const : "warning" as const },
          { label: "15min zone rows", value: zoneFifteen.rows[0]?.count ?? "0", status: Number(zoneFifteen.rows[0]?.count ?? 0) > 0 ? "good" as const : "warning" as const },
          { label: "15min sgg rows", value: sggFifteen.rows[0]?.count ?? "0", status: Number(sggFifteen.rows[0]?.count ?? 0) > 0 ? "good" as const : "warning" as const },
          { label: "Latest station date", value: stationDaily.rows[0]?.latest_date ?? "-", status: "good" as const },
          { label: "Latest OD date", value: zoneDaily.rows[0]?.latest_date ?? "-", status: "warning" as const }
        ]
      },
      meta: {
        sourceNames: ["fact_station_daily", "vw_living_zone_od_daily_latest", "vw_living_zone_od_15min_latest"],
        grainLabel: "station_daily + living_zone_od_daily + living_zone_od_15min",
        lastLoadedAt: toIsoString(latestLoad.rows[0]?.last_loaded_at) || new Date().toISOString(),
        dateRange: {
          from: stationDaily.rows[0]?.latest_date ?? "",
          to: zoneDaily.rows[0]?.latest_date ?? ""
        },
        limitations: warnings,
        queryEcho: {},
        fallbackUsed: false
      }
    };
  }

  async searchStations(query: string) {
    const pool = getDbPool();
    if (!pool) {
      return localFallback.searchStations(query);
    }

    const result = await pool.query<{ station_id: string; station_name: string }>(
      `
      select station_id, station_name
      from public.dim_station
      where $1 = '' or station_name ilike '%' || $1 || '%'
      order by station_name asc
      limit 20
      `,
      [query]
    );

    return result.rows.map((row) => ({
      stationId: row.station_id,
      stationName: row.station_name
    }));
  }

  async listZones() {
    const pool = getDbPool();
    if (!pool) {
      return localFallback.listZones();
    }

    const result = await pool.query<{ zone_name: string }>(
      `
      select zone_name
      from public.dim_zone
      where is_active = true
      order by sort_order asc, zone_name asc
      `
    );

    return result.rows.map((row) => row.zone_name);
  }
}
