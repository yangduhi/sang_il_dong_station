import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  evidenceRecordSchema,
  eventRecordSchema,
  runRecordSchema,
  taskRecordSchema,
  type EvidenceRecord,
  type EventRecord,
  type RunRecord,
  type TaskRecord
} from "@/lib/contracts/ops";

async function persistRecord(subDir: string, id: string, payload: object) {
  const targetDir = path.join(process.cwd(), "runtime", subDir);
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, `${id}.json`), JSON.stringify(payload, null, 2), "utf8");
}

export async function saveTaskRecord(record: TaskRecord) {
  taskRecordSchema.parse(record);
  await persistRecord("tasks", record.id, record);
}

export async function saveRunRecord(record: RunRecord) {
  runRecordSchema.parse(record);
  await persistRecord("runs", record.id, record);
}

export async function saveEventRecord(record: EventRecord) {
  eventRecordSchema.parse(record);
  await persistRecord("events", record.id, record);
}

export async function saveEvidenceRecord(record: EvidenceRecord) {
  evidenceRecordSchema.parse(record);
  await persistRecord("evidence", record.id, record);
}
