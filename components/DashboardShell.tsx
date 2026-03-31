import { DataQualityPanel } from "@/components/DataQualityPanel";
import { HourlyProfile } from "@/components/HourlyProfile";
import { KpiCards } from "@/components/KpiCards";
import { OdBarChart } from "@/components/OdBarChart";
import { SectionCard } from "@/components/SectionCard";
import { TrendChart } from "@/components/TrendChart";
import type {
  DataQualitySummaryResponse,
  HourlyProfileResponse,
  OdOriginToZoneResponse,
  OdZoneToDestinationResponse,
  StationOverviewResponse
} from "@/lib/schemas/responses";

type DashboardShellProps = {
  overview: StationOverviewResponse;
  hourly: HourlyProfileResponse;
  originToZone: OdOriginToZoneResponse;
  zoneToDestination: OdZoneToDestinationResponse;
  quality: DataQualitySummaryResponse;
};

export function DashboardShell({
  overview,
  hourly,
  originToZone,
  zoneToDestination,
  quality
}: DashboardShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <section className="rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-panel md:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-blue-200">Sangil-dong Data Product</p>
            <h1 className="mt-2 text-3xl font-semibold md:text-5xl">
              상일동역 승하차 추세 + 상일동 생활권 대중교통 OD
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
              상단은 상일동역(5호선)의 역 단위 승하차 추세를 보여주고, 하단은 공개 OD API를 이용해
              상일동 생활권에서 어느 권역으로 이동하는지, 어느 권역에서 상일동 생활권으로 들어오는지를 보여줍니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-white/10 px-4 py-2">{overview.data.station.lineName}</span>
            <span className="rounded-full bg-white/10 px-4 py-2">
              승하차 범위: {overview.data.analysisScope.scopeLabel}
            </span>
            <span className="rounded-full bg-emerald-400/20 px-4 py-2">
              OD 범위: {originToZone.data.analysisScope.scopeLabel}
            </span>
          </div>
        </div>
      </section>

      <SectionCard title="핵심 지표" subtitle="상일동역 역 단위 승하차 live 데이터 기준입니다.">
        <KpiCards kpis={overview.data.kpis} />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <SectionCard title="상일동역 일별 승하차 추세" subtitle="서울 공개 API에서 확인한 상일동역 일별 승차/하차 추세입니다.">
          <TrendChart rows={overview.data.trend} />
        </SectionCard>
        <SectionCard title="데이터 품질 / 해석 범위" subtitle="역 기반 지표와 생활권 기반 지표를 한 화면에서 구분해 읽을 수 있게 합니다.">
          <DataQualityPanel
            grainLabel={quality.meta.grainLabel}
            lastLoadedAt={quality.meta.lastLoadedAt}
            limitations={quality.data.warnings.concat(quality.meta.limitations)}
            metrics={quality.data.metrics}
          />
        </SectionCard>
      </div>

      <SectionCard
        title="시간대별 패턴"
        subtitle="역 단위 시간대 승하차 live source는 아직 연결하지 않았기 때문에 별도 안내 상태를 노출합니다."
      >
        <HourlyProfile rows={hourly.data.rows} />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="상일동 생활권 출발 -> 권역 도착"
          subtitle="공개 OD API에서 상일동(읍면동) 출발 대중교통 이동을 권역 단위로 재집계한 결과입니다."
        >
          <OdBarChart rows={originToZone.data.rows} directionLabel="origin-to-zone" />
        </SectionCard>
        <SectionCard
          title="권역 출발 -> 상일동 생활권 도착"
          subtitle="공개 OD API에서 상일동(읍면동) 도착 대중교통 이동을 권역 단위로 재집계한 결과입니다."
        >
          <OdBarChart rows={zoneToDestination.data.rows} directionLabel="zone-to-destination" />
        </SectionCard>
      </div>
    </main>
  );
}
