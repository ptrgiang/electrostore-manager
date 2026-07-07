const bcrypt = require("bcryptjs");

const plainPassword = "Password123!";
const password_hash = bcrypt.hashSync(plainPassword, 10);

const employees = [
  {
    id: 1,
    full_name: "Store Manager",
    phone: "0900000001",
    email: "manager@electrostore.local",
    role: "manager",
    password_hash,
    is_active: true,
    created_at: new Date("2026-07-01T08:00:00Z").toISOString()
  },
  {
    id: 2,
    full_name: "Sales Associate",
    phone: "0900000002",
    email: "sales@electrostore.local",
    role: "salesperson",
    password_hash,
    is_active: true,
    created_at: new Date("2026-07-01T08:30:00Z").toISOString()
  },
  {
    id: 3,
    full_name: "Warehouse Staff",
    phone: "0900000003",
    email: "warehouse@electrostore.local",
    role: "warehouse_staff",
    password_hash,
    is_active: true,
    created_at: new Date("2026-07-01T09:00:00Z").toISOString()
  }
];

const products = [
  {
    id: 1,
    sku: "LAP-DELL-5420",
    name: "Dell Latitude 5420",
    category: "Laptop",
    supplier_name: "Dell Vietnam",
    supplier_contact: "support@dell.example",
    specs: { cpu: "Intel i5", ram: "16GB", storage: "512GB SSD" },
    cost_price: 14500000,
    selling_price: 17800000,
    warranty_months: 24,
    min_stock_qty: 3,
    is_active: true,
    created_at: new Date("2026-07-01T10:00:00Z").toISOString(),
    updated_at: new Date("2026-07-01T10:00:00Z").toISOString()
  },
  {
    id: 2,
    sku: "PHN-SAM-S24",
    name: "Samsung Galaxy S24",
    category: "Phone",
    supplier_name: "Samsung Distributor",
    supplier_contact: "sales@samsung.example",
    specs: { storage: "256GB", color: "Black" },
    cost_price: 15000000,
    selling_price: 19900000,
    warranty_months: 12,
    min_stock_qty: 5,
    is_active: true,
    created_at: new Date("2026-07-01T10:15:00Z").toISOString(),
    updated_at: new Date("2026-07-01T10:15:00Z").toISOString()
  },
  {
    id: 3,
    sku: "ACC-LOG-MX3",
    name: "Logitech MX Master 3S",
    category: "Accessory",
    supplier_name: "Logitech Partner",
    supplier_contact: "partner@logitech.example",
    specs: { type: "Wireless mouse" },
    cost_price: 1800000,
    selling_price: 2490000,
    warranty_months: 12,
    min_stock_qty: 8,
    is_active: true,
    created_at: new Date("2026-07-01T10:30:00Z").toISOString(),
    updated_at: new Date("2026-07-01T10:30:00Z").toISOString()
  }
];

const inventory = [
  { product_id: 1, quantity: 6, updated_at: new Date("2026-07-01T10:00:00Z").toISOString() },
  { product_id: 2, quantity: 4, updated_at: new Date("2026-07-01T10:15:00Z").toISOString() },
  { product_id: 3, quantity: 20, updated_at: new Date("2026-07-01T10:30:00Z").toISOString() }
];

const customers = [
  {
    id: 1,
    full_name: "Nguyen Minh Anh",
    phone: "0912345678",
    email: "anh.nguyen@example.com",
    address: "Hanoi",
    tier: "standard",
    points: 120,
    created_at: new Date("2026-07-02T09:00:00Z").toISOString()
  },
  {
    id: 2,
    full_name: "Tran Quoc Bao",
    phone: "0987654321",
    email: "bao.tran@example.com",
    address: "Da Nang",
    tier: "silver",
    points: 640,
    created_at: new Date("2026-07-02T11:00:00Z").toISOString()
  }
];

module.exports = {
  customers,
  employees,
  inventory,
  plainPassword,
  products
};
