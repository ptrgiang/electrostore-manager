import { api, unwrap } from "./client";
import type { Customer, InventoryRow, Invoice, Product, StockMovement, User } from "./types";

export const productsApi = {
  list: (params?: Record<string, string>) => unwrap<Product[]>(api.get("/products", { params })),
  create: (payload: Partial<Product> & { opening_stock?: number }) => unwrap<Product>(api.post("/products", payload)),
  update: (id: number, payload: Partial<Product>) => unwrap<Product>(api.put(`/products/${id}`, payload)),
  stopSelling: (id: number) => unwrap<Product>(api.patch(`/products/${id}/stop-selling`)),
  lowStock: () => unwrap<Product[]>(api.get("/products/low-stock"))
};

export const customersApi = {
  list: (params?: Record<string, string>) => unwrap<Customer[]>(api.get("/customers", { params })),
  create: (payload: Partial<Customer>) => unwrap<Customer>(api.post("/customers", payload)),
  update: (id: number, payload: Partial<Customer>) => unwrap<Customer>(api.put(`/customers/${id}`, payload)),
  searchPhone: (phone: string) => unwrap<Customer | null>(api.get("/customers/search", { params: { phone } })),
  history: (id: number) => unwrap<Invoice[]>(api.get(`/customers/${id}/history`))
};

export const inventoryApi = {
  list: () => unwrap<InventoryRow[]>(api.get("/inventory")),
  movements: (productId: number) => unwrap<StockMovement[]>(api.get(`/inventory/${productId}/movements`))
};

export const warehouseApi = {
  importStock: (payload: unknown) => unwrap<{ movements: StockMovement[] }>(api.post("/warehouse/import", payload)),
  exportStock: (payload: unknown) => unwrap<{ movements: StockMovement[] }>(api.post("/warehouse/export", payload)),
  movements: () => unwrap<StockMovement[]>(api.get("/warehouse/movements"))
};

export const invoicesApi = {
  list: () => unwrap<Invoice[]>(api.get("/invoices")),
  get: (id: number) => unwrap<Invoice>(api.get(`/invoices/${id}`)),
  createSale: (payload: unknown) => unwrap<{ invoice: Invoice; total_amount: number; change_amount: number }>(api.post("/invoices/sale", payload)),
  refund: (id: number) => unwrap<Invoice>(api.patch(`/invoices/${id}/refund`))
};

export const reportsApi = {
  revenue: (params?: Record<string, string>) => unwrap<{ invoice_count: number; revenue: number; series: Array<{ date: string; revenue: number }> }>(api.get("/reports/revenue", { params })),
  topProducts: (params?: Record<string, string>) => unwrap<Array<{ product_id: number; name: string; total_sold: number; total_revenue: number }>>(api.get("/reports/top-products", { params })),
  lowStock: () => unwrap<Product[]>(api.get("/reports/low-stock")),
  inventoryStatus: () => unwrap<{ total_products: number; in_stock: number; low_stock: number; out_of_stock: number; items: InventoryRow[] }>(api.get("/reports/inventory-status"))
};

export const employeesApi = {
  list: () => unwrap<User[]>(api.get("/employees"))
};
