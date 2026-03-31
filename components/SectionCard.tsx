type SectionCardProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
};

export function SectionCard({ title, subtitle, eyebrow, children, className }: SectionCardProps) {
  return (
    <section
      className={[
        "relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,14,25,0.92),rgba(6,11,20,0.78))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.34)] backdrop-blur-xl md:p-7",
        className ?? ""
      ].join(" ")}
    >
      <div className="panel-edge" />
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#86f3de]/70">{eyebrow}</p>
          ) : null}
          <h2 className="font-display mt-2 text-[1.45rem] font-semibold text-white">{title}</h2>
          {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}
