"use client";

import { useMemo, useState } from "react";
import { DataQualityPanel } from "@/components/DataQualityPanel";
import { HourlyProfile } from "@/components/HourlyProfile";
import { KpiCards } from "@/components/KpiCards";
import { OdBarChart } from "@/components/OdBarChart";
import { SectionCard } from "@/components/SectionCard";
import { TrendChart } from "@/components/TrendChart";
import { ZoneFlowMap } from "@/components/ZoneFlowMap";
import type { DataQualitySummaryResponse, HourlyProfileResponse, OdOriginToZoneResponse, OdZoneToDestinationResponse, StationOverviewResponse } from "@/lib/schemas/responses";

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
  { label: string; title: string; subtitle: string }
> = {
  sgg: {
    label: "구·시",
    title: "구·시 단위 OD",
    subtitle: "현재 데이터 grain과 가장 잘 맞는 서울 자치구 / 경기 시군 기준 흐름입니다."
  },
  zone: {
    label: "권역",
    title: "권역 요약 OD",
    subtitle: "넓은 방향성을 빠르게 읽는 요약 시점입니다."
  }
};

function chooseInitialGranularity(granularities: DashboardShellProps["granularities"]): GranularityKey {
  return granularities.sgg.originToZone.data.rows.length > 0 ? "sgg" : "zone";
}

