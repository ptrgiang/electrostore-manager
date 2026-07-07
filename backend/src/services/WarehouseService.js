const { getStore } = require("../data/store");

async function importStock(payload, user) {
  return getStore().importStock(payload, user.id);
}

async function exportStock(payload, user) {
  return getStore().exportStock(payload, user.id);
}

async function movements() {
  return getStore().listMovements();
}

async function movement(id) {
  return (await getStore().listMovements()).find((item) => item.id === Number(id)) || null;
}

module.exports = { exportStock, importStock, movement, movements };
