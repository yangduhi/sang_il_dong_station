import { z } from "zod";

export const responseMetaSchema = z.object({
  sourceNames: z.array(z.string()),
  grainLabel: z.string(),
  lastLoadedAt: z.string(),
  dateRange: z.object({
    from: z.string(),
    to: z.string()
  }),
  limitations: z.array(z.string()),
  queryEcho: z.record(z.string(), z.unknown()),
  fallbackUsed: z.boolean().default(false)
});

export const errorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    retriable: z.boolean().default(false)
  }),
  meta: responseMetaSchema
});

export type ResponseMeta = z.infer<typeof responseMetaSchema>;
export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>;

export function buildMeta(
  partial: Partial<ResponseMeta> & Pick<ResponseMeta, "grainLabel" | "lastLoadedAt">
): ResponseMeta {
  return responseMetaSchema.parse({
    sourceNames: partial.sourceNames ?? [],
    grainLabel: partial.grainLabel,
    lastLoadedAt: partial.lastLoadedAt,
    dateRange: partial.dateRange ?? { from: "", to: "" },
    limitations: partial.limitations ?? [],
    queryEcho: partial.queryEcho ?? {},
    fallbackUsed: partial.fallbackUsed ?? false
  });
}
