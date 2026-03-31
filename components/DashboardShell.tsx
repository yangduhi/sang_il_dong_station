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
                상일동 생활권 OD를 한 화면에서 읽는 지도형 대시보드
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                역 단위 승하차 추세와 생활권 기반 대중교통 OD를 분리해서 보여줍니다.
                상단 메인 맵은 상일동 생활권과 서울·경기 권역 사이의 흐름을 보여주고,
                하단 분석 영역은 상일동역 자체의 규모와 품질 메모를 정리합니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px]">
              <div className="rounded-[24px] border border-white/10 bg-black/18 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">승하차 범위</p>
                <p className="mt-2 text-lg font-semibold text-white">{overview.data.analysisScope.scopeLabel}</p>
                <p className="mt-1 text-sm text-slate-300">{overview.data.analysisScope.description}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/18 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">OD 범위</p>
                <p className="mt-2 text-lg font-semibold text-white">{originToZone.data.analysisScope.scopeLabel}</p>
                <p className="mt-1 text-sm text-slate-300">{originToZone.data.analysisScope.description}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <ZoneFlowMap
            title="상일동 생활권 OD 맵"
            subtitle="생활권 중심의 대중교통 흐름을 권역 레벨로 단순화해, 공간 관계가 먼저 읽히도록 설계했습니다."
            scopeLabel={originToZone.data.analysisScope.scopeLabel}
            outboundRows={originToZone.data.rows}
            inboundRows={zoneToDestination.data.rows}
          />

          <aside className="space-y-6">
            <SectionCard
              eyebrow="Insights"
              title="주요 도착 권역"
              subtitle="상일동 생활권에서 바깥으로 나갈 때 도착 비중이 높은 권역입니다."
            >
              <OdBarChart rows={originToZone.data.rows.slice(0, 6)} directionLabel="origin-to-zone-side" />
            </SectionCard>

            <SectionCard
              eyebrow="Return"
              title="주요 유입 권역"
              subtitle="외부 권역에서 상일동 생활권으로 유입되는 흐름입니다."
            >
              <OdBarChart rows={zoneToDestination.data.rows.slice(0, 6)} directionLabel="zone-to-destination-side" />
            </SectionCard>

            <SectionCard
              eyebrow="Layers"
              title="표현 메모"
              subtitle="첫 화면은 맵 중심으로 읽히고, 해석 문장은 오른쪽 레일에서 바로 따라옵니다."
            >
              <ul className="space-y-3 text-sm text-slate-300">
                <li>- 권역 색상은 선택한 모드의 상대적 강도를 뜻합니다.</li>
                <li>- 흐름선은 생활권과 권역 centroid를 잇는 개념도입니다.</li>
                <li>- 15분 OD와 히트맵은 다음 단계에서 맵 모드 전환으로 확장할 수 있습니다.</li>
              </ul>
            </SectionCard>
          </aside>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <SectionCard
            eyebrow="Ridership"
            title="상일동역 승하차 추세"
            subtitle="역 단위 live 데이터의 규모 변화는 지도 아래에서 별도로 읽습니다."
          >
            <div className="space-y-6">
              <KpiCards kpis={overview.data.kpis} />
              <TrendChart rows={overview.data.trend} />
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Quality"
            title="데이터 품질과 해석 범위"
            subtitle="이 대시보드의 두 층위가 어떻게 다른지 제품 표면에서 숨기지 않습니다."
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
            title="시간대 패턴"
            subtitle="역 단위 시간대 데이터는 아직 보수적으로 분리해 두고, 현재 단계의 연결 범위를 명확히 보여줍니다."
          >
            <HourlyProfile rows={hourly.data.rows} />
          </SectionCard>

          <SectionCard
            eyebrow="Reading guide"
            title="실제 운영 해석"
            subtitle="권역 맵에서 읽은 흐름을 업무/주거/배후권 관점으로 바로 번역합니다."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-black/18 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">업무권 이동</p>
                <p className="mt-2 text-lg font-semibold text-white">{originToZone.data.rows[0]?.zoneName}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  생활권 outbound 기준으로 가장 큰 권역입니다. 직주 이동 해석의 시작점이 됩니다.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/18 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">근접 배후권</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {
                    zoneToDestination.data.rows.find((row) => row.zoneName.includes("하남"))?.zoneName ??
                    "하남·구리·남양주"
                  }
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  상일동 생활권과 인접 수도권 사이의 대중교통 수요를 읽는 핵심 구간입니다.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/18 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">주의할 점</p>
                <p className="mt-2 text-lg font-semibold text-white">역 OD가 아님</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  OD는 생활권 기반이므로, 역-역 해석은 별도 원천 없이는 직접 만들지 않습니다.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
