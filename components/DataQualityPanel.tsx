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
  good: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  critical: "bg-rose-100 text-rose-800"
};

export function DataQualityPanel({
  grainLabel,
  lastLoadedAt,
  limitations,
  metrics
}: DataQualityPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
          grainLabel: {grainLabel}
        </span>
        <span className="rounded-full bg-white/8 px-3 py-1 text-sm font-medium text-slate-200">
          lastLoadedAt: {lastLoadedAt}
        </span>
      </div>
      <div className="grid gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between rounded-2xl bg-black/18 px-4 py-3">
            <span className="text-sm text-slate-300">{metric.label}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">{metric.value}</span>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColorMap[metric.status]}`}>
                {metric.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4">
        <p className="mb-2 text-sm font-semibold text-amber-100">Known limitations</p>
        <ul className="space-y-2 text-sm text-amber-100/90">
          {limitations.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
