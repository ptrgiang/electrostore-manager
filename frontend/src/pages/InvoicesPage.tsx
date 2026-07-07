import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoicesApi } from "../api/resources.api";
import type { Invoice } from "../api/types";
import { DataTable } from "../components/DataTable";
import { ErrorState, LoadingState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../hooks/useAuth";

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);
}

export function InvoicesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const invoices = useQuery({ queryKey: ["invoices"], queryFn: invoicesApi.list });
  const detail = useQuery({ queryKey: ["invoice", selectedId], queryFn: () => invoicesApi.get(selectedId!), enabled: Boolean(selectedId) });
  const refund = useMutation({
    mutationFn: invoicesApi.refund,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] })
  });

  if (invoices.isLoading) {
    return <LoadingState label="Loading invoices..." />;
  }
  if (invoices.isError) {
    return <ErrorState label="Could not load invoices." onRetry={() => invoices.refetch()} />;
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <p className="text-sm text-steel">Sales invoices, details, and manager refunds.</p>
      </div>
      <DataTable<Invoice>
        empty="No invoices yet."
        rows={invoices.data || []}
        columns={[
          { key: "code", header: "Invoice", render: (row) => row.invoice_code },
          { key: "customer", header: "Customer", render: (row) => row.customer?.full_name || "Walk-in" },
          { key: "total", header: "Total", render: (row) => money(row.total_amount) },
          { key: "payment", header: "Payment", render: (row) => row.payment_method },
          { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
          { key: "created", header: "Created At", render: (row) => new Date(row.created_at).toLocaleString() },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <div className="flex gap-2">
                <button className="focus-ring rounded border border-slate-200 px-3 py-1 text-sm" onClick={() => setSelectedId(row.id)}>Detail</button>
                {user?.role === "manager" && row.status !== "refunded" ? <button className="focus-ring rounded border border-rose-200 px-3 py-1 text-sm text-rose-700" onClick={() => refund.mutate(row.id)}>Refund</button> : null}
              </div>
            )
          }
        ]}
      />
      {selectedId ? (
        <div className="panel p-4">
          <h2 className="text-lg font-semibold">Invoice detail</h2>
          {detail.isLoading ? <p className="mt-2 text-sm text-steel">Loading...</p> : null}
          {detail.data ? (
            <div className="mt-3 space-y-2 text-sm">
              <p><strong>{detail.data.invoice_code}</strong> - {money(detail.data.total_amount)}</p>
              <ul className="divide-y divide-slate-100">
                {(detail.data.items || []).map((item) => (
                  <li key={`${item.product_id}-${item.unit_price}`} className="flex justify-between py-2">
                    <span>{item.product?.name || item.product_id} x {item.quantity}</span>
                    <span>{money(item.unit_price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
