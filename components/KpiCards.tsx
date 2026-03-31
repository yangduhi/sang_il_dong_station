type KpiCardsProps = {
  kpis: {
    latestRideCount: number;
    latestAlightCount: number;
    rollingSevenDayAverage: number;
    weekOverWeekDeltaPct: number;
  };
};

const cardClass =
  "rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm ring-1 ring-white/70";

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className={cardClass}>
        <p className="text-sm text-slate-500">최근 일자 승차</p>
        <p className="mt-2 text-2xl font-semibold">{kpis.latestRideCount.toLocaleString()}명</p>
      </div>
      <div className={cardClass}>
        <p className="text-sm text-slate-500">최근 일자 하차</p>
        <p className="mt-2 text-2xl font-semibold">{kpis.latestAlightCount.toLocaleString()}명</p>
      </div>
      <div className={cardClass}>
        <p className="text-sm text-slate-500">최근 7일 평균</p>
        <p className="mt-2 text-2xl font-semibold">{kpis.rollingSevenDayAverage.toLocaleString()}명</p>
      </div>
      <div className={cardClass}>
        <p className="text-sm text-slate-500">전주 대비</p>
        <p className="mt-2 text-2xl font-semibold">{kpis.weekOverWeekDeltaPct.toFixed(1)}%</p>
      </div>
    </div>
  );
}
