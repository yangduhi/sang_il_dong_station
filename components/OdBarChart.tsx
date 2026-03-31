type OdRow = {
  zoneName: string;
  passengerCount: number;
  sharePct: number;
  topContextLabel: string;
};

type OdBarChartProps = {
  rows: OdRow[];
  directionLabel: string;
};

export function OdBarChart({ rows, directionLabel }: OdBarChartProps) {
  if (!rows.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-white/20 bg-black/[0.12] p-5 text-sm text-slate-400">
        현재 조건으로 표시할 생활권 OD 결과가 없습니다.
      </div>
    );
  }

  const max = Math.max(...rows.map((row) => row.passengerCount));

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={`${directionLabel}-${row.zoneName}`} className="space-y-2 rounded-[22px] border border-white/[0.08] bg-black/[0.16] px-4 py-3">
          <div className="flex items-center justify-between gap-4 text-sm">
            <div>
              <span className="font-medium text-white">{row.zoneName}</span>
              <span className="ml-2 text-slate-400">대표 생활권: {row.topContextLabel}</span>
            </div>
            <div className="text-right text-slate-300">
              {row.passengerCount.toLocaleString()}명 · {row.sharePct.toFixed(1)}%
            </div>
          </div>
          <div className="h-2.5 rounded-full bg-white/[0.08]">
            <div
              className="h-2.5 rounded-full bg-[linear-gradient(90deg,#2fe0b6,#8ef6e1)]"
              style={{ width: `${Math.max(6, (row.passengerCount / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
