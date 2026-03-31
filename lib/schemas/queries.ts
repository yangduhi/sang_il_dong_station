import { z } from "zod";

export const weekdayTypeSchema = z.enum(["all", "weekday", "weekend"]).default("all");
export const aggregationLevelSchema = z.enum(["zone", "sgg"]).default("zone");

export const passengerTypeSchema = z.enum([
  "all",
  "general",
  "teen",
  "child",
  "senior",
  "disabled"
]);

export const stationOverviewQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional()
});

export const hourlyQuerySchema = stationOverviewQuerySchema.extend({
  weekdayType: weekdayTypeSchema.optional(),
  aggregationLevel: aggregationLevelSchema.optional()
});

export const odQuerySchema = z.object({
  stationName: z.string().default("상일동역"),
  from: z.string().optional(),
  to: z.string().optional(),
  weekdayType: weekdayTypeSchema.optional(),
  passengerType: passengerTypeSchema.optional(),
  aggregationLevel: aggregationLevelSchema.optional()
});

export const stationSearchQuerySchema = z.object({
  query: z.string().optional()
});
