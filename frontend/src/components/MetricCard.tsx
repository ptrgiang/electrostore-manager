import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string | number;
  tone?: "neutral" | "good" | "warn" | "danger";
  detail?: string;
  icon?: ReactNode;
  trend?: string;
};

export function MetricCard({ label, value, tone = "neutral", detail, icon, trend }: MetricCardProps) {
  const toneClass =
    tone === "good"
      ? "border-circuit/20 bg-teal-50/80"
      : tone === "warn"
        ? "border-signal/30 bg-amber-50/80"
        : tone === "danger"
          ? "border-rose-200 bg-rose-50/80"
          : "border-slate-200 bg-white";
  const iconClass = tone === "good" ? "bg-teal-100 text-circuit" : tone === "warn" ? "bg-amber-100 text-amber-700" : tone === "danger" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-steel";

  return (
    <div className={`panel p-4 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-steel">{label}</p>
        {icon ? <span className={`grid h-9 w-9 place-items-center rounded-lg ${iconClass}`}>{icon}</span> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        {detail ? <p className="text-xs text-steel">{detail}</p> : <span />}
        {trend ? <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-circuit">{trend}</span> : null}
      </div>
    </div>
  );
}
