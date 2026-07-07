import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Search, StopCircle } from "lucide-react";
import { productsApi } from "../api/resources.api";
import type { Product } from "../api/types";
import { DataTable } from "../components/DataTable";
import { ErrorState, LoadingState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../hooks/useAuth";

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);
}

type ProductFormState = Partial<Product> & { opening_stock?: number };

const emptyForm: ProductFormState = {
  sku: "",
  name: "",
  category: "",
  cost_price: 0,
  selling_price: 0,
  warranty_months: 12,
  min_stock_qty: 5,
  opening_stock: 0
};

export function ProductsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const query = useQuery({ queryKey: ["products", search, category], queryFn: () => productsApi.list({ search, category }) });
  const canManage = user?.role === "manager";

  const save = useMutation({
    mutationFn: () => (editing ? productsApi.update(editing.id, form) : productsApi.create(form)),
    onSuccess: () => {
      setEditing(null);
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
  const stopSelling = useMutation({
    mutationFn: productsApi.stopSelling,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] })
  });

  const categories = useMemo(() => [...new Set((query.data || []).map((product) => product.category))], [query.data]);

  function openEdit(product: Product) {
    setEditing(product);
    setForm(product);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-steel">Search, price, warranty, stock threshold, and selling status.</p>
        </div>
        {canManage ? (
          <button className="focus-ring inline-flex items-center gap-2 rounded bg-circuit px-4 py-2 text-sm font-semibold text-white" onClick={() => { setEditing(null); setForm(emptyForm); }}>
            <Plus size={16} />
            New product
          </button>
        ) : null}
      </div>
      <div className="panel flex flex-wrap gap-3 p-4">
        <div className="relative min-w-64 flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 text-steel" size={16} />
          <input className="focus-ring w-full rounded border border-slate-300 py-2 pl-9 pr-3" placeholder="Search SKU, name, category" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <select className="focus-ring rounded border border-slate-300 px-3 py-2" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
      {canManage ? (
        <form className="panel grid gap-3 p-4 md:grid-cols-4" onSubmit={submit}>
          <input className="focus-ring rounded border border-slate-300 px-3 py-2" placeholder="SKU" value={form.sku || ""} onChange={(event) => setForm({ ...form, sku: event.target.value })} required />
          <input className="focus-ring rounded border border-slate-300 px-3 py-2 md:col-span-2" placeholder="Product name" value={form.name || ""} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <input className="focus-ring rounded border border-slate-300 px-3 py-2" placeholder="Category" value={form.category || ""} onChange={(event) => setForm({ ...form, category: event.target.value })} required />
          <input className="focus-ring rounded border border-slate-300 px-3 py-2" type="number" placeholder="Cost price" value={form.cost_price || 0} onChange={(event) => setForm({ ...form, cost_price: Number(event.target.value) })} />
          <input className="focus-ring rounded border border-slate-300 px-3 py-2" type="number" placeholder="Selling price" value={form.selling_price || 0} onChange={(event) => setForm({ ...form, selling_price: Number(event.target.value) })} />
          <input className="focus-ring rounded border border-slate-300 px-3 py-2" type="number" placeholder="Warranty months" value={form.warranty_months || 0} onChange={(event) => setForm({ ...form, warranty_months: Number(event.target.value) })} />
          <input className="focus-ring rounded border border-slate-300 px-3 py-2" type="number" placeholder="Min stock" value={form.min_stock_qty || 0} onChange={(event) => setForm({ ...form, min_stock_qty: Number(event.target.value) })} />
          {!editing ? <input className="focus-ring rounded border border-slate-300 px-3 py-2" type="number" placeholder="Opening stock" value={form.opening_stock || 0} onChange={(event) => setForm({ ...form, opening_stock: Number(event.target.value) })} /> : null}
          <button className="focus-ring inline-flex items-center justify-center gap-2 rounded bg-ink px-4 py-2 font-semibold text-white disabled:opacity-60" disabled={save.isPending}>
            <Edit size={16} />
            {editing ? "Save changes" : "Create product"}
          </button>
        </form>
      ) : null}
      {query.isLoading ? <LoadingState label="Loading products..." /> : null}
      {query.isError ? <ErrorState label="Could not load products." onRetry={() => query.refetch()} /> : null}
      {query.data ? (
        <DataTable<Product>
          empty="No products found."
          rows={query.data}
          columns={[
            { key: "sku", header: "SKU", render: (row) => row.sku },
            { key: "name", header: "Name", render: (row) => row.name },
            { key: "category", header: "Category", render: (row) => row.category },
            { key: "selling", header: "Selling Price", render: (row) => money(row.selling_price) },
            { key: "cost", header: "Cost Price", render: (row) => money(row.cost_price) },
            { key: "warranty", header: "Warranty", render: (row) => `${row.warranty_months} mo` },
            { key: "stock", header: "Stock Qty", render: (row) => <span className={row.stock_qty <= row.min_stock_qty ? "font-semibold text-amber-700" : ""}>{row.stock_qty}</span> },
            { key: "status", header: "Status", render: (row) => <StatusBadge value={row.is_active ? "active" : "stopped"} /> },
            {
              key: "actions",
              header: "Actions",
              render: (row) =>
                canManage ? (
                  <div className="flex gap-2">
                    <button className="focus-ring rounded border border-slate-200 p-2" aria-label={`Edit ${row.name}`} onClick={() => openEdit(row)}><Edit size={16} /></button>
                    <button className="focus-ring rounded border border-slate-200 p-2 text-rose-700" aria-label={`Stop selling ${row.name}`} onClick={() => stopSelling.mutate(row.id)}><StopCircle size={16} /></button>
                  </div>
                ) : (
                  "-"
                )
            }
          ]}
        />
      ) : null}
    </section>
  );
}
