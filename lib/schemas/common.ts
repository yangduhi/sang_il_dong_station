import { z } from "zod";
import { responseMetaSchema } from "@/lib/contracts/api";

export const dateRangeSchema = z.object({
  from: z.string(),
  to: z.string()
});

export const stationSchema = z.object({
  stationId: z.string(),
  stationName: z.string(),
  lineName: z.string(),
  operatorName: z.string(),
  zoneName: z.string(),
  cityDo: z.string(),
  sigungu: z.string()
});

export const analysisScopeSchema = z.object({
  scopeType: z.enum(["station", "living_zone"]),
  scopeLabel: z.string(),
  focusAreaLabel: z.string().optional(),
  description: z.string()
});

export const baseApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: responseMetaSchema
  });
