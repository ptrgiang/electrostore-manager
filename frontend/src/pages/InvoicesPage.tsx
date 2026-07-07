import { useMemo, useState } from "react";
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
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "refunded">("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const invoices = useQuery({ queryKey: ["invoices"], queryFn: invoicesApi.list });
  const detail = useQuery({ queryKey: ["invoice", selectedId], queryFn: () => invoicesApi.get(selectedId!), enabled: Boolean(selectedId) });
  const refund = useMutation({
    mutationFn: invoicesApi.refund,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] })
  });
  const rows = useMemo(
    () =>
      (invoices.data || []).filter((invoice) => {
        const date = invoice.created_at.slice(0, 10);
        return (
          (statusFilter === "all" || invoice.status === statusFilter) &&
          (paymentFilter === "all" || invoice.payment_method === paymentFilter) &&
          (!from || date >= from) &&
          (!to || date <= to)
        );
      }),
    [from, invoices.data, paymentFilter, statusFilter, to]
  );

  if (invoices.isLoading) {
    return <LoadingState label="Loading invoices..." />;
  }
  if (invoices.isError) {
    return <ErrorState label="Could not load invoices." onRetry={() => invoices.refetch()} />;
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Invoices" description="Sales invoices, line-item details, and manager refunds." />
      <div className="panel flex flex-wrap items-center gap-3 p-4">
        <label className="min-w-40">
          <span className="field-label">Status</span>
          <select className="control w-full" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | "completed" | "refunded")}>
            <option value="all">All status</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
          </select>
        </label>
        <label className="min-w-40">
          <span className="field-label">Payment</span>
          <select className="control w-full" value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}>
            <option value="all">All payments</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="transfer">Transfer</option>
            <option value="qr">QR</option>
          </select>
        </label>
        <label>
          <span className="field-label">From</span>
          <input className="control" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <label>
          <span className="field-label">To</span>
          <input className="control" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </label>
      </div>
      <DataTable<Invoice>
        title="Invoice Register"
        meta={`${rows.length} invoices`}
        empty="No invoices yet."
        rows={rows}
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
            align: "right",
            render: (row) => (
              <div className="flex justify-end gap-2">
                <button className="btn btn-soft px-3 py-1.5 text-xs" onClick={() => setSelectedId(row.id)}>Detail</button>
                {user?.role === "manager" && row.status !== "refunded" ? <button className="btn btn-danger px-3 py-1.5 text-xs" onClick={() => refund.mutate(row.id)}>Refund</button> : null}
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
