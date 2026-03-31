type OdRow = {
  zoneName: string;
  passengerCount: number;
  sharePct: number;
  topStationName: string;
};

type OdBarChartProps = {
  rows: OdRow[];
  directionLabel: string;
};

export function OdBarChart({ rows, directionLabel }: OdBarChartProps) {
  const max = Math.max(...rows.map((row) => row.passengerCount));

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={`${directionLabel}-${row.zoneName}`} className="space-y-1">
          <div className="flex items-center justify-between gap-4 text-sm">
            <div>
              <span className="font-medium text-slate-900">{row.zoneName}</span>
              <span className="ml-2 text-slate-500">Top 역: {row.topStationName}</span>
            </div>
            <div className="text-right text-slate-700">
              {row.passengerCount.toLocaleString()}명 · {row.sharePct.toFixed(1)}%
            </div>
          </div>
          <div className="h-3 rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-emerald-700"
              style={{ width: `${Math.max(6, (row.passengerCount / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
