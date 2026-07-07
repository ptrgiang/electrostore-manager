const { z } = require("zod");

const positiveNumber = z.coerce.number().nonnegative();
const positiveInt = z.coerce.number().int().positive();

const productPayload = z.object({
  sku: z.string().min(2).max(50),
  name: z.string().min(2).max(200),
  category: z.string().min(2).max(100),
  supplier_name: z.string().max(200).optional().nullable(),
  supplier_contact: z.string().max(100).optional().nullable(),
  specs: z.record(z.any()).optional(),
  cost_price: positiveNumber,
  selling_price: positiveNumber,
  warranty_months: z.coerce.number().int().nonnegative().optional(),
  min_stock_qty: z.coerce.number().int().nonnegative().optional(),
  opening_stock: z.coerce.number().int().nonnegative().optional()
});

const productUpdatePayload = productPayload.partial();

const customerPayload = z.object({
  full_name: z.string().min(2).max(150),
  phone: z.string().min(6).max(20),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable()
});

const customerUpdatePayload = customerPayload.partial();

const stockItem = z.object({
  product_id: positiveInt,
  quantity: positiveInt,
  unit_price: positiveNumber.optional()
});

const importPayload = z.object({
  supplier_name: z.string().min(2).max(200),
  items: z.array(stockItem.extend({ unit_price: positiveNumber })).min(1),
  notes: z.string().optional().nullable()
});

const exportPayload = z.object({
  reason: z.enum(["return_to_supplier", "damage", "other"]),
  items: z.array(stockItem.omit({ unit_price: true })).min(1),
  notes: z.string().optional().nullable()
});

const salePayload = z.object({
  customer_id: positiveInt.optional().nullable(),
  payment_method: z.enum(["cash", "card", "transfer", "qr"]),
  discount_type: z.enum(["percent", "fixed"]).optional().nullable(),
  discount_value: positiveNumber.optional().default(0),
  amount_received: positiveNumber.optional().default(0),
  notes: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        product_id: positiveInt,
        quantity: positiveInt,
        unit_price: positiveNumber
      })
    )
    .min(1)
});

module.exports = {
  customerPayload,
  customerUpdatePayload,
  exportPayload,
  importPayload,
  productPayload,
  productUpdatePayload,
  salePayload
};
