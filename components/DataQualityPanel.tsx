type DataQualityPanelProps = {
  grainLabel: string;
  lastLoadedAt: string;
  limitations: string[];
  metrics: Array<{
    label: string;
    value: string;
    status: "good" | "warning" | "critical";
  }>;
};

const statusColorMap = {
  good: "border border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  warning: "border border-amber-300/25 bg-amber-300/10 text-amber-100",
  critical: "border border-rose-400/25 bg-rose-400/10 text-rose-200"
};

export function DataQualityPanel({
  grainLabel,
  lastLoadedAt,
  limitations,
  metrics
}: DataQualityPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm font-medium text-white">
          grainLabel: {grainLabel}
        </span>
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm font-medium text-slate-200">
          lastLoadedAt: {lastLoadedAt}
        </span>
      </div>
      <div className="grid gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-black/20 px-4 py-3"
          >
            <span className="text-sm text-slate-300">{metric.label}</span>
            <div className="flex items-center gap-3 text-right">
              <span className="font-display text-lg font-semibold text-white">{metric.value}</span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${statusColorMap[metric.status]}`}>
                {metric.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-[24px] border border-amber-300/25 bg-amber-300/10 p-4">
        <p className="mb-3 text-sm font-semibold text-amber-100">Known limitations</p>
        <ul className="space-y-2 text-sm leading-6 text-amber-100/90">
          {limitations.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
