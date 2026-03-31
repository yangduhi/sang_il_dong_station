type TrendPoint = {
  serviceDate: string;
  rideCount: number;
  alightCount: number;
};

type TrendChartProps = {
  rows: TrendPoint[];
};

function createPolyline(rows: TrendPoint[], key: "rideCount" | "alightCount", height: number, width: number) {
  const values = rows.map((row) => row[key]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const delta = Math.max(1, max - min);

  return rows
    .map((row, index) => {
      const x = (index / Math.max(1, rows.length - 1)) * width;
      const y = height - ((row[key] - min) / delta) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export function TrendChart({ rows }: TrendChartProps) {
  const width = 820;
  const height = 250;

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${width} ${height + 32}`} className="h-72 w-full rounded-[24px] bg-black/18 p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <line
            key={index}
            x1="0"
            x2={width}
            y1={(height / 4) * index}
            y2={(height / 4) * index}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="6 8"
          />
        ))}
        <polyline fill="none" stroke="#22c55e" strokeWidth="4" points={createPolyline(rows, "rideCount", height, width)} />
        <polyline fill="none" stroke="#f59e0b" strokeWidth="4" points={createPolyline(rows, "alightCount", height, width)} />
      </svg>
      <div className="flex flex-wrap gap-4 text-sm text-slate-300">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-500" /> 승차
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-amber-400" /> 하차
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 md:grid-cols-7">
        {rows.slice(-7).map((row) => (
          <div key={row.serviceDate}>{row.serviceDate}</div>
        ))}
      </div>
    </div>
  );
}
