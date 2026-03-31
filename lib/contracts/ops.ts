import { z } from "zod";

export const runStatusSchema = z.enum([
  "planned",
  "ready",
  "running",
  "succeeded",
  "failed",
  "blocked"
]);

export const taskRecordSchema = z.object({
  id: z.string(),
  taskType: z.string(),
  title: z.string(),
  status: runStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  notes: z.array(z.string()).default([])
});

export const runRecordSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  stage: z.string(),
  status: runStatusSchema,
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  summary: z.string(),
  metrics: z.record(z.string(), z.number()).default({})
});

export const eventRecordSchema = z.object({
  id: z.string(),
  runId: z.string(),
  eventType: z.string(),
  occurredAt: z.string(),
  payload: z.record(z.string(), z.unknown())
});

export const evidenceRecordSchema = z.object({
  id: z.string(),
  runId: z.string(),
  evidenceType: z.string(),
  createdAt: z.string(),
  path: z.string(),
  summary: z.string()
});

export type TaskRecord = z.infer<typeof taskRecordSchema>;
export type RunRecord = z.infer<typeof runRecordSchema>;
export type EventRecord = z.infer<typeof eventRecordSchema>;
export type EvidenceRecord = z.infer<typeof evidenceRecordSchema>;
