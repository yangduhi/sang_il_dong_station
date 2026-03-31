type HourlyProfileProps = {
  rows: Array<{
    hourBucket: string;
    rideCount: number;
    alightCount: number;
  }>;
};

export function HourlyProfile({ rows }: HourlyProfileProps) {
  const max = Math.max(...rows.flatMap((row) => [row.rideCount, row.alightCount]));

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.hourBucket} className="grid gap-2 md:grid-cols-[72px_1fr_1fr] md:items-center">
          <div className="text-sm font-medium text-slate-600">{row.hourBucket}</div>
          <div className="rounded-full bg-slate-100">
            <div
              className="rounded-full bg-blue-600 px-3 py-2 text-right text-xs font-semibold text-white"
              style={{ width: `${Math.max(8, (row.rideCount / max) * 100)}%` }}
            >
              승차 {row.rideCount.toLocaleString()}
            </div>
          </div>
          <div className="rounded-full bg-slate-100">
            <div
              className="rounded-full bg-pink-700 px-3 py-2 text-right text-xs font-semibold text-white"
              style={{ width: `${Math.max(8, (row.alightCount / max) * 100)}%` }}
            >
              하차 {row.alightCount.toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
