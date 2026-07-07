import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Search, StopCircle } from "lucide-react";
import { productsApi } from "../api/resources.api";
import type { Product } from "../api/types";
import { DataTable } from "../components/DataTable";
import { Drawer } from "../components/Drawer";
import { ErrorState, LoadingState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import { PageHeader } from "../components/PageHeader";

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);
}

type ProductFormState = Partial<Product> & { opening_stock?: number };

const emptyForm: ProductFormState = {
  sku: "",
  name: "",
  category: "",
  supplier_name: "",
  supplier_contact: "",
  specs: {},
  cost_price: 0,
  selling_price: 0,
  warranty_months: 12,
  min_stock_qty: 5,
  opening_stock: 0
};

function specsToText(specs: Product["specs"]) {
  return Object.entries(specs || {}).map(([key, value]) => `${key}: ${String(value)}`).join("\n");
}

function parseSpecs(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((result, line) => {
      const [key, ...rest] = line.split(":");
      if (key && rest.length) {
        result[key.trim()] = rest.join(":").trim();
      }
      return result;
    }, {});
}

export function ProductsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [specsText, setSpecsText] = useState("");
  const query = useQuery({ queryKey: ["products", search, category], queryFn: () => productsApi.list({ search, category }) });
  const canManage = user?.role === "manager";

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, specs: parseSpecs(specsText) };
      return editing ? productsApi.update(editing.id, payload) : productsApi.create(payload);
    },
    onSuccess: () => {
      closeDrawer();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
  const stopSelling = useMutation({
    mutationFn: productsApi.stopSelling,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] })
  });

  const categories = useMemo(() => [...new Set((query.data || []).map((product) => product.category))], [query.data]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setSpecsText("");
    setIsDrawerOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm(product);
    setSpecsText(specsToText(product.specs));
    setIsDrawerOpen(true);
  }

  function closeDrawer() {
    setIsDrawerOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setSpecsText("");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <section className="space-y-5">
      <PageHeader
        title="Products"
        description="Search, price, warranty, stock threshold, supplier detail, and selling status."
        actions={canManage ? (
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={16} />
            New product
          </button>
        ) : null}
      />
      <div className="panel flex flex-wrap gap-3 p-4">
        <div className="relative min-w-64 flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 text-steel" size={16} />
          <input className="control w-full pl-9" placeholder="Search SKU, name, category" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <select className="control" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
      {query.isLoading ? <LoadingState label="Loading products..." /> : null}
      {query.isError ? <ErrorState label="Could not load products." onRetry={() => query.refetch()} /> : null}
      {query.data ? (
        <DataTable<Product>
          title="Product Catalog"
          meta={`${query.data.length} items`}
          empty="No products found."
          rows={query.data}
          columns={[
            { key: "sku", header: "SKU", render: (row) => <span className="font-semibold text-ink">{row.sku}</span>, sortValue: (row) => row.sku },
            { key: "name", header: "Name", render: (row) => row.name, sortValue: (row) => row.name },
            { key: "category", header: "Category", render: (row) => row.category, sortValue: (row) => row.category },
            { key: "selling", header: "Selling Price", align: "right", render: (row) => money(row.selling_price), sortValue: (row) => row.selling_price },
            { key: "cost", header: "Cost Price", align: "right", render: (row) => money(row.cost_price), sortValue: (row) => row.cost_price },
            { key: "warranty", header: "Warranty", align: "right", render: (row) => `${row.warranty_months} mo`, sortValue: (row) => row.warranty_months },
            { key: "stock", header: "Stock Qty", align: "right", render: (row) => <span className="font-semibold text-ink">{row.stock_qty}</span>, sortValue: (row) => row.stock_qty },
            { key: "status", header: "Status", render: (row) => <StatusBadge value={row.is_active ? "active" : "stopped"} />, sortValue: (row) => Number(row.is_active) },
            {
              key: "actions",
              header: "Actions",
              render: (row) =>
                canManage ? (
                  <div className="flex gap-2">
                    <button className="btn btn-soft p-2" aria-label={`Edit ${row.name}`} onClick={() => openEdit(row)}><Edit size={16} /></button>
                    <button className="btn btn-danger p-2" aria-label={`Stop selling ${row.name}`} onClick={() => stopSelling.mutate(row.id)}><StopCircle size={16} /></button>
                  </div>
                ) : (
                  "-"
                )
            }
          ]}
        />
      ) : null}
      <Drawer
        title={editing ? "Edit product" : "New product"}
        description="Group product details for catalog, pricing, stock thresholds, supplier, and specs."
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
      >
        <form id="product-form" className="space-y-5" onSubmit={submit}>
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-ink">Basic info</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label">SKU</label>
                <input className="control w-full" value={form.sku || ""} onChange={(event) => setForm({ ...form, sku: event.target.value })} required />
              </div>
              <div>
                <label className="field-label">Category</label>
                <input className="control w-full" value={form.category || ""} onChange={(event) => setForm({ ...form, category: event.target.value })} required />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">Product name</label>
                <input className="control w-full" value={form.name || ""} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </div>
            </div>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-ink">Pricing</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label">Cost price</label>
                <input className="control w-full text-right tabular-nums" type="number" value={form.cost_price || 0} onChange={(event) => setForm({ ...form, cost_price: Number(event.target.value) })} />
              </div>
              <div>
                <label className="field-label">Selling price</label>
                <input className="control w-full text-right tabular-nums" type="number" value={form.selling_price || 0} onChange={(event) => setForm({ ...form, selling_price: Number(event.target.value) })} />
              </div>
            </div>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-ink">Warranty / stock threshold</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="field-label">Warranty months</label>
                <input className="control w-full text-right tabular-nums" type="number" value={form.warranty_months || 0} onChange={(event) => setForm({ ...form, warranty_months: Number(event.target.value) })} />
              </div>
              <div>
                <label className="field-label">Min stock</label>
                <input className="control w-full text-right tabular-nums" type="number" value={form.min_stock_qty || 0} onChange={(event) => setForm({ ...form, min_stock_qty: Number(event.target.value) })} />
              </div>
              {!editing ? (
                <div>
                  <label className="field-label">Opening stock</label>
                  <input className="control w-full text-right tabular-nums" type="number" value={form.opening_stock || 0} onChange={(event) => setForm({ ...form, opening_stock: Number(event.target.value) })} />
                </div>
              ) : null}
            </div>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-ink">Supplier info</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label">Supplier</label>
                <input className="control w-full" value={form.supplier_name || ""} onChange={(event) => setForm({ ...form, supplier_name: event.target.value })} />
              </div>
              <div>
                <label className="field-label">Supplier contact</label>
                <input className="control w-full" value={form.supplier_contact || ""} onChange={(event) => setForm({ ...form, supplier_contact: event.target.value })} />
              </div>
            </div>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-ink">Technical specs</legend>
            <textarea className="control min-h-28 w-full" placeholder={"cpu: Intel i5\nram: 16GB\nstorage: 512GB SSD"} value={specsText} onChange={(event) => setSpecsText(event.target.value)} />
            <p className="text-xs text-steel">Use one key-value pair per line.</p>
          </fieldset>
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button className="btn btn-soft" type="button" onClick={closeDrawer}>Cancel</button>
            <button className="btn btn-primary" disabled={save.isPending}>
              <Edit size={16} />
              {editing ? "Save changes" : "Create product"}
            </button>
          </div>
        </form>
      </Drawer>
    </section>
  );
}
