"use client";

import { useMemo, useState } from "react";
import { mapFocusPoint, resolveFlowVisual } from "@/lib/data/zone-visuals";

type FlowRow = {
  zoneName: string;
  passengerCount: number;
  sharePct: number;
  topContextLabel: string;
};

type ZoneFlowMapProps = {
  title: string;
  subtitle: string;
  scopeLabel: string;
  outboundRows: FlowRow[];
  inboundRows: FlowRow[];
};

type Mode = "outbound" | "inbound";

const modeCopy: Record<Mode, { label: string; accent: string; text: string }> = {
  outbound: {
    label: "유출",
    accent: "#34d399",
    text: "상일동 생활권에서 각 대상지로 이동하는 흐름"
  },
  inbound: {
    label: "유입",
    accent: "#f59e0b",
    text: "각 대상지에서 상일동 생활권으로 들어오는 흐름"
  }
};

function buildPath(mode: Mode, target: { x: number; y: number }) {
  const source = mode === "outbound" ? mapFocusPoint : target;
  const destination = mode === "outbound" ? target : mapFocusPoint;
  const midX = (source.x + destination.x) / 2;
  const midY = (source.y + destination.y) / 2 - Math.abs(destination.x - source.x) * 0.14;
  return `M ${source.x} ${source.y} Q ${midX} ${midY} ${destination.x} ${destination.y}`;
}

function intensity(passengerCount: number, max: number) {
  if (max <= 0) return 0.18;
  return 0.18 + (passengerCount / max) * 0.78;
}

export function ZoneFlowMap({
  title,
  subtitle,
  scopeLabel,
  outboundRows,
  inboundRows
}: ZoneFlowMapProps) {
  const [mode, setMode] = useState<Mode>("outbound");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const rows = mode === "outbound" ? outboundRows : inboundRows;
  const max = Math.max(1, ...rows.map((row) => row.passengerCount));

  const visualRows = useMemo(
    () =>
      rows.map((row, index) => ({
        ...row,
        visual: resolveFlowVisual(row.zoneName, index, rows.length)
      })),
    [rows]
  );

  const selectedRow = visualRows.find((row) => row.zoneName === selectedLabel) ?? visualRows[0] ?? null;

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#07101b] shadow-[0_40px_120px_rgba(2,6,23,0.55)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(249,115,22,0.12),transparent_24%),linear-gradient(180deg,#07101b_0%,#081527_100%)]" />
      <div className="relative z-10 flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-300/80">Map-first OD Studio</p>
            <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(modeCopy) as Mode[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  mode === key
                    ? "border-white/40 bg-white/12 text-white"
                    : "border-white/10 bg-black/15 text-slate-300 hover:border-white/25"
                }`}
              >
                {modeCopy[key].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="relative rounded-[30px] border border-white/10 bg-black/10 p-4">
            <div className="absolute inset-0 bg-[linear-gradient(transparent_96%,rgba(255,255,255,0.04)_97%),linear-gradient(90deg,transparent_96%,rgba(255,255,255,0.04)_97%)] bg-[length:36px_36px]" />
            <svg viewBox="0 0 1000 640" className="relative z-10 w-full">
              <defs>
                <filter id="zoneGlow">
                  <feGaussianBlur stdDeviation="10" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="river" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="rgba(125,211,252,0.1)" />
                  <stop offset="50%" stopColor="rgba(34,211,238,0.28)" />
                  <stop offset="100%" stopColor="rgba(125,211,252,0.08)" />
                </linearGradient>
              </defs>

              <path
                d="M 78 370 C 190 325, 272 346, 410 338 S 690 364, 936 304"
                fill="none"
                stroke="url(#river)"
                strokeWidth="22"
                strokeLinecap="round"
                opacity="0.55"
              />

              {visualRows.map((row) => {
                const active = selectedRow?.zoneName === row.zoneName;
                const alpha = intensity(row.passengerCount, max);
                const fillColor = mode === "outbound" ? `rgba(45, 212, 191, ${alpha})` : `rgba(251, 191, 36, ${alpha})`;
                return (
                  <g key={row.zoneName}>
                    <polygon
                      points={row.visual.polygon}
                      fill={fillColor}
                      stroke={active ? "#f8fafc" : "rgba(255,255,255,0.18)"}
                      strokeWidth={active ? 2.6 : 1.2}
                      filter="url(#zoneGlow)"
                      className="cursor-pointer transition-all"
                      onClick={() => setSelectedLabel(row.zoneName)}
                    />
                    <text
                      x={row.visual.label.x}
                      y={row.visual.label.y}
                      fill="rgba(241,245,249,0.92)"
                      fontSize="15"
                      fontWeight={active ? 700 : 500}
                    >
                      {row.zoneName}
                    </text>
                  </g>
                );
              })}

              {visualRows.map((row) => {
                const active = selectedRow?.zoneName === row.zoneName;
                return (
                  <path
                    key={`${mode}-${row.zoneName}`}
                    d={buildPath(mode, row.visual.center)}
                    fill="none"
                    stroke={modeCopy[mode].accent}
                    strokeWidth={active ? 5 + row.sharePct / 10 : 2 + row.sharePct / 18}
                    opacity={active ? 0.96 : 0.34 + row.sharePct / 130}
                    strokeLinecap="round"
                    className="od-arc"
                  />
                );
              })}

              <g>
                <circle cx={mapFocusPoint.x} cy={mapFocusPoint.y} r="18" fill="#f8fafc" opacity="0.95" />
                <circle cx={mapFocusPoint.x} cy={mapFocusPoint.y} r="44" fill="rgba(248,250,252,0.14)" className="pulse-ring" />
                <circle cx={mapFocusPoint.x} cy={mapFocusPoint.y} r="68" fill="rgba(248,250,252,0.08)" className="pulse-ring-delayed" />
                <text x={mapFocusPoint.x + 24} y={mapFocusPoint.y - 8} fill="#f8fafc" fontSize="20" fontWeight="700">
                  {scopeLabel}
                </text>
                <text x={mapFocusPoint.x + 24} y={mapFocusPoint.y + 18} fill="rgba(226,232,240,0.85)" fontSize="13">
                  {modeCopy[mode].text}
                </text>
              </g>
            </svg>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Selected flow</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{selectedRow?.zoneName ?? "항목 선택"}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {selectedRow
                  ? `${scopeLabel} 기준 ${mode === "outbound" ? "유출" : "유입"} 대상의 대표 생활권은 ${selectedRow.topContextLabel} 입니다.`
                  : "지도의 항목을 선택하면 대표 생활권과 비중을 더 자세히 볼 수 있습니다."}
              </p>
              {selectedRow ? (
                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Passenger volume</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{selectedRow.passengerCount.toLocaleString()}명</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Share</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{selectedRow.sharePct.toFixed(1)}%</div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/18 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Layer notes</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>권역 라벨이 아닌 구/시 라벨이 와도 fallback 위치를 생성하도록 준비했습니다.</li>
                <li>zone 데이터는 기존 polygon 위치를, sgg 데이터는 ring layout fallback을 사용합니다.</li>
                <li>내일 sgg 적재가 들어오면 이 맵 레이어가 같은 컴포넌트에서 그대로 받을 수 있습니다.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
