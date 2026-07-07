export function StatusBadge({ value }: { value: string }) {
  const label = value.replace(/_/g, " ");

  return <span className="inline-flex whitespace-nowrap rounded-full border border-line bg-white px-2.5 py-1 text-xs font-semibold capitalize leading-none text-slate-700">{label}</span>;
}
