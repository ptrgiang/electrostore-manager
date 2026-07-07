-- Demo seed for local development.
-- All users use password: Password123!

INSERT INTO employees (id, full_name, phone, email, role, password_hash) VALUES
(1, 'Store Manager', '0900000001', 'manager@electrostore.local', 'manager', '$2a$10$YAhY0vPAkio1fiwgCs3bfuxiXymdIzcFwKzlZerwLpzuMxYGPSyYi'),
(2, 'Sales Associate', '0900000002', 'sales@electrostore.local', 'salesperson', '$2a$10$YAhY0vPAkio1fiwgCs3bfuxiXymdIzcFwKzlZerwLpzuMxYGPSyYi'),
(3, 'Warehouse Staff', '0900000003', 'warehouse@electrostore.local', 'warehouse_staff', '$2a$10$YAhY0vPAkio1fiwgCs3bfuxiXymdIzcFwKzlZerwLpzuMxYGPSyYi'),
(4, 'POS Cashier', '0900000004', 'cashier@electrostore.local', 'salesperson', '$2a$10$YAhY0vPAkio1fiwgCs3bfuxiXymdIzcFwKzlZerwLpzuMxYGPSyYi'),
(5, 'Inventory Clerk', '0900000005', 'inventory@electrostore.local', 'warehouse_staff', '$2a$10$YAhY0vPAkio1fiwgCs3bfuxiXymdIzcFwKzlZerwLpzuMxYGPSyYi');

INSERT INTO products
  (id, sku, name, category, supplier_name, supplier_contact, specs, cost_price, selling_price, warranty_months, min_stock_qty, is_active, created_at, updated_at)
VALUES
(1, 'LAP-DELL-5420', 'Dell Latitude 5420', 'Laptop', 'Dell Vietnam', 'support@dell.example', '{"cpu":"Intel i5","ram":"16GB","storage":"512GB SSD"}', 14500000, 17800000, 24, 3, true, '2026-07-01T10:00:00Z', '2026-07-01T10:00:00Z'),
(2, 'PHN-SAM-S24', 'Samsung Galaxy S24', 'Phone', 'Samsung Distributor', 'sales@samsung.example', '{"storage":"256GB","color":"Black"}', 15000000, 19900000, 12, 5, true, '2026-07-01T10:15:00Z', '2026-07-01T10:15:00Z'),
(3, 'ACC-LOG-MX3', 'Logitech MX Master 3S', 'Accessory', 'Logitech Partner', 'partner@logitech.example', '{"type":"Wireless mouse"}', 1800000, 2490000, 12, 8, true, '2026-07-01T10:30:00Z', '2026-07-01T10:30:00Z'),
(4, 'LAP-MBA-M3-13', 'MacBook Air 13 M3', 'Laptop', 'Apple Premium Reseller', 'b2b@apple-reseller.example', '{"cpu":"Apple M3","ram":"16GB","storage":"512GB SSD"}', 25500000, 29990000, 12, 2, true, '2026-07-01T10:45:00Z', '2026-07-01T10:45:00Z'),
(5, 'MON-LG-27UL', 'LG 27 inch 4K Monitor', 'Monitor', 'LG Electronics', 'lg-distribution@example.com', '{"size":"27 inch","resolution":"4K","panel":"IPS"}', 6200000, 7990000, 24, 4, true, '2026-07-01T11:00:00Z', '2026-07-01T11:00:00Z'),
(6, 'TAB-SAM-S9', 'Samsung Galaxy Tab S9', 'Tablet', 'Samsung Distributor', 'sales@samsung.example', '{"storage":"128GB","display":"AMOLED"}', 12600000, 15990000, 12, 3, true, '2026-07-01T11:15:00Z', '2026-07-01T11:15:00Z'),
(7, 'ACC-ANK-65W', 'Anker 65W USB-C Charger', 'Accessory', 'Anker Vietnam', 'dealer@anker.example', '{"power":"65W","ports":"2 USB-C, 1 USB-A"}', 520000, 890000, 18, 12, true, '2026-07-01T11:30:00Z', '2026-07-01T11:30:00Z'),
(8, 'NET-ASUS-AX55', 'ASUS RT-AX55 Router', 'Networking', 'ASUS Channel', 'asus-channel@example.com', '{"wifi":"WiFi 6","speed":"AX1800"}', 1450000, 2190000, 36, 5, true, '2026-07-01T11:45:00Z', '2026-07-01T11:45:00Z'),
(9, 'CAM-SONY-ZV1', 'Sony ZV-1 II Vlog Camera', 'Camera', 'Sony Imaging', 'sony-imaging@example.com', '{"sensor":"1 inch","lens":"18-50mm"}', 16500000, 19990000, 24, 2, true, '2026-07-01T12:00:00Z', '2026-07-01T12:00:00Z'),
(10, 'AUD-SON-WH1000', 'Sony WH-1000XM5 Headphones', 'Audio', 'Sony Audio', 'sony-audio@example.com', '{"type":"Noise cancelling","color":"Black"}', 6200000, 8490000, 12, 6, true, '2026-07-01T12:15:00Z', '2026-07-01T12:15:00Z'),
(11, 'PRN-CAN-G2020', 'Canon PIXMA G2020 Printer', 'Printer', 'Canon Office', 'canon-office@example.com', '{"type":"Ink tank","function":"Print scan copy"}', 2850000, 3790000, 12, 3, true, '2026-07-01T12:30:00Z', '2026-07-01T12:30:00Z'),
(12, 'OLD-IP11-64', 'iPhone 11 64GB Clearance', 'Phone', 'Clearance Stock', 'clearance@example.com', '{"storage":"64GB","condition":"New old stock"}', 6800000, 7990000, 6, 1, false, '2026-07-01T12:45:00Z', '2026-07-03T16:00:00Z');

