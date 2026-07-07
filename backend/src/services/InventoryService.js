const { getStore } = require("../data/store");
const { notFound } = require("../middlewares/error.middleware");

async function list() {
  return getStore().listInventory();
}

async function get(productId) {
  const row = await getStore().getInventory(productId);
  if (!row) {
    throw notFound("Inventory row not found");
  }
  return row;
}

async function movements(productId) {
  return getStore().productMovements(productId);
}

module.exports = { get, list, movements };
