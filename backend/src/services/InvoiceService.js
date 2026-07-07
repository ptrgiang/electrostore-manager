const { getStore } = require("../data/store");
const { notFound } = require("../middlewares/error.middleware");

async function createSale(payload, user) {
  return getStore().createSale(payload, user.id);
}

async function list() {
  return getStore().listInvoices();
}

async function get(id) {
  const invoice = await getStore().getInvoice(id);
  if (!invoice) {
    throw notFound("Invoice not found");
  }
  return invoice;
}

async function refund(id) {
  return getStore().refundInvoice(id);
}

module.exports = { createSale, get, list, refund };
