"use client";

import { useState } from "react";
import { DataQualityPanel } from "@/components/DataQualityPanel";
import { HourlyProfile } from "@/components/HourlyProfile";
import { KpiCards } from "@/components/KpiCards";
import { OdBarChart } from "@/components/OdBarChart";
import { SectionCard } from "@/components/SectionCard";
import { TrendChart } from "@/components/TrendChart";
import { ZoneFlowMap } from "@/components/ZoneFlowMap";
import type {
  DataQualitySummaryResponse,
  HourlyProfileResponse,
  OdOriginToZoneResponse,
  OdZoneToDestinationResponse,
  StationOverviewResponse
} from "@/lib/schemas/responses";

type GranularityKey = "zone" | "sgg";

type DashboardShellProps = {
  overview: StationOverviewResponse;
  granularities: Record<
    GranularityKey,
    {
      originToZone: OdOriginToZoneResponse;
      zoneToDestination: OdZoneToDestinationResponse;
      hourly: HourlyProfileResponse;
    }
  >;
  quality: DataQualitySummaryResponse;
};

const granularityCopy: Record<
  GranularityKey,
  { label: string; title: string; subtitle: string; statusNote: string }
> = {
  sgg: {
    label: "구·시",
    title: "구·시 단위 OD",
    subtitle: "현재 공개 데이터 grain과 가장 잘 맞는 서울 자치구 / 경기 시군 기준 흐름입니다.",
    statusNote: "가장 세밀한 공개 granularity"
  },
  zone: {
    label: "권역",
    title: "권역 요약 OD",
    subtitle: "넓은 방향성을 빠르게 읽기 위한 요약 시점입니다.",
    statusNote: "fallback 또는 요약용 시점"
  }
};

function chooseInitialGranularity(granularities: DashboardShellProps["granularities"]): GranularityKey {
  return granularities.sgg.originToZone.data.rows.length > 0 ? "sgg" : "zone";
}

function formatTimestamp(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul"
  }).format(parsed);
}

function statusTone(status: "good" | "warning" | "critical") {
  if (status === "good") {
    return "text-emerald-200";
  }
  if (status === "critical") {
    return "text-rose-200";
  }
  return "text-amber-100";
}

