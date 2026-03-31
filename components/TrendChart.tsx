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

function createAreaPath(rows: TrendPoint[], key: "rideCount" | "alightCount", height: number, width: number) {
  const points = createPolyline(rows, key, height, width);
  return `M 0 ${height} L ${points} L ${width} ${height} Z`;
}

export function TrendChart({ rows }: TrendChartProps) {
  const width = 820;
  const height = 250;
  const recentRows = rows.slice(-7);

  if (!rows.length) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-black/20 px-5 py-6 text-sm text-slate-300">
        시계열 지표가 아직 적재되지 않았습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <svg
        viewBox={`0 0 ${width} ${height + 36}`}
        className="h-80 w-full rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-4"
      >
        <defs>
          <linearGradient id="trendRideFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(47, 224, 182, 0.3)" />
            <stop offset="100%" stopColor="rgba(47, 224, 182, 0)" />
          </linearGradient>
          <linearGradient id="trendAlightFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(244, 197, 106, 0.28)" />
            <stop offset="100%" stopColor="rgba(244, 197, 106, 0)" />
          </linearGradient>
        </defs>

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

        <path d={createAreaPath(rows, "rideCount", height, width)} fill="url(#trendRideFill)" />
        <path d={createAreaPath(rows, "alightCount", height, width)} fill="url(#trendAlightFill)" />

        <polyline
          fill="none"
          stroke="#2fe0b6"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={createPolyline(rows, "rideCount", height, width)}
        />
        <polyline
          fill="none"
          stroke="#f4c56a"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={createPolyline(rows, "alightCount", height, width)}
        />
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4 text-sm text-slate-300">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#2fe0b6]" /> 승차
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#f4c56a]" /> 하차
          </span>
        </div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">최근 14일 일 단위 적재</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 md:grid-cols-7">
        {recentRows.map((row) => (
          <div key={row.serviceDate} className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-center">
            {row.serviceDate.slice(5)}
          </div>
        ))}
      </div>
    </div>
  );
}
