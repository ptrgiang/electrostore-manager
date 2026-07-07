import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { productsApi, warehouseApi } from "../api/resources.api";
import type { StockMovement } from "../api/types";
import { DataTable } from "../components/DataTable";
import { ErrorState, LoadingState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import { PageHeader } from "../components/PageHeader";

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
    <section className="space-y-6">
      <PageHeader title="Warehouse" description="Import stock, export stock, and inspect stock movement history." />
      <div className="panel flex gap-2 p-2">
        {(["import", "export", "history"] as const).map((item) => (
          <button key={item} className={`btn capitalize ${tab === item ? "btn-dark" : "btn-soft"}`} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>
      {tab !== "history" ? (
        <form className="panel grid gap-3 p-4 md:grid-cols-3" onSubmit={submit}>
          <div className="md:col-span-3">
            <h2 className="text-sm font-semibold text-ink">{tab === "import" ? "Import stock" : "Export stock"}</h2>
          </div>
          {tab === "import" ? (
            <input className="control" placeholder="Supplier name" value={supplierName} onChange={(event) => setSupplierName(event.target.value)} required />
          ) : (
            <select className="control" value={reason} onChange={(event) => setReason(event.target.value)}>
              <option value="return_to_supplier">Return to supplier</option>
              <option value="damage">Damage</option>
              <option value="other">Other</option>
            </select>
          )}
          <select className="control" value={productId} onChange={(event) => setProductId(Number(event.target.value))}>
            {(products.data || []).map((product) => (
              <option key={product.id} value={product.id}>{product.sku} - {product.name}</option>
            ))}
          </select>
          <input className="control" type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
          {tab === "import" ? <input className="control" type="number" min={0} placeholder="Unit cost" value={unitPrice} onChange={(event) => setUnitPrice(Number(event.target.value))} /> : null}
          <input className="control md:col-span-2" placeholder="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
          <button className="btn btn-primary" disabled={importMutation.isPending || exportMutation.isPending}>
            {tab === "import" ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}
            {tab === "import" ? "Confirm Import" : "Confirm Export"}
          </button>
          {importMutation.isError || exportMutation.isError ? <p className="text-sm text-rose-700 md:col-span-3">Warehouse request failed. Check stock quantity and required fields.</p> : null}
        </form>
      ) : null}
      {tab === "history" ? (
        movements.isLoading ? <LoadingState label="Loading movements..." /> : movements.isError ? <ErrorState label="Could not load movements." /> : (
          <DataTable<StockMovement>
            title="Movement History"
            meta={`${movements.data?.length || 0} entries`}
            empty="No stock movements yet."
            rows={movements.data || []}
            columns={[
              { key: "code", header: "Code", render: (row) => row.movement_code },
              { key: "type", header: "Type", render: (row) => <StatusBadge value={row.movement_type} /> },
              { key: "product", header: "Product", render: (row) => row.product?.name || row.product_id },
              { key: "qty", header: "Qty", render: (row) => row.quantity },
              { key: "reason", header: "Supplier/Reason", render: (row) => row.supplier_name || row.reason || "-" },
              { key: "moved", header: "Moved At", render: (row) => new Date(row.moved_at).toLocaleString() }
            ]}
          />
        )
      ) : null}
    </section>
  );
}
