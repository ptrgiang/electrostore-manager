const { getPool } = require("../config/db");
const { badRequest, notFound } = require("../middlewares/error.middleware");
const { calculateDiscount } = require("../utils/calculateDiscount");
const { generateCode } = require("../utils/generateCode");

function rows(result) {
  return result.rows;
}

function one(result) {
  return result.rows[0] || null;
}

async function withTransaction(fn) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function nextMovementIdentity(client, prefix) {
  const value = Number(one(await client.query("SELECT nextval('stock_movements_id_seq') AS value")).value);
  return { id: value, code: generateCode(prefix, value) };
}

class PostgresStore {
  async findEmployeeByEmail(email) {
    return one(await getPool().query("SELECT * FROM employees WHERE email = $1 AND is_active = TRUE", [email]));
  }

  async findEmployeeById(id) {
    return one(await getPool().query("SELECT id, full_name, phone, email, role, is_active, created_at FROM employees WHERE id = $1 AND is_active = TRUE", [id]));
  }

  async listEmployees() {
    return rows(await getPool().query("SELECT id, full_name, phone, email, role, is_active, created_at FROM employees ORDER BY id"));
  }

  async listProducts(query = {}) {
    const values = [];
    const clauses = [];
    if (query.search) {
      values.push(`%${query.search}%`);
      clauses.push(`(p.name ILIKE $${values.length} OR p.sku ILIKE $${values.length} OR p.category ILIKE $${values.length})`);
    }
    if (query.category) {
      values.push(query.category);
      clauses.push(`p.category = $${values.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    return rows(
      await getPool().query(
        `SELECT p.*, COALESCE(i.quantity, 0) AS stock_qty
         FROM products p
         LEFT JOIN inventory i ON i.product_id = p.id
         ${where}
         ORDER BY p.created_at DESC`,
        values
      )
    );
  }

  async getProduct(id) {
    return one(
      await getPool().query(
        `SELECT p.*, COALESCE(i.quantity, 0) AS stock_qty
         FROM products p
         LEFT JOIN inventory i ON i.product_id = p.id
         WHERE p.id = $1`,
        [id]
      )
    );
  }

  async createProduct(payload) {
    return withTransaction(async (client) => {
      const product = one(
        await client.query(
          `INSERT INTO products
             (sku, name, category, supplier_name, supplier_contact, specs, cost_price, selling_price, warranty_months, min_stock_qty, is_active)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,TRUE)
           RETURNING *`,
          [
            payload.sku,
            payload.name,
            payload.category,
            payload.supplier_name || null,
            payload.supplier_contact || null,
            payload.specs || {},
            payload.cost_price,
            payload.selling_price,
            payload.warranty_months || 12,
            payload.min_stock_qty || 5
          ]
        )
      );
      await client.query("INSERT INTO inventory (product_id, quantity) VALUES ($1, $2)", [product.id, payload.opening_stock || 0]);
      return this.getProduct(product.id);
    });
  }

  async updateProduct(id, payload) {
    const existing = await this.getProduct(id);
    if (!existing) {
      throw notFound("Product not found");
    }

    const next = { ...existing, ...payload };
    return one(
      await getPool().query(
        `UPDATE products
         SET sku=$1, name=$2, category=$3, supplier_name=$4, supplier_contact=$5, specs=$6,
             cost_price=$7, selling_price=$8, warranty_months=$9, min_stock_qty=$10,
             is_active=$11, updated_at=NOW()
         WHERE id=$12
         RETURNING *`,
        [
          next.sku,
          next.name,
          next.category,
          next.supplier_name,
          next.supplier_contact,
          next.specs || {},
          next.cost_price,
          next.selling_price,
          next.warranty_months,
          next.min_stock_qty,
          next.is_active,
          id
        ]
      )
    );
  }

  async stopSellingProduct(id) {
    return this.updateProduct(id, { is_active: false });
  }

  async lowStockProducts() {
    return rows(await getPool().query("SELECT * FROM v_low_stock_alert ORDER BY current_qty ASC"));
  }

  async listCustomers(query = {}) {
    const search = query.search || query.phone || query.name;
    if (!search) {
      return rows(await getPool().query("SELECT * FROM customers ORDER BY created_at DESC"));
    }

    return rows(
      await getPool().query(
        "SELECT * FROM customers WHERE full_name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1 ORDER BY created_at DESC",
        [`%${search}%`]
      )
    );
  }

  async findCustomerByPhone(phone) {
    return one(await getPool().query("SELECT * FROM customers WHERE phone = $1", [phone]));
  }

  async getCustomer(id) {
    return one(await getPool().query("SELECT * FROM customers WHERE id = $1", [id]));
  }

  async createCustomer(payload) {
    return one(
      await getPool().query(
        `INSERT INTO customers (full_name, phone, email, address, tier, points)
         VALUES ($1,$2,$3,$4,'standard',0)
         RETURNING *`,
        [payload.full_name, payload.phone, payload.email || null, payload.address || null]
      )
    );
  }

  async updateCustomer(id, payload) {
    const existing = await this.getCustomer(id);
    if (!existing) {
      throw notFound("Customer not found");
    }
    const next = { ...existing, ...payload };
    return one(
      await getPool().query(
        "UPDATE customers SET full_name=$1, phone=$2, email=$3, address=$4 WHERE id=$5 RETURNING *",
        [next.full_name, next.phone, next.email, next.address, id]
      )
    );
  }

  async customerHistory(id) {
    return rows(
      await getPool().query(
        `SELECT i.*, COALESCE(json_agg(ii.*) FILTER (WHERE ii.id IS NOT NULL), '[]') AS items
         FROM invoices i
         LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
         WHERE i.customer_id = $1
         GROUP BY i.id
         ORDER BY i.created_at DESC`,
        [id]
      )
    );
  }

  async listInventory() {
    return rows(
      await getPool().query(
        `SELECT i.product_id, p.sku, p.name AS product_name, p.category, i.quantity AS current_qty,
                p.min_stock_qty AS min_qty,
                CASE WHEN i.quantity = 0 THEN 'out_of_stock'
                     WHEN i.quantity <= p.min_stock_qty THEN 'low_stock'
                     ELSE 'in_stock' END AS status,
                i.updated_at
         FROM inventory i
         JOIN products p ON p.id = i.product_id
         ORDER BY p.name`
      )
    );
  }

  async getInventory(productId) {
    return one(
      await getPool().query(
        `SELECT i.product_id, p.sku, p.name AS product_name, p.category, i.quantity AS current_qty,
                p.min_stock_qty AS min_qty, i.updated_at
         FROM inventory i JOIN products p ON p.id = i.product_id WHERE i.product_id = $1`,
        [productId]
      )
    );
  }

  async productMovements(productId) {
    return rows(await getPool().query("SELECT * FROM stock_movements WHERE product_id = $1 ORDER BY moved_at DESC", [productId]));
  }

  async listMovements() {
    return rows(
      await getPool().query(
        `SELECT sm.*, row_to_json(p.*) AS product
         FROM stock_movements sm
         JOIN products p ON p.id = sm.product_id
         ORDER BY sm.moved_at DESC`
      )
    );
  }

  async importStock(payload, employeeId) {
    return withTransaction(async (client) => {
      const movements = [];
      for (const item of payload.items) {
        const identity = await nextMovementIdentity(client, "IMP");
        const movement = one(
          await client.query(
            `INSERT INTO stock_movements
               (id, movement_code, movement_type, product_id, quantity, unit_price, employee_id, supplier_name, notes)
             VALUES ($1,$2,'import',$3,$4,$5,$6,$7,$8)
             RETURNING *`,
            [identity.id, identity.code, item.product_id, item.quantity, item.unit_price, employeeId, payload.supplier_name, payload.notes || null]
          )
        );
        movements.push(movement);
      }
      return { movements };
    });
  }

  async exportStock(payload, employeeId) {
    return withTransaction(async (client) => {
      for (const item of payload.items) {
        const stock = one(await client.query("SELECT * FROM inventory WHERE product_id = $1 FOR UPDATE", [item.product_id]));
        if (!stock || Number(stock.quantity) < Number(item.quantity)) {
          throw badRequest(`Not enough stock for product ID ${item.product_id}`);
        }
      }

      const movements = [];
      for (const item of payload.items) {
        const identity = await nextMovementIdentity(client, "EXP");
        movements.push(
          one(
            await client.query(
              `INSERT INTO stock_movements
                 (id, movement_code, movement_type, product_id, quantity, employee_id, reason, notes)
               VALUES ($1,$2,'export',$3,$4,$5,$6,$7)
               RETURNING *`,
              [identity.id, identity.code, item.product_id, item.quantity, employeeId, payload.reason, payload.notes || null]
            )
          )
        );
      }
      return { movements };
    });
  }

  async createSale(payload, employeeId) {
    return withTransaction(async (client) => {
      for (const item of payload.items) {
        const stock = one(await client.query("SELECT * FROM inventory WHERE product_id = $1 FOR UPDATE", [item.product_id]));
        if (!stock || Number(stock.quantity) < Number(item.quantity)) {
          throw badRequest(`Not enough stock for product ID ${item.product_id}`);
        }
      }

      const subtotal = payload.items.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.quantity), 0);
      const discount_amount = calculateDiscount(subtotal, payload.discount_type, payload.discount_value);
      const total_amount = subtotal - discount_amount;
      const points_earned = Math.floor(total_amount / 10000);
      const invoiceNumber = one(await client.query("SELECT nextval('invoices_id_seq') AS value")).value;
      const invoiceCode = generateCode("HD", invoiceNumber);
      const invoice = one(
        await client.query(
          `INSERT INTO invoices
             (id, invoice_code, transaction_type, customer_id, employee_id, discount_type, discount_value,
              subtotal, total_amount, payment_method, status, points_earned, notes)
           VALUES ($1,$2,'sale',$3,$4,$5,$6,$7,$8,$9,'completed',$10,$11)
           RETURNING *`,
          [
            invoiceNumber,
            invoiceCode,
            payload.customer_id || null,
            employeeId,
            payload.discount_type || null,
            payload.discount_value || 0,
            subtotal,
            total_amount,
            payload.payment_method,
            points_earned,
            payload.notes || null
          ]
        )
      );

      const items = [];
      for (const item of payload.items) {
        items.push(
          one(
            await client.query(
              "INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price) VALUES ($1,$2,$3,$4) RETURNING *",
              [invoice.id, item.product_id, item.quantity, item.unit_price]
            )
          )
        );
        const identity = await nextMovementIdentity(client, "AUTO");
        await client.query(
          `INSERT INTO stock_movements
             (id, movement_code, movement_type, product_id, quantity, employee_id, invoice_id, reason, notes)
           VALUES ($1,$2,'export',$3,$4,$5,$6,'sale',$7)`,
          [identity.id, identity.code, item.product_id, item.quantity, employeeId, invoice.id, `Invoice ${invoice.invoice_code}`]
        );
      }

      if (payload.customer_id) {
        await client.query("UPDATE customers SET points = points + $1 WHERE id = $2", [points_earned, payload.customer_id]);
      }

      return {
        invoice: { ...invoice, discount_amount },
        items,
        subtotal,
        discount_amount,
        total_amount,
        change_amount: Number(payload.amount_received || 0) - total_amount
      };
    });
  }

  async listInvoices() {
    return rows(
      await getPool().query(
        `SELECT i.*, row_to_json(c.*) AS customer, row_to_json(e.*) AS employee
         FROM invoices i
         LEFT JOIN customers c ON c.id = i.customer_id
         LEFT JOIN employees e ON e.id = i.employee_id
         ORDER BY i.created_at DESC`
      )
    );
  }

  async getInvoice(id) {
    return one(
      await getPool().query(
        `SELECT i.*, row_to_json(c.*) AS customer, row_to_json(e.*) AS employee,
                COALESCE(json_agg(json_build_object('id', ii.id, 'product_id', ii.product_id, 'quantity', ii.quantity, 'unit_price', ii.unit_price, 'product', row_to_json(p.*))) FILTER (WHERE ii.id IS NOT NULL), '[]') AS items
         FROM invoices i
         LEFT JOIN customers c ON c.id = i.customer_id
         LEFT JOIN employees e ON e.id = i.employee_id
         LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
         LEFT JOIN products p ON p.id = ii.product_id
         WHERE i.id = $1
         GROUP BY i.id, c.id, e.id`,
        [id]
      )
    );
  }

  async refundInvoice(id) {
    return one(await getPool().query("UPDATE invoices SET status='refunded', updated_at=NOW() WHERE id=$1 RETURNING *", [id]));
  }

  async revenueReport(from, to) {
    const values = [from || "1970-01-01", to || "2999-12-31"];
    const result = one(
      await getPool().query(
        `SELECT COUNT(*)::int AS invoice_count, COALESCE(SUM(total_amount),0)::float AS revenue
         FROM invoices
         WHERE transaction_type='sale' AND status='completed' AND DATE(created_at) BETWEEN $1 AND $2`,
        values
      )
    );
    const series = rows(
      await getPool().query(
        `SELECT DATE(created_at) AS date, COUNT(*)::int AS invoice_count, SUM(total_amount)::float AS revenue
         FROM invoices
         WHERE transaction_type='sale' AND status='completed' AND DATE(created_at) BETWEEN $1 AND $2
         GROUP BY DATE(created_at)
         ORDER BY DATE(created_at)`,
        values
      )
    );
    return { from, to, ...result, gross_profit_placeholder: 0, series };
  }

  async topProductsReport(from, to, limit = 10) {
    return rows(
      await getPool().query(
        `SELECT p.id AS product_id, p.sku, p.name, p.category,
                SUM(ii.quantity)::int AS total_sold,
                SUM(ii.quantity * ii.unit_price)::float AS total_revenue
         FROM invoice_items ii
         JOIN products p ON p.id = ii.product_id
         JOIN invoices i ON i.id = ii.invoice_id
         WHERE i.transaction_type='sale' AND i.status='completed'
           AND DATE(i.created_at) BETWEEN $1 AND $2
         GROUP BY p.id, p.sku, p.name, p.category
         ORDER BY total_sold DESC
         LIMIT $3`,
        [from || "1970-01-01", to || "2999-12-31", limit]
      )
    );
  }

  async inventoryStatusReport() {
    const items = await this.listInventory();
    return {
      total_products: items.length,
      in_stock: items.filter((item) => item.status === "in_stock").length,
      low_stock: items.filter((item) => item.status === "low_stock").length,
      out_of_stock: items.filter((item) => item.status === "out_of_stock").length,
      items
    };
  }
}

const postgresStore = new PostgresStore();

module.exports = { PostgresStore, postgresStore };
