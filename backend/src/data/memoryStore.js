const { customers, employees, inventory, invoiceItems, invoices, products, stockMovements } = require("./seedData");
const { generateCode } = require("../utils/generateCode");
const { badRequest, notFound } = require("../middlewares/error.middleware");
const { calculateDiscount } = require("../utils/calculateDiscount");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalize(text) {
  return String(text || "").toLowerCase().trim();
}

class MemoryStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.products = clone(products);
    this.customers = clone(customers);
    this.employees = clone(employees);
    this.inventory = clone(inventory);
    this.stockMovements = clone(stockMovements);
    this.invoices = clone(invoices);
    this.invoiceItems = clone(invoiceItems);
    this.next = {
      customer: Math.max(...this.customers.map((item) => item.id)) + 1,
      product: Math.max(...this.products.map((item) => item.id)) + 1,
      invoice: Math.max(...this.invoices.map((item) => item.id)) + 1,
      invoiceItem: Math.max(...this.invoiceItems.map((item) => item.id)) + 1,
      movement: Math.max(...this.stockMovements.map((item) => item.id)) + 1
    };
  }

  async findEmployeeByEmail(email) {
    return this.employees.find((item) => item.email === email && item.is_active) || null;
  }

  async findEmployeeById(id) {
    return this.employees.find((item) => item.id === Number(id) && item.is_active) || null;
  }

  async listEmployees() {
    return this.employees.map(({ password_hash, ...employee }) => employee);
  }

  async listProducts(query = {}) {
    const search = normalize(query.search);
    const category = normalize(query.category);
    return this.products
      .filter((product) => {
        const matchesSearch =
          !search ||
          normalize(product.name).includes(search) ||
          normalize(product.sku).includes(search) ||
          normalize(product.category).includes(search);
        const matchesCategory = !category || normalize(product.category) === category;
        return matchesSearch && matchesCategory;
      })
      .map((product) => this.withStock(product));
  }

  async getProduct(id) {
    const product = this.products.find((item) => item.id === Number(id));
    return product ? this.withStock(product) : null;
  }

  async createProduct(payload) {
    if (this.products.some((item) => item.sku === payload.sku)) {
      throw badRequest("SKU already exists");
    }

    const now = new Date().toISOString();
    const product = {
      id: this.next.product++,
      supplier_name: null,
      supplier_contact: null,
      specs: {},
      warranty_months: 12,
      min_stock_qty: 5,
      is_active: true,
      ...payload,
      cost_price: Number(payload.cost_price),
      selling_price: Number(payload.selling_price),
      created_at: now,
      updated_at: now
    };
    this.products.push(product);
    this.inventory.push({ product_id: product.id, quantity: Number(payload.opening_stock || 0), updated_at: now });
    return this.withStock(product);
  }

  async updateProduct(id, payload) {
    const product = this.products.find((item) => item.id === Number(id));
    if (!product) {
      throw notFound("Product not found");
    }

    Object.assign(product, payload, {
      cost_price: payload.cost_price === undefined ? product.cost_price : Number(payload.cost_price),
      selling_price: payload.selling_price === undefined ? product.selling_price : Number(payload.selling_price),
      updated_at: new Date().toISOString()
    });
    return this.withStock(product);
  }

  async stopSellingProduct(id) {
    return this.updateProduct(id, { is_active: false });
  }

  async lowStockProducts() {
    return this.products
      .map((product) => this.withStock(product))
      .filter((product) => product.is_active && product.stock_qty <= product.min_stock_qty);
  }

  withStock(product) {
    const stock = this.inventory.find((item) => item.product_id === product.id);
    return { ...product, stock_qty: stock ? stock.quantity : 0 };
  }

  async listCustomers(query = {}) {
    const search = normalize(query.search || query.phone || query.name);
    return this.customers.filter((customer) => {
      if (!search) {
        return true;
      }

      return (
        normalize(customer.full_name).includes(search) ||
        normalize(customer.phone).includes(search) ||
        normalize(customer.email).includes(search)
      );
    });
  }

  async findCustomerByPhone(phone) {
    return this.customers.find((customer) => customer.phone === phone) || null;
  }

  async getCustomer(id) {
    return this.customers.find((customer) => customer.id === Number(id)) || null;
  }

  async createCustomer(payload) {
    if (this.customers.some((customer) => customer.phone === payload.phone)) {
      throw badRequest("Phone already exists");
    }

    const customer = {
      id: this.next.customer++,
      email: null,
      address: null,
      tier: "standard",
      points: 0,
      ...payload,
      created_at: new Date().toISOString()
    };
    this.customers.push(customer);
    return customer;
  }

  async updateCustomer(id, payload) {
    const customer = await this.getCustomer(id);
    if (!customer) {
      throw notFound("Customer not found");
    }

    Object.assign(customer, payload);
    return customer;
  }

  async customerHistory(id) {
    const invoices = this.invoices.filter((invoice) => invoice.customer_id === Number(id));
    return invoices.map((invoice) => ({
      ...invoice,
      items: this.invoiceItems.filter((item) => item.invoice_id === invoice.id)
    }));
  }

  async listInventory() {
    return this.inventory.map((row) => {
      const product = this.products.find((item) => item.id === row.product_id);
      return {
        product_id: row.product_id,
        sku: product.sku,
        product_name: product.name,
        category: product.category,
        current_qty: row.quantity,
        min_qty: product.min_stock_qty,
        status: row.quantity === 0 ? "out_of_stock" : row.quantity <= product.min_stock_qty ? "low_stock" : "in_stock",
        updated_at: row.updated_at
      };
    });
  }

  async getInventory(productId) {
    return (await this.listInventory()).find((row) => row.product_id === Number(productId)) || null;
  }

  async productMovements(productId) {
    return this.stockMovements.filter((movement) => movement.product_id === Number(productId));
  }

  async listMovements() {
    return this.stockMovements
      .slice()
      .sort((a, b) => String(b.moved_at).localeCompare(String(a.moved_at)))
      .map((movement) => ({
        ...movement,
        product: this.products.find((product) => product.id === movement.product_id)
      }));
  }

  async importStock(payload, employeeId) {
    if (!payload.items.length) {
      throw badRequest("Import requires at least one item");
    }

    const movements = payload.items.map((item) =>
      this.addMovement({
        movement_type: "import",
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        employee_id: employeeId,
        supplier_name: payload.supplier_name,
        notes: payload.notes
      })
    );

    return { movements };
  }

  async exportStock(payload, employeeId) {
    if (!payload.items.length) {
      throw badRequest("Export requires at least one item");
    }

    for (const item of payload.items) {
      const stock = this.inventory.find((row) => row.product_id === Number(item.product_id));
      if (!stock || stock.quantity < Number(item.quantity)) {
        throw badRequest(`Not enough stock for product ID ${item.product_id}`);
      }
    }

    const movements = payload.items.map((item) =>
      this.addMovement({
        movement_type: "export",
        product_id: item.product_id,
        quantity: item.quantity,
        employee_id: employeeId,
        reason: payload.reason,
        notes: payload.notes
      })
    );

    return { movements };
  }

  addMovement(payload) {
    const product = this.products.find((item) => item.id === Number(payload.product_id));
    if (!product) {
      throw notFound("Product not found");
    }

    const now = new Date().toISOString();
    const movement = {
      id: this.next.movement,
      movement_code: generateCode(payload.movement_type === "import" ? "IMP" : "EXP", this.next.movement),
      ...payload,
      product_id: Number(payload.product_id),
      quantity: Number(payload.quantity),
      moved_at: now
    };
    this.next.movement += 1;
    this.stockMovements.push(movement);

    const stock = this.inventory.find((row) => row.product_id === movement.product_id);
    if (movement.movement_type === "import") {
      if (stock) {
        stock.quantity += movement.quantity;
        stock.updated_at = now;
      } else {
        this.inventory.push({ product_id: movement.product_id, quantity: movement.quantity, updated_at: now });
      }
    } else if (movement.movement_type === "export") {
      if (!stock || stock.quantity < movement.quantity) {
        throw badRequest(`Not enough stock for product ID ${movement.product_id}`);
      }
      stock.quantity -= movement.quantity;
      stock.updated_at = now;
    }

    return movement;
  }

  async createSale(payload, employeeId) {
    if (!payload.items.length) {
      throw badRequest("Cart is empty");
    }

    for (const item of payload.items) {
      const product = this.products.find((row) => row.id === Number(item.product_id) && row.is_active);
      const stock = this.inventory.find((row) => row.product_id === Number(item.product_id));
      if (!product) {
        throw notFound(`Product ID ${item.product_id} not found`);
      }
      if (!stock || stock.quantity < Number(item.quantity)) {
        throw badRequest(`Not enough stock for product ID ${item.product_id}`);
      }
    }

    const subtotal = payload.items.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.quantity), 0);
    const discount_amount = calculateDiscount(subtotal, payload.discount_type, payload.discount_value);
    const total_amount = subtotal - discount_amount;
    const points_earned = Math.floor(total_amount / 10000);
    const invoice = {
      id: this.next.invoice,
      invoice_code: generateCode("HD", this.next.invoice),
      transaction_type: "sale",
      customer_id: payload.customer_id || null,
      employee_id: employeeId,
      discount_type: payload.discount_type || null,
      discount_value: Number(payload.discount_value || 0),
      subtotal,
      discount_amount,
      total_amount,
      payment_method: payload.payment_method,
      status: "completed",
      points_earned,
      notes: payload.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.next.invoice += 1;
    this.invoices.push(invoice);

    const items = payload.items.map((item) => {
      const invoiceItem = {
        id: this.next.invoiceItem++,
        invoice_id: invoice.id,
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price)
      };
      this.invoiceItems.push(invoiceItem);
      this.addMovement({
        movement_type: "export",
        product_id: invoiceItem.product_id,
        quantity: invoiceItem.quantity,
        employee_id: employeeId,
        invoice_id: invoice.id,
        reason: "sale",
        notes: `Invoice ${invoice.invoice_code}`
      });
      return invoiceItem;
    });

    if (invoice.customer_id) {
      const customer = await this.getCustomer(invoice.customer_id);
      if (customer) {
        customer.points += points_earned;
        customer.tier = customer.points >= 3000 ? "platinum" : customer.points >= 1000 ? "gold" : customer.points >= 500 ? "silver" : "standard";
      }
    }

    return {
      invoice,
      items,
      subtotal,
      discount_amount,
      total_amount,
      change_amount: Number(payload.amount_received || 0) - total_amount
    };
  }

  async listInvoices() {
    return this.invoices
      .slice()
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .map((invoice) => ({
        ...invoice,
        customer: this.customers.find((customer) => customer.id === invoice.customer_id) || null,
        employee: this.employees.find((employee) => employee.id === invoice.employee_id) || null
      }));
  }

  async getInvoice(id) {
    const invoice = this.invoices.find((item) => item.id === Number(id));
    if (!invoice) {
      return null;
    }

    return {
      ...invoice,
      customer: this.customers.find((customer) => customer.id === invoice.customer_id) || null,
      employee: this.employees.find((employee) => employee.id === invoice.employee_id) || null,
      items: this.invoiceItems
        .filter((item) => item.invoice_id === invoice.id)
        .map((item) => ({ ...item, product: this.products.find((product) => product.id === item.product_id) }))
    };
  }

  async refundInvoice(id) {
    const invoice = this.invoices.find((item) => item.id === Number(id));
    if (!invoice) {
      throw notFound("Invoice not found");
    }
    invoice.status = "refunded";
    invoice.updated_at = new Date().toISOString();
    return invoice;
  }

  async revenueReport(from, to) {
    const invoices = this.filterCompletedSales(from, to);
    const revenue = invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
    return {
      from,
      to,
      invoice_count: invoices.length,
      revenue,
      gross_profit_placeholder: 0,
      series: invoices.map((invoice) => ({
        date: invoice.created_at.slice(0, 10),
        revenue: invoice.total_amount,
        invoice_count: 1
      }))
    };
  }

  async topProductsReport(from, to, limit = 10) {
    const invoiceIds = new Set(this.filterCompletedSales(from, to).map((invoice) => invoice.id));
    const rows = new Map();
    for (const item of this.invoiceItems.filter((row) => invoiceIds.has(row.invoice_id))) {
      const product = this.products.find((row) => row.id === item.product_id);
      const existing = rows.get(item.product_id) || {
        product_id: item.product_id,
        sku: product.sku,
        name: product.name,
        category: product.category,
        total_sold: 0,
        total_revenue: 0
      };
      existing.total_sold += item.quantity;
      existing.total_revenue += item.quantity * item.unit_price;
      rows.set(item.product_id, existing);
    }

    return [...rows.values()].sort((a, b) => b.total_sold - a.total_sold).slice(0, Number(limit));
  }

  async inventoryStatusReport() {
    const inventoryRows = await this.listInventory();
    return {
      total_products: inventoryRows.length,
      in_stock: inventoryRows.filter((row) => row.status === "in_stock").length,
      low_stock: inventoryRows.filter((row) => row.status === "low_stock").length,
      out_of_stock: inventoryRows.filter((row) => row.status === "out_of_stock").length,
      items: inventoryRows
    };
  }

  filterCompletedSales(from, to) {
    return this.invoices.filter((invoice) => {
      const date = invoice.created_at.slice(0, 10);
      return (
        invoice.transaction_type === "sale" &&
        invoice.status === "completed" &&
        (!from || date >= from) &&
        (!to || date <= to)
      );
    });
  }
}

const memoryStore = new MemoryStore();

module.exports = { MemoryStore, memoryStore };
