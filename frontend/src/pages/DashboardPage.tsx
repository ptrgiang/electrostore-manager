import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Boxes, DollarSign, PackagePlus, Receipt, ShoppingCart, TrendingUp, Undo2 } from "lucide-react";
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

function dateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function aggregateSeries(series: Array<{ date: string; revenue: number }>) {
  const byDate = new Map<string, number>();
  series.forEach((item) => {
    const date = item.date.slice(0, 10);
    byDate.set(date, (byDate.get(date) || 0) + item.revenue);
  });
  return [...byDate.entries()].map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date));
}

export function DashboardPage() {
  const today = new Date().toISOString().slice(0, 10);
  const weekStart = dateOffset(-6);
  const revenue = useQuery({ queryKey: ["revenue", today], queryFn: () => reportsApi.revenue({ from: today, to: today }) });
  const trend = useQuery({ queryKey: ["revenue-trend", weekStart, today], queryFn: () => reportsApi.revenue({ from: weekStart, to: today }) });
  const lowStock = useQuery({ queryKey: ["low-stock"], queryFn: reportsApi.lowStock });
  const topProducts = useQuery({ queryKey: ["top-products", today], queryFn: () => reportsApi.topProducts({ limit: "5" }) });
  const invoices = useQuery({ queryKey: ["invoices"], queryFn: invoicesApi.list });

  if (revenue.isLoading || trend.isLoading || lowStock.isLoading || topProducts.isLoading || invoices.isLoading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (revenue.isError || trend.isError || lowStock.isError || topProducts.isError || invoices.isError) {
    return <ErrorState label="Could not load dashboard." onRetry={() => window.location.reload()} />;
  }

  const invoiceRows = invoices.data || [];
  const recent = invoiceRows.slice(0, 6);
  const lowStockRows = lowStock.data || [];
  const refunded = invoiceRows.filter((invoice) => invoice.status === "refunded").length;
  const outOfStock = lowStockRows.filter((product) => product.stock_qty <= 0).length;
  const trendSeries = aggregateSeries(trend.data?.series || []);
  const grossProfit = invoiceRows
    .filter((invoice) => invoice.status === "completed")
    .flatMap((invoice) => invoice.items || [])
    .reduce((sum, item) => sum + item.quantity * (item.unit_price - (item.product?.cost_price || 0)), 0);

  return (
    <section className="space-y-5">
      <PageHeader
        title="Dashboard"
        description="Daily store pulse, revenue trend, recent sales, and operational exceptions."
        actions={
          <>
            <Link className="btn btn-primary" to="/pos"><ShoppingCart size={16} /> Open POS</Link>
            <Link className="btn btn-soft" to="/warehouse"><PackagePlus size={16} /> Import Stock</Link>
            <Link className="btn btn-soft" to="/products"><Boxes size={16} /> Add Product</Link>
          </>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Today Revenue" value={money(revenue.data?.revenue || 0)} tone="good" detail="Completed sales" icon={<DollarSign size={18} />} />
        <MetricCard label="Today Orders" value={revenue.data?.invoice_count || 0} detail="Invoices issued" icon={<Receipt size={18} />} />
        <MetricCard label="Low Stock SKUs" value={lowStockRows.length} tone="warn" detail="Below threshold" icon={<AlertTriangle size={18} />} />
        <MetricCard label="Out of Stock" value={outOfStock} tone={outOfStock ? "danger" : "neutral"} detail="Blocked for sale" icon={<Boxes size={18} />} />
        <MetricCard label="Gross Profit" value={money(grossProfit)} tone="good" detail="From invoice detail" icon={<TrendingUp size={18} />} />
        <MetricCard label="Refunded Invoices" value={refunded} tone={refunded ? "danger" : "neutral"} detail="Needs review" icon={<Undo2 size={18} />} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="panel p-4">
          <div className="section-title">
            <h2>Revenue Trend</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-steel">Last 7 days</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendSeries} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })} tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000000)}m`} tick={{ fontSize: 12 }} width={44} />
                <Tooltip formatter={(value) => money(Number(value))} labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                <Area type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={2} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <DataTable<{ product_id: number; name: string; total_sold: number; total_revenue: number }>
          title="Top Product Ranking"
          meta={`${topProducts.data?.length || 0} ranked`}
          empty="No product sales yet."
          rows={topProducts.data || []}
          pageSize={5}
          columns={[
            { key: "name", header: "Product", render: (row) => <span className="font-semibold text-ink">{row.name}</span>, sortValue: (row) => row.name },
            { key: "sold", header: "Sold", align: "right", render: (row) => row.total_sold, sortValue: (row) => row.total_sold },
            { key: "revenue", header: "Revenue", align: "right", render: (row) => money(row.total_revenue), sortValue: (row) => row.total_revenue }
          ]}
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <DataTable<Invoice>
          title="Recent Sales"
          meta={`${recent.length} latest`}
          empty="No invoices yet."
          rows={recent}
          pageSize={6}
          columns={[
            { key: "code", header: "Invoice", render: (row) => <span className="font-semibold text-ink">{row.invoice_code}</span>, sortValue: (row) => row.invoice_code },
            { key: "customer", header: "Customer", render: (row) => row.customer?.full_name || "Walk-in" },
            { key: "payment", header: "Payment", render: (row) => <span className="capitalize">{row.payment_method}</span> },
            { key: "total", header: "Total", align: "right", render: (row) => money(row.total_amount), sortValue: (row) => row.total_amount },
            { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> }
          ]}
        />
        <DataTable<Product>
          title="Low Stock Urgency"
          meta={`${lowStockRows.length} alerts`}
          empty="No low-stock products."
          rows={lowStockRows}
          pageSize={6}
          columns={[
            { key: "sku", header: "SKU", render: (row) => row.sku, sortValue: (row) => row.sku },
            { key: "name", header: "Product", render: (row) => <span className="font-semibold text-ink">{row.name}</span>, sortValue: (row) => row.name },
            { key: "qty", header: "Qty", align: "right", render: (row) => <span className={row.stock_qty <= 0 ? "font-semibold text-rose-700" : "font-semibold text-amber-700"}>{row.stock_qty}</span>, sortValue: (row) => row.stock_qty },
            { key: "min", header: "Min", align: "right", render: (row) => row.min_stock_qty, sortValue: (row) => row.min_stock_qty }
          ]}
        />
      </div>
    </section>
  );
}
