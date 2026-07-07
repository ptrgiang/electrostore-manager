function pad(value) {
  return String(value).padStart(3, "0");
}

function todayStamp(date = new Date()) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function generateCode(prefix, nextNumber, date = new Date()) {
  return `${prefix}-${todayStamp(date)}-${pad(nextNumber)}`;
}

module.exports = { generateCode };
