import { NextResponse } from "next/server";
import { buildMeta, type ErrorEnvelope, type ResponseMeta } from "@/lib/contracts/api";

export function jsonOk<T>(
  data: T,
  meta: Partial<ResponseMeta> & Pick<ResponseMeta, "grainLabel" | "lastLoadedAt">
) {
  return NextResponse.json({
    data,
    meta: buildMeta(meta)
  });
}

export function jsonError(
  error: ErrorEnvelope["error"],
  meta: Partial<ResponseMeta> & Pick<ResponseMeta, "grainLabel" | "lastLoadedAt">,
  status = 500
) {
  return NextResponse.json(
    {
      error,
      meta: buildMeta(meta)
    },
    { status }
  );
}
