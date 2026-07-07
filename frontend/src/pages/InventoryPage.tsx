import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "../api/resources.api";
import type { InventoryRow, StockMovement } from "../api/types";
import { DataTable } from "../components/DataTable";
import { MetricCard } from "../components/MetricCard";
import { ErrorState, LoadingState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";

export function InventoryPage() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const inventory = useQuery({ queryKey: ["inventory"], queryFn: inventoryApi.list });
  const movements = useQuery({
    queryKey: ["inventory-movements", selectedProductId],
    queryFn: () => inventoryApi.movements(selectedProductId!),
    enabled: Boolean(selectedProductId)
  });

  if (inventory.isLoading) {
    return <LoadingState label="Loading inventory..." />;
  }

  if (inventory.isError) {
    return <ErrorState label="Could not load inventory." onRetry={() => window.location.reload()} />;
  }

  const rows = inventory.data || [];
  const status = {
    total_products: rows.length,
    in_stock: rows.filter((row) => row.status === "in_stock").length,
    low_stock: rows.filter((row) => row.status === "low_stock").length,
    out_of_stock: rows.filter((row) => row.status === "out_of_stock").length
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="text-sm text-steel">Current stock, thresholds, low-stock highlights, and movement history.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total Products" value={status.total_products} />
        <MetricCard label="In Stock" value={status.in_stock} tone="good" />
        <MetricCard label="Low Stock" value={status.low_stock} tone="warn" />
        <MetricCard label="Out of Stock" value={status.out_of_stock} tone="warn" />
      </div>
      <DataTable<InventoryRow>
        empty="No inventory rows."
        rows={rows}
        columns={[
          { key: "sku", header: "SKU", render: (row) => row.sku },
          { key: "name", header: "Product Name", render: (row) => row.product_name },
          { key: "category", header: "Category", render: (row) => row.category },
          { key: "current", header: "Current Qty", render: (row) => <span className={row.status !== "in_stock" ? "font-semibold text-amber-700" : ""}>{row.current_qty}</span> },
          { key: "min", header: "Min Qty", render: (row) => row.min_qty },
          { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
          { key: "updated", header: "Last Updated", render: (row) => new Date(row.updated_at).toLocaleString() },
          { key: "actions", header: "Actions", render: (row) => <button className="focus-ring rounded border border-slate-200 px-3 py-1 text-sm" onClick={() => setSelectedProductId(row.product_id)}>Movements</button> }
        ]}
      />
      {selectedProductId ? (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Movement history</h2>
          {movements.isLoading ? <LoadingState label="Loading movements..." /> : null}
          {movements.data ? (
            <DataTable<StockMovement>
              empty="No stock movements yet."
              rows={movements.data}
              columns={[
                { key: "code", header: "Code", render: (row) => row.movement_code },
                { key: "type", header: "Type", render: (row) => <StatusBadge value={row.movement_type} /> },
                { key: "qty", header: "Qty", render: (row) => row.quantity },
                { key: "reason", header: "Reason", render: (row) => row.reason || row.supplier_name || "-" },
                { key: "moved", header: "Moved At", render: (row) => new Date(row.moved_at).toLocaleString() }
              ]}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
