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
  const width = 800;
  const height = 220;

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${width} ${height + 28}`} className="h-64 w-full rounded-2xl bg-slate-50 p-4">
        <polyline fill="none" stroke="#2563eb" strokeWidth="4" points={createPolyline(rows, "rideCount", height, width)} />
        <polyline fill="none" stroke="#be185d" strokeWidth="4" points={createPolyline(rows, "alightCount", height, width)} />
      </svg>
      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-blue-600" /> 승차
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-pink-700" /> 하차
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
