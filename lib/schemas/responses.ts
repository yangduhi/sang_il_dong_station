import { z } from "zod";
import {
  analysisScopeSchema,
  baseApiResponseSchema,
  dateRangeSchema,
  stationSchema
} from "@/lib/schemas/common";

export const kpiSchema = z.object({
  latestRideCount: z.number(),
  latestAlightCount: z.number(),
  rollingSevenDayAverage: z.number(),
  weekOverWeekDeltaPct: z.number()
});

export const trendPointSchema = z.object({
  serviceDate: z.string(),
  rideCount: z.number(),
  alightCount: z.number()
});

export const stationOverviewDataSchema = z.object({
  station: stationSchema,
  analysisScope: analysisScopeSchema,
  kpis: kpiSchema,
  trend: z.array(trendPointSchema),
  qualitySummary: z.object({
    freshnessHours: z.number(),
    stationMatchRate: z.number(),
    zoneMappingFailureRate: z.number(),
    quarantineRate: z.number()
  })
});

export const hourlyPointSchema = z.object({
  hourBucket: z.string(),
  rideCount: z.number(),
  alightCount: z.number()
});

export const hourlyProfileDataSchema = z.object({
  station: stationSchema,
  analysisScope: analysisScopeSchema,
  weekdayType: z.string(),
  rows: z.array(hourlyPointSchema)
});

export const zoneOdRowSchema = z.object({
  zoneName: z.string(),
  passengerCount: z.number(),
  sharePct: z.number(),
  topContextLabel: z.string()
});

export const originToZoneDataSchema = z.object({
  station: stationSchema,
  analysisScope: analysisScopeSchema,
  dateRange: dateRangeSchema,
  rows: z.array(zoneOdRowSchema)
});

export const zoneToDestinationDataSchema = z.object({
  station: stationSchema,
  analysisScope: analysisScopeSchema,
  dateRange: dateRangeSchema,
  rows: z.array(zoneOdRowSchema)
});

export const dataQualitySummaryDataSchema = z.object({
  station: stationSchema,
  analysisScopes: z.array(analysisScopeSchema),
  dataMode: z.enum(["local", "postgres"]),
  sourceMode: z.enum(["sample", "live"]),
  warnings: z.array(z.string()),
  metrics: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      status: z.enum(["good", "warning", "critical"])
    })
  )
});

export const healthDataSchema = z.object({
  status: z.literal("ok"),
  app: z.string(),
  version: z.string(),
  env: z.string(),
  dataMode: z.enum(["local", "postgres"]),
  sourceMode: z.enum(["sample", "live"]),
  python: z.object({
    required: z.string(),
    venvPath: z.string()
  }),
  db: z.object({
    configured: z.boolean(),
    mode: z.enum(["local", "postgres"])
  })
});

export const stationOverviewResponseSchema = baseApiResponseSchema(stationOverviewDataSchema);
export const hourlyProfileResponseSchema = baseApiResponseSchema(hourlyProfileDataSchema);
export const odOriginToZoneResponseSchema = baseApiResponseSchema(originToZoneDataSchema);
export const odZoneToDestinationResponseSchema = baseApiResponseSchema(zoneToDestinationDataSchema);
export const dataQualitySummaryResponseSchema = baseApiResponseSchema(dataQualitySummaryDataSchema);
export const healthResponseSchema = baseApiResponseSchema(healthDataSchema);

export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type StationOverviewResponse = z.infer<typeof stationOverviewResponseSchema>;
export type HourlyProfileResponse = z.infer<typeof hourlyProfileResponseSchema>;
export type OdOriginToZoneResponse = z.infer<typeof odOriginToZoneResponseSchema>;
export type OdZoneToDestinationResponse = z.infer<typeof odZoneToDestinationResponseSchema>;
export type DataQualitySummaryResponse = z.infer<typeof dataQualitySummaryResponseSchema>;
