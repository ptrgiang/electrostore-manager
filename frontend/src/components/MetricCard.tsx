type MetricCardProps = {
  label: string;
  value: string | number;
  tone?: "neutral" | "good" | "warn" | "danger";
  detail?: string;
};

export function MetricCard({ label, value, tone = "neutral", detail }: MetricCardProps) {
  const toneClass =
    tone === "good"
      ? "border-circuit/30 bg-teal-50"
      : tone === "warn"
        ? "border-signal/40 bg-amber-50"
        : tone === "danger"
          ? "border-rose-200 bg-rose-50"
          : "border-slate-200 bg-white";
  const dotClass = tone === "good" ? "bg-circuit" : tone === "warn" ? "bg-signal" : tone === "danger" ? "bg-rose-500" : "bg-slate-400";

  return (
    <div className={`panel p-4 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase text-steel">{label}</p>
        <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      </div>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      {detail ? <p className="mt-1 text-xs text-steel">{detail}</p> : null}
    </div>
  );
}
