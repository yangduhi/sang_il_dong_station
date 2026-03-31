type HourlyProfileProps = {
  rows: Array<{
    hourBucket: string;
    rideCount: number;
    alightCount: number;
  }>;
};

export function HourlyProfile({ rows }: HourlyProfileProps) {
  if (!rows.length) {
    return (
      <div className="space-y-4 rounded-[24px] border border-white/10 bg-black/18 p-5 text-sm text-slate-200">
        <p className="leading-7">
          역 단위 시간대 승하차 live source는 아직 연결하지 않았습니다. 대신 현재 공개 source에서
          검증된 것은 `상일동역 일별 승하차`와 `상일동 생활권(읍면동) 기준 OD`, 그리고
          `생활권 OD 15분 endpoint` 입니다.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Verified now</p>
            <p className="mt-2 text-base font-semibold text-white">일별 역 승하차</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">OD granularity</p>
            <p className="mt-2 text-base font-semibold text-white">생활권 / 읍면동</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Next iteration</p>
            <p className="mt-2 text-base font-semibold text-white">15분 OD 패턴 맵</p>
          </div>
        </div>
      </div>
    );
  }

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
