"use client";

import { useState } from "react";
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
    accent: "#2fe0b6",
    text: "상일동 생활권에서 각 권역으로 이어지는 이동 흐름"
  },
  inbound: {
    label: "유입",
    accent: "#f4c56a",
    text: "각 권역에서 상일동 생활권으로 유입되는 이동 흐름"
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
  if (max <= 0) {
    return 0.18;
  }

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
  const visualRows = rows.map((row, index) => ({
    ...row,
    visual: resolveFlowVisual(row.zoneName, index, rows.length)
  }));
  const selectedRow = visualRows.find((row) => row.zoneName === selectedLabel) ?? visualRows[0] ?? null;
  const max = Math.max(1, ...rows.map((row) => row.passengerCount));
  const topRows = visualRows.slice(0, 6);

  return (
    <section className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,27,0.96),rgba(7,17,31,0.84))] shadow-[0_40px_120px_rgba(2,6,23,0.55)]">
      <div className="panel-edge" />
      <div className="grid-sheen signal-sweep" />

      <div className="relative z-10 flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#86f3de]/80">Map-first OD studio</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-white md:text-[2.2rem]">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-black/20 p-1">
              {(Object.keys(modeCopy) as Mode[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    mode === key
                      ? "bg-white text-slate-950 shadow-[0_12px_28px_rgba(255,255,255,0.12)]"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {modeCopy[key].label}
                </button>
              ))}
            </div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{modeCopy[mode].text}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="relative min-h-[540px] overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 md:p-6">
            <div className="grid-sheen" />
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
                const fillColor = mode === "outbound" ? `rgba(47, 224, 182, ${alpha})` : `rgba(244, 197, 106, ${alpha})`;

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

            <div className="absolute bottom-5 left-5 rounded-full border border-white/10 bg-black/[0.25] px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
              {scopeLabel}
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.3em] text-[#86f3de]/70">Selected flow</p>
              <h3 className="font-display mt-3 text-[2rem] font-semibold text-white">
                {selectedRow?.zoneName ?? "권역 선택"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {selectedRow
                  ? `${scopeLabel} 기준 ${mode === "outbound" ? "유출" : "유입"} 흐름에서 대표 생활권은 ${selectedRow.topContextLabel} 입니다.`
                  : "지도의 권역을 선택하면 대표 생활권과 비중을 자세히 볼 수 있습니다."}
              </p>

              {selectedRow ? (
                <div className="mt-5 grid gap-3">
                  <div className="rounded-[22px] border border-white/10 bg-black/[0.15] px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Passenger volume</div>
                    <div className="font-display mt-2 text-3xl font-semibold text-white">
                      {selectedRow.passengerCount.toLocaleString("ko-KR")}명
                    </div>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-black/[0.15] px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Share</div>
                    <div className="font-display mt-2 text-3xl font-semibold text-white">
                      {selectedRow.sharePct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-[30px] border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Top corridors</p>
                <p className="text-xs text-slate-500">click to inspect</p>
              </div>
              <div className="mt-4 space-y-2">
                {topRows.map((row, index) => {
                  const active = selectedRow?.zoneName === row.zoneName;

                  return (
                    <button
                      key={`${mode}-${row.zoneName}`}
                      type="button"
                      onClick={() => setSelectedLabel(row.zoneName)}
                      className={`flex w-full items-center justify-between gap-3 rounded-[20px] border px-4 py-3 text-left transition ${
                        active
                          ? "border-white/30 bg-white/10 text-white"
                          : "border-white/[0.08] bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{row.zoneName}</p>
                        <p className="truncate text-xs text-slate-500">{row.topContextLabel}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg font-semibold">{row.sharePct.toFixed(1)}%</p>
                        <p className="text-xs text-slate-500">#{index + 1}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-black/[0.12] p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Layer notes</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <li>권역 레이어는 생활권 레이어와 다른 fallback 위치를 생성하도록 준비했습니다.</li>
                <li>zone 데이터는 기존 polygon 위치를, sgg 데이터는 ring layout fallback을 사용합니다.</li>
                <li>이후 sgg 적재가 들어오면 같은 레이아웃 컴포넌트에서 그대로 받을 수 있습니다.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
