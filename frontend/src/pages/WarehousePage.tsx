import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownToLine, ArrowUpFromLine, ClipboardList } from "lucide-react";
import { productsApi, warehouseApi } from "../api/resources.api";
import type { StockMovement } from "../api/types";
import { DataTable } from "../components/DataTable";
import { ErrorState, LoadingState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import { PageHeader } from "../components/PageHeader";

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);
}

export function WarehousePage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"import" | "export" | "history">("import");
  const [productId, setProductId] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [supplierName, setSupplierName] = useState("ABC Supplier");
  const [reason, setReason] = useState("damage");
  const [notes, setNotes] = useState("");
  const products = useQuery({ queryKey: ["products"], queryFn: () => productsApi.list() });
  const movements = useQuery({ queryKey: ["warehouse-movements"], queryFn: warehouseApi.movements });
  const selectedProduct = useMemo(() => (products.data || []).find((product) => product.id === productId), [products.data, productId]);
  const recentMovements = (movements.data || []).slice(0, 8);
  const projectedStock = tab === "import" ? (selectedProduct?.stock_qty || 0) + quantity : Math.max(0, (selectedProduct?.stock_qty || 0) - quantity);

  const importMutation = useMutation({
    mutationFn: () => warehouseApi.importStock({ supplier_name: supplierName, notes, items: [{ product_id: productId, quantity, unit_price: unitPrice }] }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setTab("history");
    }
  });
  const exportMutation = useMutation({
    mutationFn: () => warehouseApi.exportStock({ reason, notes, items: [{ product_id: productId, quantity }] }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setTab("history");
    }
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (tab === "import") {
      importMutation.mutate();
    } else {
      exportMutation.mutate();
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Warehouse" description="Import stock, export stock, and inspect stock movement history." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="segmented">
          {(["import", "export", "history"] as const).map((item) => (
            <button key={item} type="button" className={`segment capitalize ${tab === item ? "segment-active" : ""}`} onClick={() => setTab(item)}>
              {item}
            </button>
          ))}
        </div>
        {selectedProduct ? (
          <div className="rounded-xl border border-line bg-white px-3 py-2 text-sm text-steel">
            Selected stock: <span className="font-semibold text-ink">{selectedProduct.stock_qty}</span> units
          </div>
        ) : null}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(420px,0.85fr)_1fr]">
        {tab !== "history" ? (
          <form className="panel space-y-4 p-4" onSubmit={submit}>
            <div className="section-title">
              <h2 className="flex items-center gap-2">{tab === "import" ? <ArrowDownToLine size={18} /> : <ArrowUpFromLine size={18} />} {tab === "import" ? "Import stock" : "Export stock"}</h2>
            </div>
            {tab === "import" ? (
              <div>
                <label className="field-label">Supplier</label>
                <input className="control w-full" placeholder="Supplier name" value={supplierName} onChange={(event) => setSupplierName(event.target.value)} required />
              </div>
            ) : (
              <div>
                <label className="field-label">Reason</label>
                <select className="control w-full" value={reason} onChange={(event) => setReason(event.target.value)}>
                  <option value="return_to_supplier">Return to supplier</option>
                  <option value="damage">Damage</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}
            <div>
              <label className="field-label">Product</label>
              <select className="control w-full" value={productId} onChange={(event) => setProductId(Number(event.target.value))}>
                {(products.data || []).map((product) => (
                  <option key={product.id} value={product.id}>{product.sku} - {product.name}</option>
                ))}
              </select>
              {selectedProduct ? <p className="mt-2 text-xs text-steel">Current stock: <span className="font-semibold text-ink">{selectedProduct.stock_qty}</span>. Min threshold: {selectedProduct.min_stock_qty}.</p> : null}
            </div>
            {selectedProduct ? (
              <div className="rounded-xl border border-line bg-slate-50 p-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-steel">Selected product</p>
                <p className="mt-1 font-semibold text-ink">{selectedProduct.name}</p>
                <div className="mt-3 grid gap-2 text-xs text-steel">
                  <div className="flex justify-between"><span>Current stock</span><strong className="text-ink">{selectedProduct.stock_qty}</strong></div>
                  <div className="flex justify-between"><span>{tab === "import" ? "New stock after import" : "Remaining after export"}</span><strong className="text-ink">{projectedStock}</strong></div>
                  {tab === "import" ? <div className="flex justify-between"><span>Import value</span><strong className="text-ink">{money(quantity * unitPrice)}</strong></div> : null}
                </div>
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label">{tab === "import" ? "Quantity" : "Quantity to export"}</label>
                <input className="control w-full text-right tabular-nums" type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
              </div>
              {tab === "import" ? (
                <div>
                  <label className="field-label">Unit cost</label>
                  <input className="control w-full text-right tabular-nums" type="number" min={0} value={unitPrice} onChange={(event) => setUnitPrice(Number(event.target.value))} />
                </div>
              ) : (
                <div className="rounded-xl border border-line bg-slate-50 p-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-steel">After export</p>
                  <p className="mt-1 text-lg font-semibold text-ink">{projectedStock} units</p>
                </div>
              )}
            </div>
            <div>
              <label className="field-label">Notes</label>
              <textarea className="control min-h-24 w-full" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional movement note" />
            </div>
            <button className="btn btn-primary w-full" disabled={importMutation.isPending || exportMutation.isPending || !selectedProduct}>
              {tab === "import" ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}
              {tab === "import" ? "Confirm Import" : "Confirm Export"}
            </button>
            {importMutation.isError || exportMutation.isError ? <p className="text-sm text-rose-700">Warehouse request failed. Check stock quantity and required fields.</p> : null}
          </form>
        ) : null}
        <div className={tab === "history" ? "xl:col-span-2" : ""}>
          {movements.isLoading ? <LoadingState label="Loading movements..." /> : movements.isError ? <ErrorState label="Could not load movements." /> : (
            <DataTable<StockMovement>
              title={tab === "history" ? "Movement History" : "Recent Movements"}
              meta={`${tab === "history" ? movements.data?.length || 0 : recentMovements.length} entries`}
              empty="No stock movements yet."
              rows={tab === "history" ? movements.data || [] : recentMovements}
              columns={[
                { key: "code", header: "Code", render: (row) => <span className="font-semibold text-ink">{row.movement_code}</span>, sortValue: (row) => row.movement_code },
                { key: "type", header: "Type", render: (row) => <StatusBadge value={row.movement_type} />, sortValue: (row) => row.movement_type },
                { key: "product", header: "Product", render: (row) => row.product?.name || row.product_id },
                { key: "qty", header: "Qty", align: "right", render: (row) => row.quantity, sortValue: (row) => row.quantity },
                { key: "reason", header: "Supplier/Reason", render: (row) => row.supplier_name || row.reason || "-" },
                { key: "moved", header: "Moved At", render: (row) => new Date(row.moved_at).toLocaleString(), sortValue: (row) => new Date(row.moved_at) }
              ]}
            />
          )}
          {tab !== "history" ? (
            <button className="btn btn-soft mt-3" type="button" onClick={() => setTab("history")}>
              <ClipboardList size={16} />
              View full history
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
