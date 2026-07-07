import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ErrorState, LoadingState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import { PageHeader } from "../components/PageHeader";
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
      <PageHeader
        title="Dashboard"
        description="Daily store pulse, recent sales, and exception alerts."
        actions={<Link className="btn btn-primary" to="/pos">
          Open POS
        </Link>}
      />
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Today Revenue" value={money(revenue.data?.revenue || 0)} tone="good" detail="Completed sales only" />
        <MetricCard label="Today Invoices" value={revenue.data?.invoice_count || 0} detail="Active production day" />
        <MetricCard label="Low Stock Products" value={lowStock.data?.length || 0} tone="warn" detail="Needs replenishment" />
        <MetricCard label="Top Products" value={topProducts.data?.length || 0} detail="Ranked by units sold" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div>
          <DataTable<Invoice>
            title="Recent Sales"
            meta={`${recent.length} latest`}
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
          <DataTable<Product>
            title="Low Stock"
            meta={`${lowStock.data?.length || 0} alerts`}
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
