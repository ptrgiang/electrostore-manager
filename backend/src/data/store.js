const { memoryStore } = require("./memoryStore");
const { postgresStore } = require("./postgresStore");

function getStore() {
  if ((process.env.DATA_STORE || "memory") === "postgres") {
    return postgresStore;
  }

  return memoryStore;
}

module.exports = { getStore };
