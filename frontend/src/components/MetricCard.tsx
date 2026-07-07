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
  const toneClass = tone === "danger" ? "border-slate-300 bg-white" : "border-slate-200 bg-white";

  return (
    <div className={`panel p-4 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-steel">{label}</p>
        {icon ? <span className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-slate-50 text-steel">{icon}</span> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        {detail ? <p className="text-xs text-steel">{detail}</p> : <span />}
        {trend ? <span className="rounded-full border border-line bg-white px-2 py-0.5 text-xs font-semibold text-steel">{trend}</span> : null}
      </div>
    </div>
  );
}