export function DashboardShell({ overview, granularities, quality }: DashboardShellProps) {
  const [granularity, setGranularity] = useState<GranularityKey>(() => chooseInitialGranularity(granularities));
  const active = granularities[granularity];
  const sggReady = granularities.sgg.originToZone.data.rows.length > 0;

  const headerNote = useMemo(() => {
    if (sggReady) {
      return "기본 뷰는 구·시 단위입니다. 필요할 때만 권역 요약으로 압축해서 볼 수 있습니다.";
    }
    return "구·시 단위 적재는 준비되어 있고, 현재는 권역 요약 데이터가 먼저 표시됩니다. 내일 live OD 재적재 후 구·시가 기본으로 전환됩니다.";
  }, [sggReady]);

  return (
    <main className="min-h-screen bg-[#040814] text-white">
      <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-6 px-4 py-5 md:px-8 md:py-8">
        <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[#07101b] px-6 py-8 shadow-[0_40px_120px_rgba(2,6,23,0.55)] md:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.18),transparent_26%),radial-gradient(circle_at_84%_16%,rgba(16,185,129,0.14),transparent_18%),linear-gradient(180deg,#07101b_0%,#06101a_100%)]" />
          <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-300/80">Sangil-dong Mobility Observatory</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight text-white md:text-6xl">
                상일동역 승하차 추세와
                <br />
                상일동 생활권 OD를 지도 중심으로 읽는 대시보드
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                역 단위 승하차 추세와 생활권 기반 대중교통 OD를 분리해 보여줍니다. 상단 메인 맵은 상일동
                생활권과 서울·경기 대상지 사이의 흐름을 먼저 보여주고, 하단 분석 영역은 상일동역 자체의
                규모와 적재 상태를 같이 설명합니다.
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-cyan-100/80">{headerNote}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px]">
              <div className="rounded-[24px] border border-white/10 bg-black/18 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">승하차 범위</p>
                <p className="mt-2 text-lg font-semibold text-white">{overview.data.analysisScope.scopeLabel}</p>
                <p className="mt-1 text-sm text-slate-300">{overview.data.analysisScope.description}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/18 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">OD 범위</p>
                <p className="mt-2 text-lg font-semibold text-white">{active.originToZone.data.analysisScope.scopeLabel}</p>
                <p className="mt-1 text-sm text-slate-300">{granularityCopy[granularity].subtitle}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-[#07101b] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">OD granularity</p>
            <p className="mt-2 text-sm text-slate-300">{granularityCopy[granularity].title}</p>
          </div>
          <div className="flex items-center gap-3">
            {(Object.keys(granularityCopy) as GranularityKey[]).map((key) => {
              const disabled = key === "sgg" && !sggReady;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => setGranularity(key)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    granularity === key
                      ? "border-white/40 bg-white/12 text-white"
                      : "border-white/10 bg-black/15 text-slate-300 hover:border-white/25"
                  } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {granularityCopy[key].label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <ZoneFlowMap
            title={`${granularityCopy[granularity].label} 기준 상일동 생활권 OD 맵`}
            subtitle={granularityCopy[granularity].subtitle}
            scopeLabel={active.originToZone.data.analysisScope.scopeLabel}
            outboundRows={active.originToZone.data.rows}
            inboundRows={active.zoneToDestination.data.rows}
          />

          <aside className="space-y-6">
            <SectionCard
              eyebrow="Insights"
              title={`주요 도착 ${granularityCopy[granularity].label}`}
              subtitle="상일동 생활권에서 나갈 때 도착 비중이 높은 대상지입니다."
            >
              <OdBarChart rows={active.originToZone.data.rows.slice(0, 6)} directionLabel={`origin-${granularity}`} />
            </SectionCard>

            <SectionCard
              eyebrow="Return"
              title={`주요 유입 ${granularityCopy[granularity].label}`}
              subtitle="외부에서 상일동 생활권으로 들어오는 비중이 높은 대상지입니다."
            >
              <OdBarChart rows={active.zoneToDestination.data.rows.slice(0, 6)} directionLabel={`inbound-${granularity}`} />
            </SectionCard>

            <SectionCard
              eyebrow="Layers"
              title="표현 메모"
              subtitle="같은 데이터 경로를 유지하면서 권역과 구·시를 전환할 수 있도록 정리했습니다."
            >
              <ul className="space-y-3 text-sm text-slate-300">
                <li>- 기본은 구·시 기준입니다. 아직 sgg row가 비어 있으면 권역으로 안전하게 fallback 합니다.</li>
                <li>- 권역은 기존 polygon 위치를 쓰고, 구·시는 fallback 배치로 먼저 읽기 좋게 배치합니다.</li>
                <li>- 내일 live OD 재적재가 성공하면 같은 UI에서 곧바로 구·시 기준 결과가 나타납니다.</li>
              </ul>
            </SectionCard>
          </aside>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <SectionCard
            eyebrow="Ridership"
            title="상일동역 승하차 추세"
            subtitle="역 단위 승하차 규모 변화는 아래 영역에서 별도로 봅니다."
          >
            <div className="space-y-6">
              <KpiCards kpis={overview.data.kpis} />
              <TrendChart rows={overview.data.trend} />
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Quality"
            title="적재 상태와 해석 범위"
            subtitle="DB 적재 범위와 현재 화면이 어떤 단위를 읽고 있는지 함께 보여줍니다."
          >
            <DataQualityPanel
              grainLabel={quality.meta.grainLabel}
              lastLoadedAt={quality.meta.lastLoadedAt}
              limitations={quality.data.warnings.concat(quality.meta.limitations)}
              metrics={quality.data.metrics}
            />
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <SectionCard
            eyebrow="Temporal"
            title={`${granularityCopy[granularity].label} 기준 시간대 패턴`}
            subtitle="15분 적재가 성공하면 이 패널도 같은 granularity를 따라갑니다."
          >
            <HourlyProfile rows={active.hourly.data.rows} />
          </SectionCard>

          <SectionCard
            eyebrow="Reading guide"
            title="운영 해석 가이드"
            subtitle="현재는 권역과 구·시를 같은 구조에서 전환하며, 품질 패널에서 적재 상태를 함께 확인합니다."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-black/18 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">기본 단위</p>
                <p className="mt-2 text-lg font-semibold text-white">{granularityCopy[granularity].label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  현재 데이터가 준비된 가장 세밀한 단위를 먼저 보여주고, 필요할 때 권역 요약으로 압축합니다.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/18 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">대표 대상지</p>
                <p className="mt-2 text-lg font-semibold text-white">{active.originToZone.data.rows[0]?.zoneName ?? "-"}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  기본 outbound 기준에서 비중이 가장 높은 대상지입니다. sgg 적재 후에는 훨씬 세밀해집니다.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/18 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">주의할 점</p>
                <p className="mt-2 text-lg font-semibold text-white">역 OD 아님</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  OD는 생활권 기반으로 해석하며, 역-역 OD로 오해하지 않도록 quality 패널과 설명을 함께 봅니다.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
