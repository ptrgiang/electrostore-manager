type MetricCardProps = {
  label: string;
  value: string | number;
  tone?: "neutral" | "good" | "warn";
};

export function MetricCard({ label, value, tone = "neutral" }: MetricCardProps) {
  const toneClass =
    tone === "good" ? "border-circuit/30 bg-teal-50" : tone === "warn" ? "border-signal/40 bg-amber-50" : "border-slate-200 bg-white";

  return (
    <div className={`panel p-4 ${toneClass}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-steel">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
