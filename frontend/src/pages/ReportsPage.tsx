import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { invoicesApi, reportsApi } from "../api/resources.api";
import { DataTable } from "../components/DataTable";
import { MetricCard } from "../components/MetricCard";
import { EmptyState, ErrorState, LoadingState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import type { Invoice, Product } from "../api/types";
import { PageHeader } from "../components/PageHeader";

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function rangePreset(preset: "today" | "7" | "30" | "month") {
  const now = new Date();
  const from = new Date(now);
  if (preset === "7") from.setDate(now.getDate() - 6);
  if (preset === "30") from.setDate(now.getDate() - 29);
  if (preset === "month") from.setDate(1);
  return { from: isoDate(from), to: isoDate(now) };
}

function aggregateSeries(series: Array<{ date: string; revenue: number }>) {
  const byDate = new Map<string, number>();
  series.forEach((item) => {
    const date = item.date.slice(0, 10);
    byDate.set(date, (byDate.get(date) || 0) + item.revenue);
  });
  return [...byDate.entries()].map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date));
}

function displayDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ReportsPage() {
  const [tab, setTab] = useState<"revenue" | "products">("revenue");
  const initialRange = rangePreset("7");
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  const revenue = useQuery({ queryKey: ["report-revenue", from, to], queryFn: () => reportsApi.revenue({ from, to }) });
  const topProducts = useQuery({ queryKey: ["report-top-products", from, to], queryFn: () => reportsApi.topProducts({ from, to, limit: "10" }) });
  const lowStock = useQuery({ queryKey: ["report-low-stock"], queryFn: reportsApi.lowStock });
  const invoices = useQuery({ queryKey: ["invoices"], queryFn: invoicesApi.list });
  const refunded = (invoices.data || []).filter((invoice) => invoice.status === "refunded");
  const revenueSeries = aggregateSeries(revenue.data?.series || []);

  function applyPreset(preset: "today" | "7" | "30" | "month") {
    const range = rangePreset(preset);
    setFrom(range.from);
    setTo(range.to);
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Reports" description="Revenue, product performance, exceptions, and refunded invoice visibility." />
      <div className="panel flex flex-wrap items-center gap-3 p-4">
        <div className="segmented">
          <button className={`segment ${tab === "revenue" ? "segment-active" : ""}`} onClick={() => setTab("revenue")}>Revenue</button>
          <button className={`segment ${tab === "products" ? "segment-active" : ""}`} onClick={() => setTab("products")}>Products</button>
        </div>
        <div className="flex flex-wrap gap-2 lg:ml-auto">
          <button className="btn btn-soft px-3 py-1.5 text-xs" onClick={() => applyPreset("today")}>Today</button>
          <button className="btn btn-soft px-3 py-1.5 text-xs" onClick={() => applyPreset("7")}>7 Days</button>
          <button className="btn btn-soft px-3 py-1.5 text-xs" onClick={() => applyPreset("30")}>30 Days</button>
          <button className="btn btn-soft px-3 py-1.5 text-xs" onClick={() => applyPreset("month")}>This Month</button>
        </div>
        <input className="control" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        <input className="control" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
      </div>
      {tab === "revenue" ? (
        revenue.isLoading || invoices.isLoading ? <LoadingState label="Loading revenue report..." /> : revenue.isError ? <ErrorState label="Could not load revenue report." /> : (
          <>
            <div className="grid gap-3 md:grid-cols-4">
              <MetricCard label="Revenue" value={money(revenue.data?.revenue || 0)} tone="good" detail="Completed invoices" />
              <MetricCard label="Invoice Count" value={revenue.data?.invoice_count || 0} detail="Selected range" />
              <MetricCard label="Refunded Invoices" value={refunded.length} tone={refunded.length ? "danger" : "neutral"} detail="All visible refunds" />
              <MetricCard label="Low Stock Products" value={lowStock.data?.length || 0} tone="warn" detail="Current exceptions" />
            </div>
            <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
              <div className="panel h-80 p-4">
                <div className="section-title">
                  <h2>Revenue by Day</h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-steel">{displayDate(from)} - {displayDate(to)}</span>
                </div>
                <div className="h-[250px]">
                  {revenueSeries.length === 0 ? <EmptyState title="No revenue data." detail="Try a different date range." /> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueSeries} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                        <CartesianGrid stroke="#edf2f7" vertical={false} />
                        <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })} tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                        <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000000)}m`} tick={{ fontSize: 12 }} width={44} />
                        <Tooltip formatter={(value) => money(Number(value))} labelFormatter={(value) => displayDate(String(value))} />
                        <Bar dataKey="revenue" fill="#0f766e" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
              <DataTable<Invoice>
                title="Refunded Invoices"
                meta={`${refunded.length} refunds`}
                empty="No refunded invoices."
                rows={refunded}
                pageSize={5}
                columns={[
                  { key: "invoice", header: "Invoice", render: (row) => row.invoice_code, sortValue: (row) => row.invoice_code },
                  { key: "customer", header: "Customer", render: (row) => row.customer?.full_name || "Walk-in" },
                  { key: "total", header: "Total", align: "right", render: (row) => money(row.total_amount), sortValue: (row) => row.total_amount }
                ]}
              />
            </div>
          </>
        )
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
          <div className="space-y-5">
            {topProducts.isLoading ? <LoadingState /> : null}
            {topProducts.data ? (
              <>
                <div className="panel h-72 p-4">
                  <div className="section-title">
                    <h2>Product Performance</h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-steel">Units sold</span>
                  </div>
                  <ResponsiveContainer width="100%" height="82%">
                    <BarChart data={topProducts.data} layout="vertical" margin={{ left: 12, right: 16, top: 8, bottom: 0 }}>
                      <CartesianGrid stroke="#edf2f7" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value, name) => [name === "total_revenue" ? money(Number(value)) : value, name === "total_revenue" ? "Revenue" : "Sold"]} />
                      <Bar dataKey="total_sold" fill="#0f766e" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <DataTable<{ product_id: number; name: string; total_sold: number; total_revenue: number }>
                  title="Top Selling Products"
                  meta={`${topProducts.data.length} ranked`}
                  empty="No product sales in this range."
                  rows={topProducts.data}
                  columns={[
                    { key: "name", header: "Product", render: (row) => <span className="font-semibold text-ink">{row.name}</span>, sortValue: (row) => row.name },
                    { key: "sold", header: "Sold", align: "right", render: (row) => row.total_sold, sortValue: (row) => row.total_sold },
                    { key: "revenue", header: "Revenue", align: "right", render: (row) => money(row.total_revenue), sortValue: (row) => row.total_revenue }
                  ]}
                />
              </>
            ) : null}
          </div>
          <DataTable<Product>
            title="Low-stock Exceptions"
            meta={`${lowStock.data?.length || 0} alerts`}
            empty="No low-stock products."
            rows={lowStock.data || []}
            columns={[
              { key: "sku", header: "SKU", render: (row) => row.sku, sortValue: (row) => row.sku },
              { key: "name", header: "Product", render: (row) => row.name, sortValue: (row) => row.name },
              { key: "qty", header: "Qty", align: "right", render: (row) => <span className="font-semibold text-ink">{row.stock_qty}</span>, sortValue: (row) => row.stock_qty },
              { key: "status", header: "Status", render: (row) => <StatusBadge value={row.stock_qty <= 0 ? "out_of_stock" : "low_stock"} /> }
            ]}
          />
        </div>
      )}
    </section>
  );
}