INSERT INTO inventory (product_id, quantity, updated_at) VALUES
(1, 6, '2026-07-01T10:00:00Z'),
(2, 4, '2026-07-01T10:15:00Z'),
(3, 20, '2026-07-01T10:30:00Z'),
(4, 3, '2026-07-03T13:00:00Z'),
(5, 2, '2026-07-03T13:10:00Z'),
(6, 7, '2026-07-03T13:20:00Z'),
(7, 9, '2026-07-03T13:30:00Z'),
(8, 0, '2026-07-03T13:40:00Z'),
(9, 2, '2026-07-03T13:50:00Z'),
(10, 5, '2026-07-03T14:00:00Z'),
(11, 8, '2026-07-03T14:10:00Z'),
(12, 1, '2026-07-03T14:20:00Z');

INSERT INTO customers (id, full_name, phone, email, address, tier, points, created_at) VALUES
(1, 'Nguyen Minh Anh', '0912345678', 'anh.nguyen@example.com', 'Hanoi', 'standard', 120, '2026-07-02T09:00:00Z'),
(2, 'Tran Quoc Bao', '0987654321', 'bao.tran@example.com', 'Da Nang', 'silver', 640, '2026-07-02T11:00:00Z'),
(3, 'Pham Gia Huy', '0934567890', 'huy.pham@example.com', 'Ho Chi Minh City', 'gold', 1420, '2026-07-02T13:00:00Z'),
(4, 'Le Thu Ha', '0909123456', 'ha.le@example.com', 'Hanoi', 'standard', 80, '2026-07-02T14:20:00Z'),
(5, 'Doan Minh Khoa', '0977001122', 'khoa.doan@example.com', 'Hai Phong', 'silver', 530, '2026-07-02T15:15:00Z'),
(6, 'Bui Ngoc Linh', '0888123456', 'linh.bui@example.com', 'Can Tho', 'platinum', 3280, '2026-07-02T16:40:00Z'),
(7, 'Vu Thanh Nam', '0866007788', 'nam.vu@example.com', 'Da Nang', 'standard', 260, '2026-07-03T09:30:00Z'),
(8, 'Hoang Lan Chi', '0855123987', 'chi.hoang@example.com', 'Hanoi', 'gold', 1880, '2026-07-03T10:25:00Z');

INSERT INTO invoices
  (id, invoice_code, transaction_type, customer_id, employee_id, discount_type, discount_value, subtotal, total_amount, payment_method, status, points_earned, notes, created_at, updated_at)
VALUES
(1, 'HD-20260702-001', 'sale', 1, 2, 'fixed', 100000, 17800000, 17700000, 'cash', 'completed', 1770, 'Laptop sale with cash payment', '2026-07-02T10:15:00Z', '2026-07-02T10:15:00Z'),
(2, 'HD-20260702-002', 'sale', 3, 4, 'percent', 5, 22390000, 21270500, 'card', 'completed', 2127, 'Phone and charger bundle', '2026-07-02T15:30:00Z', '2026-07-02T15:30:00Z'),
(3, 'HD-20260703-001', 'sale', 6, 2, null, 0, 29990000, 29990000, 'transfer', 'completed', 2999, 'MacBook upgrade purchase', '2026-07-03T11:20:00Z', '2026-07-03T11:20:00Z'),
(4, 'HD-20260703-002', 'sale', 2, 4, 'fixed', 200000, 13480000, 13280000, 'qr', 'completed', 1328, 'Audio gift purchase', '2026-07-03T17:45:00Z', '2026-07-03T17:45:00Z'),
(5, 'HD-20260704-001', 'sale', 8, 2, null, 0, 18180000, 18180000, 'cash', 'completed', 1818, 'Home office setup', '2026-07-04T09:40:00Z', '2026-07-04T09:40:00Z'),
(6, 'HD-20260704-002', 'sale', null, 4, null, 0, 2190000, 2190000, 'cash', 'refunded', 0, 'Returned router', '2026-07-04T12:10:00Z', '2026-07-04T14:20:00Z'),
(7, 'HD-20260705-001', 'sale', 5, 2, 'fixed', 50000, 8470000, 8420000, 'card', 'completed', 842, 'Printer and charger', '2026-07-05T16:05:00Z', '2026-07-05T16:05:00Z'),
(8, 'HD-20260707-001', 'sale', 7, 4, 'percent', 3, 18480000, 17925600, 'qr', 'completed', 1792, 'Tablet and charger', '2026-07-07T08:45:00Z', '2026-07-07T08:45:00Z');

