export type Role = "manager" | "salesperson" | "warehouse_staff";

export type User = {
  id: number;
  full_name: string;
  email: string;
  role: Role;
};

export type Product = {
  id: number;
  sku: string;
  name: string;
  category: string;
  supplier_name?: string | null;
  supplier_contact?: string | null;
  specs?: Record<string, unknown>;
  cost_price: number;
  selling_price: number;
  warranty_months: number;
  min_stock_qty: number;
  is_active: boolean;
  stock_qty: number;
};

export type Customer = {
  id: number;
  full_name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  tier: string;
  points: number;
  created_at: string;
};

export type InventoryRow = {
  product_id: number;
  sku: string;
  product_name: string;
  category: string;
  current_qty: number;
  min_qty: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  updated_at: string;
};

export type Invoice = {
  id: number;
  invoice_code: string;
  customer_id?: number | null;
  total_amount: number;
  subtotal: number;
  discount_amount?: number;
  payment_method: string;
  status: string;
  points_earned: number;
  created_at: string;
  customer?: Customer | null;
  items?: Array<{ product_id: number; quantity: number; unit_price: number; product?: Product }>;
};

export type StockMovement = {
  id: number;
  movement_code: string;
  movement_type: "import" | "export";
  product_id: number;
  quantity: number;
  reason?: string;
  supplier_name?: string;
  moved_at: string;
  product?: Product;
};
