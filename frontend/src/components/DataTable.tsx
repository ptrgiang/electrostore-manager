import type { ReactNode } from "react";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

export function DataTable<T>({ columns, rows, empty }: { columns: Column<T>[]; rows: T[]; empty: string }) {
  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-steel">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-top">
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
