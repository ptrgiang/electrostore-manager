import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { reportsApi } from "../api/resources.api";
import { DataTable } from "../components/DataTable";
import { MetricCard } from "../components/MetricCard";
import { ErrorState, LoadingState } from "../components/PageState";
import type { Product } from "../api/types";
import { PageHeader } from "../components/PageHeader";

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);
}

export function ReportsPage() {
  const [tab, setTab] = useState<"revenue" | "products">("revenue");
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const revenue = useQuery({ queryKey: ["report-revenue", from, to], queryFn: () => reportsApi.revenue({ from, to }) });
  const topProducts = useQuery({ queryKey: ["report-top-products", from, to], queryFn: () => reportsApi.topProducts({ from, to, limit: "10" }) });
  const lowStock = useQuery({ queryKey: ["report-low-stock"], queryFn: reportsApi.lowStock });

  return (
    <section className="space-y-6">
      <PageHeader title="Reports" description="Revenue, product performance, and low-stock exceptions." />
      <div className="panel flex flex-wrap items-center gap-3 p-4">
        <button className={`btn ${tab === "revenue" ? "btn-dark" : "btn-soft"}`} onClick={() => setTab("revenue")}>Revenue Report</button>
        <button className={`btn ${tab === "products" ? "btn-dark" : "btn-soft"}`} onClick={() => setTab("products")}>Product Performance</button>
        <input className="control ml-auto" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        <input className="control" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
      </div>
      {tab === "revenue" ? (
        revenue.isLoading ? <LoadingState label="Loading revenue report..." /> : revenue.isError ? <ErrorState label="Could not load revenue report." /> : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard label="Revenue" value={money(revenue.data?.revenue || 0)} tone="good" detail="Completed invoices" />
              <MetricCard label="Invoice Count" value={revenue.data?.invoice_count || 0} detail="Selected range" />
              <MetricCard label="Gross Profit Placeholder" value={money(0)} detail="Reserved for V1.1 costing" />
            </div>
            <div className="panel h-80 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue.data?.series || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => money(Number(value))} />
                  <Bar dataKey="revenue" fill="#0f766e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <div>
            {topProducts.isLoading ? <LoadingState /> : null}
            {topProducts.data ? (
              <DataTable<{ product_id: number; name: string; total_sold: number; total_revenue: number }>
                title="Top products"
                meta={`${topProducts.data.length} ranked`}
                empty="No product sales in this range."
                rows={topProducts.data}
                columns={[
                  { key: "name", header: "Product", render: (row) => row.name },
                  { key: "sold", header: "Sold", render: (row) => row.total_sold },
                  { key: "revenue", header: "Revenue", render: (row) => money(row.total_revenue) }
                ]}
              />
            ) : null}
          </div>
          <div>
            <DataTable<Product>
              title="Low-stock products"
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
      )}
    </section>
  );
}
