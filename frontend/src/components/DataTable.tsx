import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { EmptyState } from "./PageState";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  sortValue?: (row: T) => string | number | Date | null | undefined;
};

export function DataTable<T>({
  columns,
  rows,
  empty,
  title,
  meta,
  pageSize = 10
}: {
  columns: Column<T>[];
  rows: T[];
  empty: string;
  title?: string;
  meta?: string;
  pageSize?: number;
}) {
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);
  const sortedRows = useMemo(() => {
    if (!sort) {
      return rows;
    }

    const column = columns.find((item) => item.key === sort.key);
    if (!column?.sortValue) {
      return rows;
    }

    return [...rows].sort((a, b) => {
      const aValue = column.sortValue?.(a);
      const bValue = column.sortValue?.(b);
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      const result = aValue instanceof Date || bValue instanceof Date ? new Date(aValue).getTime() - new Date(bValue).getTime() : aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return sort.direction === "asc" ? result : -result;
    });
  }, [columns, rows, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const visiblePage = Math.min(page, totalPages);
  const visibleRows = sortedRows.slice((visiblePage - 1) * pageSize, visiblePage * pageSize);

  function toggleSort(column: Column<T>) {
    if (!column.sortValue) {
      return;
    }
    setPage(1);
    setSort((current) => {
      if (current?.key !== column.key) {
        return { key: column.key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key: column.key, direction: "desc" };
      }
      return null;
    });
  }

  return (
    <div className="panel overflow-hidden">
      {title || meta ? (
        <div className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3.5">
          {title ? <h2 className="text-sm font-semibold text-ink">{title}</h2> : <span />}
          {meta ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-steel">{meta}</span> : null}
        </div>
      ) : null}
      <div className="max-h-[640px] overflow-auto">
        <table className="min-w-full divide-y divide-line text-left text-sm">
          <thead className="sticky top-0 z-[1] bg-slate-50 text-[11px] uppercase tracking-wide text-steel shadow-[inset_0_-1px_0_#e2e8f0]">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={`whitespace-nowrap px-4 py-3 font-semibold ${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"}`}>
                  <button
                    className={`inline-flex items-center gap-1.5 ${column.sortValue ? "hover:text-ink" : "cursor-default"}`}
                    type="button"
                    onClick={() => toggleSort(column)}
                    disabled={!column.sortValue}
                  >
                    {column.header}
                    {column.sortValue ? sort?.key === column.key ? sort.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} /> : <ChevronsUpDown size={13} /> : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {visibleRows.map((row, index) => (
              <tr key={index} className="transition hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.key} className={`px-4 py-3.5 align-middle text-[13.5px] text-slate-700 ${column.align === "right" ? "text-right tabular-nums" : column.align === "center" ? "text-center" : ""}`}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6" colSpan={columns.length}>
                  <EmptyState title={empty} detail="Try adjusting filters or adding a new record." />
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {rows.length > pageSize ? (
        <div className="flex items-center justify-between gap-3 border-t border-line bg-white px-4 py-3 text-xs text-steel">
          <span>
            Showing {(visiblePage - 1) * pageSize + 1}-{Math.min(visiblePage * pageSize, rows.length)} of {rows.length}
          </span>
          <div className="flex items-center gap-2">
            <button className="btn btn-soft px-2.5 py-1.5 text-xs" type="button" disabled={visiblePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Previous
            </button>
            <span className="font-semibold text-ink">{visiblePage} / {totalPages}</span>
            <button className="btn btn-soft px-2.5 py-1.5 text-xs" type="button" disabled={visiblePage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