export function DashboardShell({ overview, granularities, quality }: DashboardShellProps) {
  const [granularity, setGranularity] = useState<GranularityKey>(() => chooseInitialGranularity(granularities));
  const active = granularities[granularity];
  const sggReady = granularities.sgg.originToZone.data.rows.length > 0;
  const station = overview.data.station;
  const latestTrend = overview.data.trend.at(-1);
  const activeGranularity = granularityCopy[granularity];
  const outboundLead = active.originToZone.data.rows[0];
  const inboundLead = active.zoneToDestination.data.rows[0];
  const combinedLimitations = [...quality.data.warnings, ...quality.meta.limitations];
  const headerNote = sggReady
    ? "기본 뷰는 구·시 단위입니다. 필요할 때만 권역 요약으로 압축해서 볼 수 있도록 설계했습니다."
    : "구·시 단위 적재가 아직 비어 있어 권역 요약으로 안전하게 fallback 합니다. 데이터 적재가 완료되면 같은 화면에서 구·시 결과로 전환됩니다.";

  const signalMetrics = [
    {
      label: "승하차 기준",
      value: overview.data.analysisScope.scopeLabel,
      note: station.lineName
    },
    {
      label: "OD 기준",
      value: active.originToZone.data.analysisScope.scopeLabel,
      note: activeGranularity.statusNote
    },
    {
      label: "마지막 적재",
      value: formatTimestamp(quality.meta.lastLoadedAt),
      note: quality.meta.grainLabel
    },
    {
      label: "Fallback",
      value: quality.meta.fallbackUsed ? "ACTIVE" : "DIRECT",
      note: `${quality.data.dataMode} / ${quality.data.sourceMode}`
    }
  ];

  const healthHighlights = quality.data.metrics.slice(0, 4);

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-6 px-4 py-5 md:px-8 md:py-8">
        <header
          data-reveal="0"
          className="relative overflow-hidden rounded-[44px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,27,0.96),rgba(7,17,31,0.86))] px-6 py-7 shadow-[0_40px_120px_rgba(2,6,23,0.55)] md:px-9 md:py-9"
        >
          <div className="panel-edge" />
          <div className="grid-sheen signal-sweep" />

          <div className="relative z-10 grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="max-w-4xl">
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                <span>{station.lineName}</span>
                <span className="text-slate-600">/</span>
                <span>{station.operatorName}</span>
                <span className="text-slate-600">/</span>
                <span>{station.sigungu}</span>
              </div>
              <p className="mt-5 text-[11px] uppercase tracking-[0.34em] text-[#86f3de]/80">
                Sangil-dong analytical desk
              </p>
              <h1 className="font-display mt-4 max-w-5xl text-[2.5rem] font-semibold leading-[0.95] text-white md:text-[4.8rem]">
                상일동역 운영 리듬과
                <br />
                생활권 흐름을 한 화면에서 읽는 분석 데스크
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                역 단위 승하차 추세와 생활권 기반 대중교통 OD를 하나의 읽기 순서로 정리했습니다. 먼저 흐름을
                보고, 그다음 적재 범위와 품질을 확인하고, 마지막으로 시간대 패턴과 해석 주의점을 검토할 수
                있습니다.
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#d2fff6]">{headerNote}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {healthHighlights.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[24px] border border-white/10 bg-black/[0.18] px-4 py-4 backdrop-blur-sm"
                >
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
                  <p className={`font-display mt-3 text-2xl font-semibold ${statusTone(metric.status)}`}>{metric.value}</p>
                  <p className="mt-2 text-xs text-slate-400">{metric.status.toUpperCase()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-8 grid gap-6 border-t border-white/10 pt-5 xl:grid-cols-[minmax(0,1fr)_auto]">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {signalMetrics.map((metric) => (
                <div key={metric.label} className="border-l border-white/10 pl-5 first:border-l-0 first:pl-0">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
                  <p className="font-display mt-3 text-[1.65rem] font-semibold text-white">{metric.value}</p>
                  <p className="mt-2 text-sm text-slate-400">{metric.note}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 xl:items-end">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
                <span>최신 일자</span>
                <span className="text-white">{latestTrend?.serviceDate ?? "-"}</span>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 p-1">
                {(Object.keys(granularityCopy) as GranularityKey[]).map((key) => {
                  const disabled = key === "sgg" && !sggReady;

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={disabled}
                      onClick={() => setGranularity(key)}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        granularity === key
                          ? "bg-white text-slate-950 shadow-[0_12px_28px_rgba(255,255,255,0.12)]"
                          : "text-slate-300 hover:text-white"
                      } ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
                    >
                      {granularityCopy[key].label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        <div data-reveal="1">
          <ZoneFlowMap
            title="상일동 생활권 OD 맵"
            subtitle={`${activeGranularity.title} 기준으로 ${activeGranularity.subtitle}`}
            scopeLabel={active.originToZone.data.analysisScope.scopeLabel}
            outboundRows={active.originToZone.data.rows}
            inboundRows={active.zoneToDestination.data.rows}
          />
        </div>

        <div data-reveal="2" className="grid gap-6 xl:grid-cols-[1fr_1fr_0.9fr]">
          <SectionCard
            eyebrow="Outbound"
            title="주요 도착 대상지"
            subtitle={`${activeGranularity.label} 기준으로 상일동 생활권에서 바깥으로 나갈 때 비중이 높은 목적지입니다.`}
          >
            <OdBarChart rows={active.originToZone.data.rows.slice(0, 6)} directionLabel={`origin-${granularity}`} />
          </SectionCard>

          <SectionCard
            eyebrow="Inbound"
            title="주요 유입 대상지"
            subtitle={`${activeGranularity.label} 기준으로 외부에서 상일동 생활권으로 들어오는 비중이 높은 출발지입니다.`}
          >
            <OdBarChart rows={active.zoneToDestination.data.rows.slice(0, 6)} directionLabel={`inbound-${granularity}`} />
          </SectionCard>

          <SectionCard
            eyebrow="Operator notes"
            title="운영 메모"
            subtitle="해석 범위와 fallback 동작을 상단 지도와 함께 빠르게 읽을 수 있도록 정리했습니다."
          >
            <div className="space-y-5">
              <div className="rounded-[24px] border border-white/10 bg-black/[0.16] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Leading outbound</p>
                <p className="font-display mt-2 text-2xl font-semibold text-white">{outboundLead?.zoneName ?? "-"}</p>
                <p className="mt-2 text-sm text-slate-400">{outboundLead?.topContextLabel ?? "표시할 데이터가 없습니다"}</p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/[0.16] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Leading inbound</p>
                <p className="font-display mt-2 text-2xl font-semibold text-white">{inboundLead?.zoneName ?? "-"}</p>
                <p className="mt-2 text-sm text-slate-400">{inboundLead?.topContextLabel ?? "표시할 데이터가 없습니다"}</p>
              </div>

              <ul className="space-y-3 text-sm leading-6 text-slate-300">
                <li>- 구·시 적재가 비어 있으면 권역 요약으로 즉시 fallback 하고, 화면 구조는 바뀌지 않습니다.</li>
                <li>- 승하차는 역 단위, OD는 생활권 단위이므로 같은 수치처럼 비교하지 않도록 읽어야 합니다.</li>
                <li>- 품질, freshness, limitations는 항상 별도 패널에서 함께 노출합니다.</li>
              </ul>
            </div>
          </SectionCard>
        </div>

        <div data-reveal="3" className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
          <SectionCard
            eyebrow="Ridership"
            title="상일동역 승하차 추세"
            subtitle="역 단위 승하차 규모와 생활권 OD를 서로 다른 축으로 보여줍니다."
          >
            <div className="space-y-6">
              <KpiCards kpis={overview.data.kpis} />
              <TrendChart rows={overview.data.trend} />
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Quality"
            title="적재 상태와 해석 범위"
            subtitle="현재 데이터 모드, source mode, freshness, 그리고 드러난 제약을 함께 확인할 수 있습니다."
          >
            <DataQualityPanel
              grainLabel={quality.meta.grainLabel}
              lastLoadedAt={quality.meta.lastLoadedAt}
              limitations={combinedLimitations}
              metrics={quality.data.metrics}
            />
          </SectionCard>
        </div>

        <div data-reveal="4" className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionCard
            eyebrow="Temporal"
            title={`${activeGranularity.label} 기준 시간대 패턴`}
            subtitle="15분 적재가 연결되면 같은 granularity를 기준으로 이 패널도 함께 채워집니다."
          >
            <HourlyProfile rows={active.hourly.data.rows} />
          </SectionCard>

          <SectionCard
            eyebrow="Reading guide"
            title="운영 해석 가이드"
            subtitle="숫자를 보기 전에 지금 어떤 단위를 읽고 있는지 먼저 이해하도록 정리했습니다."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-black/[0.16] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">기본 단위</p>
                <p className="font-display mt-3 text-2xl font-semibold text-white">{activeGranularity.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  준비된 granularity를 먼저 보여 주고, 필요할 때만 권역 요약으로 압축합니다.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/[0.16] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">대표 목적지</p>
                <p className="font-display mt-3 text-2xl font-semibold text-white">{outboundLead?.zoneName ?? "-"}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  현재 outbound 기준에서 가장 비중이 높은 흐름입니다. 지도와 패널을 함께 읽으면 맥락이 더 분명합니다.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/[0.16] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">주의할 점</p>
                <p className="font-display mt-3 text-2xl font-semibold text-white">역 OD 아님</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  OD는 생활권 기준이므로 역-역 통행처럼 오해하지 않도록 항상 설명과 함께 읽어야 합니다.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
