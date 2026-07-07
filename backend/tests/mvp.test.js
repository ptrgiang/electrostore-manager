process.env.DATA_STORE = "memory";
process.env.JWT_SECRET = "test-secret";

const assert = require("node:assert/strict");
const test = require("node:test");
const request = require("supertest");
const { app } = require("../src/app");
const { memoryStore } = require("../src/data/memoryStore");

async function login(email) {
  const response = await request(app).post("/api/auth/login").send({ email, password: "Password123!" }).expect(200);
  return response.body.data.token;
}

test.beforeEach(() => {
  memoryStore.reset();
});

test("employees can log in and receive their role", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: "manager@electrostore.manager", password: "Password123!" })
    .expect(200);

  assert.equal(response.body.data.user.role, "manager");
  assert.ok(response.body.data.token);
});

test("RBAC blocks restricted manager report APIs from warehouse staff", async () => {
  const token = await login("warehouse@electrostore.manager");

  await request(app).get("/api/reports/revenue").set("Authorization", `Bearer ${token}`).expect(403);
});

test("manager can create, search, edit, and stop selling a product", async () => {
  const token = await login("manager@electrostore.manager");

  const created = await request(app)
    .post("/api/products")
    .set("Authorization", `Bearer ${token}`)
    .send({
      sku: "TAB-IPAD-AIR",
      name: "iPad Air",
      category: "Tablet",
      cost_price: 12000000,
      selling_price: 15000000,
      opening_stock: 2
    })
    .expect(201);

  const id = created.body.data.id;
  assert.equal(created.body.data.stock_qty, 2);

  const search = await request(app).get("/api/products?search=iPad").set("Authorization", `Bearer ${token}`).expect(200);
  assert.equal(search.body.data.length, 1);

  const updated = await request(app)
    .put(`/api/products/${id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ selling_price: 14900000 })
    .expect(200);
  assert.equal(updated.body.data.selling_price, 14900000);

  const stopped = await request(app).patch(`/api/products/${id}/stop-selling`).set("Authorization", `Bearer ${token}`).expect(200);
  assert.equal(stopped.body.data.is_active, false);
});

test("customer can be created and searched by phone", async () => {
  const token = await login("sales@electrostore.manager");

  await request(app)
    .post("/api/customers")
    .set("Authorization", `Bearer ${token}`)
    .send({ full_name: "Mai Anh Dao", phone: "0909555123", email: "dao.mai@example.com" })
    .expect(201);

  const response = await request(app).get("/api/customers/search?phone=0909555123").set("Authorization", `Bearer ${token}`).expect(200);
  assert.equal(response.body.data.full_name, "Mai Anh Dao");
});

test("warehouse import increases stock, export decreases stock, and export blocks insufficient stock", async () => {
  const token = await login("warehouse@electrostore.manager");

  await request(app)
    .post("/api/warehouse/import")
    .set("Authorization", `Bearer ${token}`)
    .send({ supplier_name: "ABC Supplier", items: [{ product_id: 2, quantity: 3, unit_price: 15000000 }] })
    .expect(201);

  const afterImport = await request(app).get("/api/inventory/2").set("Authorization", `Bearer ${token}`).expect(200);
  assert.equal(afterImport.body.data.current_qty, 7);

  await request(app)
    .post("/api/warehouse/export")
    .set("Authorization", `Bearer ${token}`)
    .send({ reason: "damage", items: [{ product_id: 2, quantity: 2 }] })
    .expect(201);

  const afterExport = await request(app).get("/api/inventory/2").set("Authorization", `Bearer ${token}`).expect(200);
  assert.equal(afterExport.body.data.current_qty, 5);

  await request(app)
    .post("/api/warehouse/export")
    .set("Authorization", `Bearer ${token}`)
    .send({ reason: "damage", items: [{ product_id: 2, quantity: 99 }] })
    .expect(400);
});

test("POS sale creates invoice, invoice items, stock movement, stock decrement, points, and reports", async () => {
  const token = await login("sales@electrostore.manager");

  const sale = await request(app)
    .post("/api/invoices/sale")
    .set("Authorization", `Bearer ${token}`)
    .send({
      customer_id: 1,
      payment_method: "cash",
      discount_type: "fixed",
      discount_value: 50000,
      amount_received: 20000000,
      items: [{ product_id: 1, quantity: 1, unit_price: 17800000 }]
    })
    .expect(201);

  assert.equal(sale.body.data.invoice.status, "completed");
  assert.equal(sale.body.data.items.length, 1);

  const inventory = await request(app).get("/api/inventory/1").set("Authorization", `Bearer ${token}`).expect(200);
  assert.equal(inventory.body.data.current_qty, 5);

  const customer = await request(app).get("/api/customers/1").set("Authorization", `Bearer ${token}`).expect(200);
  assert.ok(customer.body.data.points > 120);

  const movements = await request(app).get("/api/inventory/1/movements").set("Authorization", `Bearer ${token}`).expect(200);
  assert.ok(movements.body.data.some((movement) => movement.reason === "sale"));

  const managerToken = await login("manager@electrostore.manager");
  const revenue = await request(app).get("/api/reports/revenue").set("Authorization", `Bearer ${managerToken}`).expect(200);
  assert.ok(revenue.body.data.invoice_count >= 1);
  assert.ok(revenue.body.data.revenue > 0);

  const topProducts = await request(app).get("/api/reports/top-products").set("Authorization", `Bearer ${managerToken}`).expect(200);
  assert.ok(topProducts.body.data.some((product) => product.product_id === 1));
});
