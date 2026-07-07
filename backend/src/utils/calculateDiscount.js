function calculateDiscount(subtotal, discountType, discountValue) {
  const value = Number(discountValue || 0);
  if (!discountType || value <= 0) {
    return 0;
  }

  if (discountType === "percent") {
    return Math.min(subtotal, Math.round((subtotal * value) / 100));
  }

  return Math.min(subtotal, value);
}

module.exports = { calculateDiscount };
