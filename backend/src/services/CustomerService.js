const { getStore } = require("../data/store");
const { notFound } = require("../middlewares/error.middleware");

async function list(query) {
  return getStore().listCustomers(query);
}

async function searchByPhone(phone) {
  return getStore().findCustomerByPhone(phone);
}

async function get(id) {
  const customer = await getStore().getCustomer(id);
  if (!customer) {
    throw notFound("Customer not found");
  }
  return customer;
}

async function create(payload) {
  return getStore().createCustomer(payload);
}

async function update(id, payload) {
  return getStore().updateCustomer(id, payload);
}

async function history(id) {
  await get(id);
  return getStore().customerHistory(id);
}

module.exports = { create, get, history, list, searchByPhone, update };
