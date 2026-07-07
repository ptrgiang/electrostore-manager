-- ElectroStore Manager MVP schema
-- Platform: PostgreSQL

CREATE TYPE employee_role AS ENUM ('manager', 'salesperson', 'warehouse_staff');
CREATE TYPE member_tier AS ENUM ('standard', 'silver', 'gold', 'platinum');
CREATE TYPE movement_type AS ENUM ('import', 'export', 'adjustment_in', 'adjustment_out');
CREATE TYPE export_reason AS ENUM ('sale', 'return_to_supplier', 'damage', 'other');
CREATE TYPE transaction_type AS ENUM ('sale', 'customer_order', 'supplier_order');
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'transfer', 'qr');
CREATE TYPE discount_type AS ENUM ('percent', 'fixed');

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  supplier_name VARCHAR(200),
  supplier_contact VARCHAR(100),
  specs JSONB DEFAULT '{}'::jsonb,
  cost_price NUMERIC(15,2) NOT NULL,
  selling_price NUMERIC(15,2) NOT NULL,
  warranty_months INT DEFAULT 12,
  min_stock_qty INT DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_product_prices CHECK (cost_price >= 0 AND selling_price >= 0),
  CONSTRAINT chk_min_stock_non_negative CHECK (min_stock_qty >= 0)
);

CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(150) UNIQUE NOT NULL,
  role employee_role NOT NULL DEFAULT 'salesperson',
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(150),
  address TEXT,
  tier member_tier DEFAULT 'standard',
  points INT DEFAULT 0 CHECK (points >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory (
  product_id INT PRIMARY KEY REFERENCES products(id),
  quantity INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_inventory_non_negative CHECK (quantity >= 0)
);

CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  invoice_code VARCHAR(30) UNIQUE NOT NULL,
  transaction_type transaction_type NOT NULL DEFAULT 'sale',
  customer_id INT REFERENCES customers(id),
  supplier_name VARCHAR(200),
  employee_id INT REFERENCES employees(id),
  discount_code VARCHAR(50),
  discount_type discount_type,
  discount_value NUMERIC(10,2) DEFAULT 0,
  subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  payment_method payment_method DEFAULT 'cash',
  status transaction_status DEFAULT 'pending',
  points_earned INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_invoice_amounts CHECK (subtotal >= 0 AND total_amount >= 0)
);

CREATE TABLE stock_movements (
  id SERIAL PRIMARY KEY,
  movement_code VARCHAR(30) UNIQUE NOT NULL,
  movement_type movement_type NOT NULL,
  product_id INT NOT NULL REFERENCES products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(15,2),
  employee_id INT REFERENCES employees(id),
  invoice_id INT REFERENCES invoices(id),
  supplier_name VARCHAR(200),
  reason export_reason,
  notes TEXT,
  moved_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(15,2) NOT NULL,
  warranty_exp DATE
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_invoices_type_status ON invoices(transaction_type, status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);
CREATE INDEX idx_invoice_items_product ON invoice_items(product_id);
CREATE INDEX idx_movements_product ON stock_movements(product_id);
CREATE INDEX idx_movements_type ON stock_movements(movement_type);

CREATE VIEW v_daily_revenue AS
SELECT DATE(created_at) AS sale_date,
       COUNT(*) AS invoice_count,
       SUM(total_amount) AS revenue
FROM invoices
WHERE transaction_type = 'sale' AND status = 'completed'
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

CREATE VIEW v_top_products AS
SELECT p.id,
       p.sku,
       p.name,
       p.category,
       SUM(ii.quantity) AS total_sold,
       SUM(ii.quantity * ii.unit_price) AS total_revenue
FROM invoice_items ii
JOIN products p ON p.id = ii.product_id
JOIN invoices i ON i.id = ii.invoice_id
WHERE i.transaction_type = 'sale' AND i.status = 'completed'
GROUP BY p.id, p.sku, p.name, p.category
ORDER BY total_sold DESC;

CREATE VIEW v_low_stock_alert AS
SELECT p.id,
       p.sku,
       p.name,
       p.category,
       inv.quantity AS current_qty,
       p.min_stock_qty AS min_qty,
       p.supplier_name,
       p.supplier_contact
FROM inventory inv
JOIN products p ON p.id = inv.product_id
WHERE inv.quantity <= p.min_stock_qty AND p.is_active = TRUE;

CREATE OR REPLACE FUNCTION fn_sync_inventory()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.movement_type IN ('import', 'adjustment_in') THEN
    INSERT INTO inventory (product_id, quantity)
    VALUES (NEW.product_id, NEW.quantity)
    ON CONFLICT (product_id)
    DO UPDATE SET quantity = inventory.quantity + NEW.quantity, updated_at = NOW();
  ELSIF NEW.movement_type IN ('export', 'adjustment_out') THEN
    UPDATE inventory
    SET quantity = quantity - NEW.quantity,
        updated_at = NOW()
    WHERE product_id = NEW.product_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product ID=% has no inventory row', NEW.product_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_inventory
AFTER INSERT ON stock_movements
FOR EACH ROW EXECUTE FUNCTION fn_sync_inventory();