INSERT INTO invoice_items (id, invoice_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 1, 17800000),
(2, 2, 2, 1, 19900000),
(3, 2, 7, 1, 890000),
(4, 2, 3, 1, 1600000),
(5, 3, 4, 1, 29990000),
(6, 4, 10, 1, 8490000),
(7, 4, 7, 2, 890000),
(8, 4, 3, 1, 3210000),
(9, 5, 5, 1, 7990000),
(10, 5, 11, 1, 3790000),
(11, 5, 8, 1, 2190000),
(12, 5, 7, 5, 842000),
(13, 6, 8, 1, 2190000),
(14, 7, 11, 2, 3790000),
(15, 7, 7, 1, 890000),
(16, 8, 6, 1, 15990000),
(17, 8, 7, 1, 890000),
(18, 8, 3, 1, 1600000);

ALTER TABLE stock_movements DISABLE TRIGGER trg_sync_inventory;

INSERT INTO stock_movements
  (id, movement_code, movement_type, product_id, quantity, unit_price, employee_id, invoice_id, supplier_name, reason, notes, moved_at)
VALUES
(1, 'IMP-20260701-001', 'import', 1, 8, 14500000, 3, null, 'Dell Vietnam', null, 'Opening laptop stock', '2026-07-01T10:00:00Z'),
(2, 'IMP-20260701-002', 'import', 2, 7, 15000000, 3, null, 'Samsung Distributor', null, 'Opening phone stock', '2026-07-01T10:15:00Z'),
(3, 'IMP-20260701-003', 'import', 3, 24, 1800000, 5, null, 'Logitech Partner', null, 'Accessory replenishment', '2026-07-01T10:30:00Z'),
(4, 'IMP-20260701-004', 'import', 4, 4, 25500000, 3, null, 'Apple Premium Reseller', null, 'MacBook stock', '2026-07-01T10:45:00Z'),
(5, 'IMP-20260701-005', 'import', 5, 3, 6200000, 5, null, 'LG Electronics', null, 'Monitor stock', '2026-07-01T11:00:00Z'),
(6, 'EXP-20260702-001', 'export', 1, 1, null, 2, 1, null, 'sale', 'Invoice HD-20260702-001', '2026-07-02T10:15:00Z'),
(7, 'EXP-20260702-002', 'export', 2, 1, null, 4, 2, null, 'sale', 'Invoice HD-20260702-002', '2026-07-02T15:30:00Z'),
(8, 'EXP-20260703-001', 'export', 4, 1, null, 2, 3, null, 'sale', 'Invoice HD-20260703-001', '2026-07-03T11:20:00Z'),
(9, 'EXP-20260703-002', 'export', 8, 1, null, 5, null, null, 'damage', 'Damaged packaging write-off', '2026-07-03T13:40:00Z'),
(10, 'EXP-20260704-001', 'export', 5, 1, null, 2, 5, null, 'sale', 'Invoice HD-20260704-001', '2026-07-04T09:40:00Z'),
(11, 'EXP-20260705-001', 'export', 11, 2, null, 2, 7, null, 'sale', 'Invoice HD-20260705-001', '2026-07-05T16:05:00Z'),
(12, 'EXP-20260707-001', 'export', 6, 1, null, 4, 8, null, 'sale', 'Invoice HD-20260707-001', '2026-07-07T08:45:00Z');

ALTER TABLE stock_movements ENABLE TRIGGER trg_sync_inventory;

SELECT setval('employees_id_seq', 5, true);
SELECT setval('products_id_seq', 12, true);
SELECT setval('customers_id_seq', 8, true);
SELECT setval('invoices_id_seq', 8, true);
SELECT setval('invoice_items_id_seq', 18, true);
SELECT setval('stock_movements_id_seq', 12, true);
