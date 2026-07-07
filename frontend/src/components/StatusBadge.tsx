export function StatusBadge({ value }: { value: string }) {
  const label = value.replace(/_/g, " ");
  const tone =
    value === "completed" || value === "active" || value === "in_stock"
      ? "bg-teal-50 text-teal-700"
      : value === "low_stock" || value === "pending"
        ? "bg-amber-50 text-amber-700"
        : value === "out_of_stock" || value === "refunded"
          ? "bg-rose-50 text-rose-700"
          : "bg-slate-100 text-slate-700";

  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold capitalize ${tone}`}>{label}</span>;
}
