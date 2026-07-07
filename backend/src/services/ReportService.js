const { getStore } = require("../data/store");

async function revenue(query) {
  return getStore().revenueReport(query.from, query.to);
}

async function topProducts(query) {
  return getStore().topProductsReport(query.from, query.to, query.limit || 10);
}

async function lowStock() {
  return getStore().lowStockProducts();
}

async function inventoryStatus() {
  return getStore().inventoryStatusReport();
}

module.exports = { inventoryStatus, lowStock, revenue, topProducts };
