type KpiCardsProps = {
  kpis: {
    latestRideCount: number;
    latestAlightCount: number;
    rollingSevenDayAverage: number;
    weekOverWeekDeltaPct: number;
  };
};

const cardClass =
  "rounded-[24px] border border-white/10 bg-black/18 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]";

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className={cardClass}>
        <p className="text-sm text-slate-400">최근 일자 승차</p>
        <p className="mt-2 text-2xl font-semibold text-white">{kpis.latestRideCount.toLocaleString()}명</p>
      </div>
      <div className={cardClass}>
        <p className="text-sm text-slate-400">최근 일자 하차</p>
        <p className="mt-2 text-2xl font-semibold text-white">{kpis.latestAlightCount.toLocaleString()}명</p>
      </div>
      <div className={cardClass}>
        <p className="text-sm text-slate-400">최근 7일 평균</p>
        <p className="mt-2 text-2xl font-semibold text-white">{kpis.rollingSevenDayAverage.toLocaleString()}명</p>
      </div>
      <div className={cardClass}>
        <p className="text-sm text-slate-400">전주 대비</p>
        <p className="mt-2 text-2xl font-semibold text-white">{kpis.weekOverWeekDeltaPct.toFixed(1)}%</p>
      </div>
    </div>
  );
}
