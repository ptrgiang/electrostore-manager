const { getStore } = require("../data/store");
const { notFound } = require("../middlewares/error.middleware");

async function list(query) {
  return getStore().listProducts(query);
}

async function get(id) {
  const product = await getStore().getProduct(id);
  if (!product) {
    throw notFound("Product not found");
  }
  return product;
}

async function create(payload) {
  return getStore().createProduct(payload);
}

async function update(id, payload) {
  return getStore().updateProduct(id, payload);
}

async function stopSelling(id) {
  return getStore().stopSellingProduct(id);
}

async function lowStock() {
  return getStore().lowStockProducts();
}

module.exports = { create, get, list, lowStock, stopSelling, update };
