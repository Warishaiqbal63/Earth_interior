export function formatPKR(amount: number | null): string {
  if (amount === null || !Number.isFinite(amount)) return "Price on request";
  return `Rs. ${Math.round(amount).toLocaleString("en-US")}`;
}

export function discountPercent(price: number | null, compareAt: number | null): number | null {
  if (!price || !compareAt || compareAt <= price) return null;
  const pct = Math.round(((compareAt - price) / compareAt) * 100);
  return pct > 0 ? pct : null;
}
