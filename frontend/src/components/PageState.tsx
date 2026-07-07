export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="panel flex items-center gap-3 p-6 text-sm text-steel">
      <span className="h-2 w-2 animate-pulse rounded-full bg-circuit" />
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
