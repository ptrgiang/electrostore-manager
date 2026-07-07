-- Demo seed for local development.
-- All users use password: Password123!

INSERT INTO employees (id, full_name, phone, email, role, password_hash) VALUES
(1, 'Store Manager', '0900000001', 'manager@electrostore.local', 'manager', '$2a$10$YAhY0vPAkio1fiwgCs3bfuxiXymdIzcFwKzlZerwLpzuMxYGPSyYi'),
(2, 'Sales Associate', '0900000002', 'sales@electrostore.local', 'salesperson', '$2a$10$YAhY0vPAkio1fiwgCs3bfuxiXymdIzcFwKzlZerwLpzuMxYGPSyYi'),
(3, 'Warehouse Staff', '0900000003', 'warehouse@electrostore.local', 'warehouse_staff', '$2a$10$YAhY0vPAkio1fiwgCs3bfuxiXymdIzcFwKzlZerwLpzuMxYGPSyYi');

INSERT INTO products
  (id, sku, name, category, supplier_name, supplier_contact, specs, cost_price, selling_price, warranty_months, min_stock_qty)
VALUES
(1, 'LAP-DELL-5420', 'Dell Latitude 5420', 'Laptop', 'Dell Vietnam', 'support@dell.example', '{"cpu":"Intel i5","ram":"16GB","storage":"512GB SSD"}', 14500000, 17800000, 24, 3),
(2, 'PHN-SAM-S24', 'Samsung Galaxy S24', 'Phone', 'Samsung Distributor', 'sales@samsung.example', '{"storage":"256GB","color":"Black"}', 15000000, 19900000, 12, 5),
(3, 'ACC-LOG-MX3', 'Logitech MX Master 3S', 'Accessory', 'Logitech Partner', 'partner@logitech.example', '{"type":"Wireless mouse"}', 1800000, 2490000, 12, 8);

INSERT INTO inventory (product_id, quantity) VALUES
(1, 6),
(2, 4),
(3, 20);

INSERT INTO customers (id, full_name, phone, email, address, tier, points) VALUES
(1, 'Nguyen Minh Anh', '0912345678', 'anh.nguyen@example.com', 'Hanoi', 'standard', 120),
(2, 'Tran Quoc Bao', '0987654321', 'bao.tran@example.com', 'Da Nang', 'silver', 640);

SELECT setval('employees_id_seq', 3, true);
SELECT setval('products_id_seq', 3, true);
SELECT setval('customers_id_seq', 2, true);
