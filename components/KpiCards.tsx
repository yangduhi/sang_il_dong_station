type KpiCardsProps = {
  kpis: {
    latestRideCount: number;
    latestAlightCount: number;
    rollingSevenDayAverage: number;
    weekOverWeekDeltaPct: number;
  };
};

const metrics = [
  {
    key: "latestRideCount",
    label: "최근 일자 승차",
    suffix: "명"
  },
  {
    key: "latestAlightCount",
    label: "최근 일자 하차",
    suffix: "명"
  },
  {
    key: "rollingSevenDayAverage",
    label: "최근 7일 평균",
    suffix: "명"
  },
  {
    key: "weekOverWeekDeltaPct",
    label: "전주 대비",
    suffix: "%"
  }
] as const;

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid gap-x-5 gap-y-6 border-y border-white/10 py-5 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const rawValue = kpis[metric.key];
        const value =
          metric.key === "weekOverWeekDeltaPct" ? rawValue.toFixed(1) : rawValue.toLocaleString("ko-KR");

        return (
          <div key={metric.key} className="border-l border-white/10 pl-5 first:border-l-0 first:pl-0">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
            <div className="mt-3 flex items-end gap-2">
              <p className="font-display text-4xl font-semibold text-white">{value}</p>
              <p className="pb-1 text-sm text-slate-400">{metric.suffix}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
