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
            <p className="text-sm uppercase tracking-[0.24em] text-blue-200">Sangil-dong Station</p>
            <h1 className="mt-2 text-3xl font-semibold md:text-5xl">상일동역 승하차 추세 + 권역 OD</h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
              상일동역에서 승차한 승객이 어느 권역에서 하차하는지, 상일동역에서 하차한 승객이 어느 권역에서 승차했는지를
              같은 화면에서 추적합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-white/10 px-4 py-2">{overview.data.station.lineName}</span>
            <span className="rounded-full bg-white/10 px-4 py-2">{overview.data.station.zoneName}</span>
            <span className="rounded-full bg-emerald-400/20 px-4 py-2">
              data mode: {quality.data.dataMode}
            </span>
          </div>
        </div>
      </section>

      <SectionCard title="핵심 지표" subtitle="최근 일자 규모, 7일 평균, 전주 대비를 빠르게 확인합니다.">
        <KpiCards kpis={overview.data.kpis} />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <SectionCard title="일별 승하차 추세" subtitle="최근 14일 sample 추세를 기준으로 승차/하차 변화를 비교합니다.">
          <TrendChart rows={overview.data.trend} />
        </SectionCard>
        <SectionCard title="데이터 품질 / 제한사항" subtitle="grain, freshness, fallback 상태를 제품 표면에서 숨기지 않습니다.">
          <DataQualityPanel
            grainLabel={overview.meta.grainLabel}
            lastLoadedAt={overview.meta.lastLoadedAt}
            limitations={quality.data.warnings.concat(overview.meta.limitations)}
            metrics={quality.data.metrics}
          />
        </SectionCard>
      </div>

      <SectionCard title="시간대별 패턴" subtitle="평일 기준 상일동역 승차/하차 흐름을 시간대별로 확인합니다.">
        <HourlyProfile rows={hourly.data.rows} />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="상일동역 출발 -> 권역 도착"
          subtitle="상일동역에서 승차한 승객이 어느 권역에서 하차했는지 보여줍니다."
        >
          <OdBarChart rows={originToZone.data.rows} directionLabel="origin-to-zone" />
        </SectionCard>
        <SectionCard
          title="권역 출발 -> 상일동역 도착"
          subtitle="상일동역에서 하차한 승객이 어느 권역에서 승차했는지 보여줍니다."
        >
          <OdBarChart rows={zoneToDestination.data.rows} directionLabel="zone-to-destination" />
        </SectionCard>
      </div>
    </main>
  );
}
