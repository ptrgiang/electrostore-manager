export function StatusBadge({ value }: { value: string }) {
  const label = value.replace(/_/g, " ");
  const tone =
    value === "completed" || value === "active" || value === "in_stock" || value === "import"
      ? "border-teal-200 bg-teal-50 text-teal-700"
      : value === "low_stock" || value === "pending" || value === "export"
        ? "border-amber-200 bg-amber-50 text-amber-700"
      : value === "out_of_stock" || value === "refunded"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-slate-200 bg-slate-100 text-slate-700";

  return <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold capitalize leading-none ${tone}`}>{label}</span>;
}
