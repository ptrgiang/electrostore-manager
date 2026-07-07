import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ErrorState, LoadingState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import { invoicesApi, reportsApi } from "../api/resources.api";
import type { Invoice, Product } from "../api/types";

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);
}

export function DashboardPage() {
  const today = new Date().toISOString().slice(0, 10);
  const revenue = useQuery({ queryKey: ["revenue", today], queryFn: () => reportsApi.revenue({ from: today, to: today }) });
  const lowStock = useQuery({ queryKey: ["low-stock"], queryFn: reportsApi.lowStock });
  const topProducts = useQuery({ queryKey: ["top-products", today], queryFn: () => reportsApi.topProducts({ limit: "5" }) });
  const invoices = useQuery({ queryKey: ["invoices"], queryFn: invoicesApi.list });

  if (revenue.isLoading || lowStock.isLoading || topProducts.isLoading || invoices.isLoading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (revenue.isError || lowStock.isError || topProducts.isError || invoices.isError) {
    return <ErrorState label="Could not load dashboard." onRetry={() => window.location.reload()} />;
  }

  const recent = (invoices.data || []).slice(0, 5);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-steel">Daily store pulse and exception alerts.</p>
        </div>
        <Link className="focus-ring rounded bg-circuit px-4 py-2 text-sm font-semibold text-white" to="/pos">
          Open POS
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Today Revenue" value={money(revenue.data?.revenue || 0)} tone="good" />
        <MetricCard label="Today Invoices" value={revenue.data?.invoice_count || 0} />
        <MetricCard label="Low Stock Products" value={lowStock.data?.length || 0} tone="warn" />
        <MetricCard label="Top Products" value={topProducts.data?.length || 0} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold">Recent Sales</h2>
          <DataTable<Invoice>
            empty="No invoices yet."
            rows={recent}
            columns={[
              { key: "code", header: "Invoice", render: (row) => row.invoice_code },
              { key: "total", header: "Total", render: (row) => money(row.total_amount) },
              { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> }
            ]}
          />
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold">Low Stock</h2>
          <DataTable<Product>
            empty="No low-stock products."
            rows={lowStock.data || []}
            columns={[
              { key: "sku", header: "SKU", render: (row) => row.sku },
              { key: "name", header: "Product", render: (row) => row.name },
              { key: "qty", header: "Qty", render: (row) => row.stock_qty ?? (row as unknown as { current_qty: number }).current_qty }
            ]}
          />
        </div>
      </div>
    </section>
  );
}
