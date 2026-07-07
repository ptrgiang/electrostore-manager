export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="panel flex items-center gap-3 p-5 text-sm text-steel">
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-circuit" />
      {label}
    </div>
  );
}

export function ErrorState({ label = "Something went wrong.", onRetry }: { label?: string; onRetry?: () => void }) {
  return (
    <div className="panel flex items-center justify-between gap-3 border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      <span>{label}</span>
      {onRetry ? (
        <button className="focus-ring rounded border border-rose-200 bg-white px-3 py-1 font-semibold" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, detail, action }: { title: string; detail?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-white text-lg font-semibold text-circuit shadow-sm">+</div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {detail ? <p className="mt-1 max-w-md text-xs text-steel">{detail}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
