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
  const iconClass =
    tone === "good"
      ? "border-teal-100 bg-white text-circuit"
      : tone === "warn"
        ? "border-amber-100 bg-white text-amber-600"
        : tone === "danger"
          ? "border-rose-100 bg-white text-rose-600"
          : "border-line bg-slate-50 text-steel";

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-steel">{label}</p>
        {icon ? <span className={`grid h-9 w-9 place-items-center rounded-lg border ${iconClass}`}>{icon}</span> : null}
      </div>
      <p className="mt-2 text-[1.7rem] font-semibold leading-tight tracking-tight text-ink">{value}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        {detail ? <p className="text-xs text-steel">{detail}</p> : <span />}
        {trend ? <span className="rounded-full border border-line bg-white px-2 py-0.5 text-xs font-semibold text-steel">{trend}</span> : null}
      </div>
    </div>
  );
}
