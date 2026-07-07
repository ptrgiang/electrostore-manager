const { getStore } = require("../data/store");

async function list() {
  return getStore().listEmployees();
}

module.exports = { list };
