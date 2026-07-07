import type { ReactNode } from "react";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

export function DataTable<T>({ columns, rows, empty, title, meta }: { columns: Column<T>[]; rows: T[]; empty: string; title?: string; meta?: string }) {
  return (
    <div className="panel overflow-hidden">
      {title || meta ? (
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          {title ? <h2 className="text-sm font-semibold text-ink">{title}</h2> : <span />}
          {meta ? <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-steel">{meta}</span> : null}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-steel">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-4 py-3 font-semibold">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row, index) => (
              <tr key={index} className="transition hover:bg-teal-50/40">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-middle text-slate-700">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-steel" colSpan={columns.length}>
                  {empty}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
