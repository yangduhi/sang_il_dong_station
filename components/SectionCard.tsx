type SectionCardProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children: React.ReactNode;
};

export function SectionCard({ title, subtitle, eyebrow, children }: SectionCardProps) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-[#09131f]/88 p-6 shadow-[0_24px_64px_rgba(2,6,23,0.35)] backdrop-blur-xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/70">{eyebrow}</p>
          ) : null}
          <h2 className="mt-2 text-lg font-semibold text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-300">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}
