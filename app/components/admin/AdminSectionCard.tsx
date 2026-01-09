type AdminSectionCardProps = {
  title: string;
  items: string[];
  badge?: string;
  tone?: "info" | "success" | "warning" | "danger" | "muted";
  description?: string;
};

const badgeToneClasses: Record<
  NonNullable<AdminSectionCardProps["tone"]>,
  string
> = {
  info: "bg-primary-500/15 text-primary-100 ring-primary-500/30",
  success: "bg-success-500/15 text-success-100 ring-success-500/30",
  warning: "bg-warning-500/15 text-warning-100 ring-warning-500/30",
  danger: "bg-danger-500/15 text-danger-100 ring-danger-500/30",
  muted: "bg-slate-800 text-slate-300 ring-slate-700",
};

export default function AdminSectionCard({
  title,
  items,
  badge,
  tone = "info",
  description,
}: AdminSectionCardProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.85)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          ) : null}
        </div>
        {badge ? (
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${badgeToneClasses[tone]}`}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <ul className="mt-3 space-y-2 text-sm text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-primary-400" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
