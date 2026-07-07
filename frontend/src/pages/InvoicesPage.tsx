import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoicesApi } from "../api/resources.api";
import type { Invoice } from "../api/types";
import { DataTable } from "../components/DataTable";
import { ErrorState, LoadingState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import { PageHeader } from "../components/PageHeader";

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
    <section className="space-y-5">
      <PageHeader title="Invoices" description="Sales invoices, line-item details, and manager refunds." />
      <DataTable<Invoice>
        title="Invoice Register"
        meta={`${invoices.data?.length || 0} invoices`}
        empty="No invoices yet."
        rows={invoices.data || []}
        columns={[
          { key: "code", header: "Invoice", render: (row) => <span className="font-semibold text-ink">{row.invoice_code}</span>, sortValue: (row) => row.invoice_code },
          { key: "customer", header: "Customer", render: (row) => row.customer?.full_name || "Walk-in", sortValue: (row) => row.customer?.full_name || "" },
          { key: "total", header: "Total", align: "right", render: (row) => money(row.total_amount), sortValue: (row) => row.total_amount },
          { key: "payment", header: "Payment", render: (row) => <span className="capitalize">{row.payment_method}</span>, sortValue: (row) => row.payment_method },
          { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} />, sortValue: (row) => row.status },
          { key: "created", header: "Created At", render: (row) => new Date(row.created_at).toLocaleString(), sortValue: (row) => new Date(row.created_at) },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <div className="flex gap-2">
                <button className="btn btn-soft px-3 py-1 text-xs" onClick={() => setSelectedId(row.id)}>Detail</button>
                {user?.role === "manager" && row.status !== "refunded" ? <button className="btn btn-danger px-3 py-1 text-xs" onClick={() => refund.mutate(row.id)}>Refund</button> : null}
              </div>
            )
          }
        ]}
      />
      {selectedId ? (
        <div className="panel p-4">
          <div className="section-title">
            <h2>Invoice detail</h2>
            <button className="btn btn-soft px-3 py-1 text-xs" onClick={() => setSelectedId(null)}>Close</button>
          </div>
          {detail.isLoading ? <p className="mt-2 text-sm text-steel">Loading...</p> : null}
          {detail.data ? (
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-line bg-slate-50 p-3">
                <strong>{detail.data.invoice_code}</strong>
                <strong className="tabular-nums text-ink">{money(detail.data.total_amount)}</strong>
              </div>
              <ul className="divide-y divide-slate-100">
                {(detail.data.items || []).map((item) => (
                  <li key={`${item.product_id}-${item.unit_price}`} className="flex justify-between py-2">
                    <span>{item.product?.name || item.product_id} x {item.quantity}</span>
                    <span className="tabular-nums">{money(item.unit_price * item.quantity)}</span>
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
